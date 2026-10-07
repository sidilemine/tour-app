// Controlled, read-only public evidence tools. Full bodies stay in ignored local-data.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { BlockList, isIP } from 'node:net';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { z } from 'zod';
import { loadLocalMap, localMapQuery, type LocalMapReference, type LocalMapSnapshot } from './local-map';
import { distance, type Coordinate } from '../../../src/domain/fixture';

export const publicRoutingPolicy = {
  checkedAt: '2026-10-07', endpoint: 'https://valhalla1.openstreetmap.de/route',
  api: 'https://valhalla.github.io/valhalla/api/route/api-reference/',
  precision: 'https://valhalla.github.io/valhalla/api/decoding/',
  demoPolicy: 'https://github.com/valhalla/valhalla#demo-server',
  policyExcerpt: 'https://routing.openstreetmap.de/about.html',
  fullPolicy: 'https://www.fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen/',
  limit: 'Identifying user agent, maximum one request per second; no heavy usage or scraping. This adapter spaces route requests by at least 1.1 seconds and caches exact requests.',
  limitation: 'Full German policy returned Anubis Access Denied during inspection; official project README and provider English policy excerpt were read. Personal bounded authoring only, not a production service.',
  attribution: 'Routing: FOSSGIS Valhalla; map data © OpenStreetMap contributors, ODbL',
  copyrightUrl: 'https://www.openstreetmap.org/copyright', fixMapUrl: 'https://www.openstreetmap.org/fixthemap',
};
interface Address { address: string; family: number }
interface ConnectionAttempt extends Address { outcome:'connected'|'failed'; code?:string }
/** Retry a refused/unreachable GET connection once, only on already validated DNS answers. */
export async function tryPinnedAddresses<T>(addresses:Address[],method:string,signal:AbortSignal,connect:(address:Address)=>Promise<T>){
 const choices=addresses.filter((a,i)=>addresses.findIndex(b=>b.address===a.address&&b.family===a.family)===i).slice(0,method==='GET'?2:1);
 assert.ok(choices.length,'Validated address required');const attempts:ConnectionAttempt[]=[];
 for(const [index,address] of choices.entries()){
  signal.throwIfAborted();
  try{const value=await connect(address);attempts.push({...address,outcome:'connected'});return {value,attempts};}
  catch(error){const code=(error as NodeJS.ErrnoException).code;attempts.push({...address,outcome:'failed',...(typeof code==='string'?{code}:{})});
   if(index===choices.length-1||!['ECONNREFUSED','EHOSTUNREACH','ENETUNREACH','ENETDOWN'].includes(code??''))throw error;
  }
 }
 throw Error('No public connection established');
}
export interface PublicToolsOptions {
  directory: string;
  mapEvidence?:LocalMapReference;
  /** Trusted test transport only; production defaults to DNS-pinned native HTTPS. */
  fetch?: typeof globalThis.fetch;
  /** Deterministic DNS seam for tests. Every result is still checked. */
  lookup?: (hostname: string) => Promise<Address[]>;
  /** Synchronous caller deadline/status guard, after rate waits and before each outbound fetch. Cache reads do not dispatch. */
  beforeRequest?: () => void;
  maxBytes?: number;
  timeoutMs?: number;
}
export interface PageResult {
  url: string; finalUrl: string; title: string; text: string; retrievedAt: string;
  hash: string; bodyHash: string; cachePath: string; cacheHit: boolean;
  extraction: 'html-text-v1' | 'plain-text-v1';
  images?: { url: string; alt: string }[];
}
export interface RouteLeg {
  geometry: Coordinate[]; distanceMetres: number; durationSeconds: number;
  maneuvers: { instruction: string; beginShapeIndex: number; endShapeIndex: number; type?: number }[];
}
export interface RouteResult {
  legs: RouteLeg[]; geometry: Coordinate[]; distanceMetres: number; durationSeconds: number;
  provider: string; retrievedAt: string; url: string; hash: string; cachePath: string; cacheHit: boolean;
  requestedPoints: Coordinate[]; provenance: typeof publicRoutingPolicy; physicalClearance: 'unverified';
  routingOptions?: PedestrianRouteOptions;
  throughValidation?: { toleranceMetres: 3; checks: { legIndex: number; throughIndex: number; distanceMetres: number; shapePosition: number }[]; limitation: string };
  composition?: { mode: 'per-tour-leg'; maxLocationsPerRequest: 10; hashBasis: 'ordered-provider-response-hashes'; segments: { legIndex: number; hash: string; cachePath: string; retrievedAt: string }[] };
}
export interface PedestrianRouteOptions {
  /** Exact ordered shaping coordinates per tour leg; they never add story stops or legs. */
  throughByLeg?: Coordinate[][];
  /** Cost preference only: independently verify crossings, access and resulting geometry. */
  preferMappedWalkways?: boolean;
}
export class PublicToolHttpError extends Error {
  constructor(public readonly status:number,public readonly providerCode?:string|number,public readonly providerMessage?:string){
    super(`Public HTTP ${status}${providerCode===undefined?'':` [${providerCode}]`}${providerMessage?`: ${providerMessage}`:''}`);
    this.name='PublicToolHttpError';
  }
}
/** Retain only small structured error fields, never HTML or an unbounded provider body. */
async function publicHttpError(response:Response):Promise<PublicToolHttpError>{
 const mediaType=(response.headers.get('content-type')??'').split(';')[0].trim().toLowerCase();
 if(mediaType!=='application/json'&&!/^application\/[a-z0-9.-]+\+json$/.test(mediaType)){
  await response.body?.cancel();return new PublicToolHttpError(response.status);
 }
 const reader=response.body?.getReader();if(!reader)return new PublicToolHttpError(response.status);
 let code:string|number|undefined,message:string|undefined;
 try{
  const chunks:Uint8Array[]=[];let bytes=0,complete=false;
  for(;;){const chunk=await reader.read();if(chunk.done){complete=true;break;}bytes+=chunk.value.length;if(bytes>2048)break;chunks.push(chunk.value);}
  if(complete){
   const value:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8'));
   if(value&&typeof value==='object'&&!Array.isArray(value)){
    const fields=value as Record<string,unknown>,rawCode=fields.error_code??fields.code,rawMessage=fields.error??fields.message;
    if(typeof rawCode==='number'&&Number.isFinite(rawCode))code=rawCode;
    else if(typeof rawCode==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(rawCode))code=rawCode;
    if(typeof rawMessage==='string')message=rawMessage.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,512)||undefined;
   }
  }
 }catch{/* Unparseable error bodies do not hide the known HTTP status. */}
 finally{try{await reader.cancel();}catch{/* Response may already be closed. */}reader.releaseLock();}
 return new PublicToolHttpError(response.status,code,message);
}
interface ResponseRecord {
  requestUrl: string; method: string; requestBody: string; finalUrl: string;
  connectionAttempts?:ConnectionAttempt[];
  status: number; contentType: string; retrievedAt: string; bodyBase64: string; bodyHash: string;
}
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const blocked = new BlockList();
for (const [ip, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.88.99.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]] as const) blocked.addSubnet(ip, bits, 'ipv4');
const globalV6 = new BlockList(); globalV6.addSubnet('2000::', 3, 'ipv6');
const specialV6 = new BlockList(); specialV6.addSubnet('2001::', 23, 'ipv6'); specialV6.addSubnet('2002::', 16, 'ipv6'); specialV6.addSubnet('3fff::', 20, 'ipv6'); specialV6.addSubnet('2001:db8::', 32, 'ipv6');
function publicAddress(address: string) {
  const family = isIP(address);
  return family === 4 ? !blocked.check(address, 'ipv4') : family === 6 && globalV6.check(address, 'ipv6') && !specialV6.check(address, 'ipv6');
}
function publicUrl(value: string): URL {
  assert.ok(value.length <= 16000, 'URL too long');
  const url = new URL(value), host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  assert.ok(url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443'), 'Only public HTTPS URLs without credentials on port 443');
  assert.ok(host && !host.endsWith('.') && host !== 'localhost' && !/\.(localhost|local|internal|home|lan)$/.test(host), 'Private hostname rejected');
  assert.ok(isIP(host) ? publicAddress(host) : host.includes('.'), 'Private or nonpublic address rejected');
  url.hash = ''; return url;
}
export function normalizeSourceText(text: string) { return text.replace(/\s+/gu, ' ').trim(); }
function entities(text: string) {
  const names: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', pound: '£', copy: '©', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”' };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, key: string) => {
    if (!key.startsWith('#')) return names[key.toLowerCase()] ?? whole;
    const n = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : whole;
  });
}
function htmlText(html: string) {
  const title = normalizeSourceText(entities(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html)?.[1].replace(/<[^>]*>/g, '') ?? ''));
  const body = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript|template|svg|head|title)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<\/?(?:p|div|h[1-6]|li|ul|ol|table|tr|td|th|section|article|header|footer|nav|br|hr|blockquote)\b[^>]*>/gi, ' ').replace(/<[^>]*>/g, '');
  return { title, text: normalizeSourceText(entities(body)) };
}
// Independent of an instance: the single local factory cannot accidentally
// bypass the public-service rate limit by making another tool object.
let routeQueue: Promise<unknown> = Promise.resolve(), lastRouteRequest = 0;
async function routeSlot() {
  const next = routeQueue.then(async () => {
    const wait = Math.max(0, lastRouteRequest + 1100 - Date.now());
    if (wait) await new Promise(r => setTimeout(r, wait));
    lastRouteRequest = Date.now();
  });
  routeQueue = next.catch(() => {}); await next;
}
// Overpass needs a separate, slower single-flight queue. The entire response
// finishes before another request starts, with a two-second quiet interval.
let mapQueue: Promise<unknown> = Promise.resolve(), lastMapCompletion = 0;
async function mapRequest<T>(action: () => Promise<T>): Promise<T> {
  const next = mapQueue.then(async () => {
    const wait = Math.max(0, lastMapCompletion + 2000 - Date.now());
    if (wait) await new Promise(r => setTimeout(r, wait));
    try { return await action(); } finally { lastMapCompletion = Date.now(); }
  });
  mapQueue = next.catch(() => {}); return next;
}
const coordinate = z.object({ latitude: z.number().min(-85).max(85), longitude: z.number().min(-180).max(180) }).strict();
const pedestrianRouteOptions=z.object({throughByLeg:z.array(z.array(coordinate).max(8)).max(15).optional(),preferMappedWalkways:z.boolean().optional()}).strict();
const summary = z.object({ length: z.number().nonnegative(), time: z.number().nonnegative() });
const routeResponse = z.object({ trip: z.object({ status: z.literal(0), units: z.enum(['kilometers', 'km']), summary,
  legs: z.array(z.object({ shape: z.string().min(2).max(1000000), summary,
    maneuvers: z.array(z.object({ instruction: z.string().min(1), begin_shape_index: z.number().int().nonnegative(), end_shape_index: z.number().int().nonnegative(), type: z.number().int().optional() })).min(1) })).min(1).max(15) }) });
/** Valhalla uses polyline6; malformed/truncated coordinates fail closed. */
export function decodePolyline6(shape: string): Coordinate[] {
  let index = 0, lat = 0, lon = 0;
  const points: Coordinate[] = [];
  const delta = () => {
    let total = 0, shift = 0;
    for (;;) {
      assert.ok(index < shape.length && shift <= 30, 'Malformed route polyline');
      const n = shape.charCodeAt(index++) - 63; assert.ok(n >= 0 && n <= 63, 'Malformed route polyline');
      total += (n & 31) * 2 ** shift;
      if (n < 32) return total % 2 ? -(Math.floor(total / 2) + 1) : total / 2;
      shift += 5;
    }
  };
  while (index < shape.length) {
    lat += delta(); lon += delta();
    points.push(coordinate.parse({ latitude: lat / 1e6, longitude: lon / 1e6 }));
    assert.ok(points.length <= 10000, 'Route geometry exceeds local limit');
  }
  assert.ok(points.length >= 2, 'Route leg needs at least two points'); return points;
}

/** Test actual returned segments, never insert or move geometry to satisfy a constraint. */
function verifyThroughPoints(legs:RouteLeg[],throughByLeg:Coordinate[][]):NonNullable<RouteResult['throughValidation']>{
 const checks:NonNullable<RouteResult['throughValidation']>['checks']=[];
 const longitudeDelta=(a:number,b:number)=>((b-a+540)%360)-180;
 for(const [legIndex,points]of throughByLeg.entries()){
  let previous=-1;
  for(const [throughIndex,point]of points.entries()){
   const projections=legs[legIndex].geometry.slice(1).map((b,index)=>{
    const a=legs[legIndex].geometry[index],scale=Math.cos(point.latitude*Math.PI/180);
    const dx=longitudeDelta(a.longitude,b.longitude)*scale,dy=b.latitude-a.latitude;
    const px=longitudeDelta(a.longitude,point.longitude)*scale,py=point.latitude-a.latitude;
    const t=dx*dx+dy*dy?Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy))):0;
    const longitude=((a.longitude+longitudeDelta(a.longitude,b.longitude)*t+540)%360)-180;
    return {shapePosition:index+t,distanceMetres:distance(point,{latitude:a.latitude+dy*t,longitude})};
   });
   const minimum=Math.min(...projections.map(p=>p.distanceMetres));
   assert.ok(minimum<=3,`Through point ${throughIndex} on leg ${legIndex} missed by returned geometry (${minimum.toFixed(2)}m)`);
   // A loop may visit a coordinate repeatedly. Preserve the earliest nearest
   // visit after the preceding constraint, not a merely nearby earlier segment.
   const match=projections.find(p=>p.distanceMetres<=minimum+1e-6&&p.shapePosition>=previous);
   assert.ok(match,`Through points out of order on leg ${legIndex}`);
   previous=match.shapePosition;checks.push({legIndex,throughIndex,...match});
  }
 }
 return {toleranceMetres:3,checks,limitation:'Ordered proximity to returned route geometry only; does not establish public access, crossing safety or current clearance.'};
}

export class PublicTools {
  private directory: string;
  private localMap?:LocalMapSnapshot;
  private maxBytes: number;
  private timeoutMs: number;
  private connectionAttempts=new WeakMap<Response,ConnectionAttempt[]>();
  constructor(private options: PublicToolsOptions) {
    const base = resolve('local-data'); this.directory = resolve(options.directory);
    const rel = relative(base, this.directory);
    assert.ok(rel && !rel.startsWith('..') && !rel.startsWith('/'), 'Full-response cache must be under ignored repository local-data/');
    this.maxBytes = options.maxBytes ?? 2_000_000; this.timeoutMs = options.timeoutMs ?? 20000;
    assert.ok(Number.isInteger(this.maxBytes) && this.maxBytes > 0 && this.maxBytes <= 5_000_000, 'Bounded maxBytes required');
    assert.ok(Number.isFinite(this.timeoutMs) && this.timeoutMs > 0 && this.timeoutMs <= 60000, 'Bounded timeout required');
  }
  private async addresses(url: URL): Promise<Address[]> {
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await (this.options.lookup ?? (h => lookup(h, { all: true })))(host);
    assert.ok(addresses.length && addresses.every(a => publicAddress(a.address)), 'DNS resolved to private or nonpublic address');
    return addresses;
  }
  private async fetchPinned(url: URL, addresses: Address[], method: string, body: string, signal: AbortSignal): Promise<Response> {
    const headers = { 'user-agent': 'TourLocalAuthoring/1.0 (personal offline-tour preparation)', 'x-client-id': 'tour-local-authoring',
      accept: 'text/html, text/plain, application/json, image/jpeg, image/png', 'accept-encoding': 'identity', ...(body ? { 'content-type': 'application/json' } : {}) };
    if (this.options.fetch) return this.options.fetch(url.href, { method, body: body || undefined, headers, redirect: 'manual', signal, credentials: 'omit' });
    // Pin the already validated address in the actual TLS connection, preserving
    // hostname/certificate validation; DNS rebinding cannot target the LAN.
    const connected=await tryPinnedAddresses(addresses,method,signal,selected=>{
     this.options.beforeRequest?.();
     return new Promise<Response>((done,reject)=>{
      const req = httpsRequest(url, { method, headers, signal, family: selected.family,
        lookup: (_host, _opts, callback) => callback(null, selected.address, selected.family) }, response => {
        const chunks: Buffer[] = []; let bytes = 0;
        response.on('data', (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > this.maxBytes) { req.destroy(new Error('Response exceeds byte limit')); return; }
          chunks.push(chunk);
        });
        response.on('error', reject);
        response.on('end', () => {
          const h = new Headers();
          for (const [key, value] of Object.entries(response.headers)) if (value !== undefined) h.set(key, Array.isArray(value) ? value.join(', ') : value);
          const status = response.statusCode ?? 500;
          done(new Response([204, 205, 304].includes(status) ? null : Buffer.concat(chunks), { status, headers: h }));
        });
      });
      req.on('error', reject); req.end(body || undefined);
     });
    });
    this.connectionAttempts.set(connected.value,connected.attempts);return connected.value;
  }
  private async retrieve(value: string, method = 'GET', body = '', route = false, map = false) {
    const initial = publicUrl(value), key = sha(JSON.stringify([initial.href, method, body]));
    const cachePath = join(this.directory, `${key}.json`);
    try {
      const saved = JSON.parse(await readFile(cachePath, 'utf8')) as ResponseRecord;
      assert.equal(saved.requestUrl, initial.href); assert.equal(saved.method, method); assert.equal(saved.requestBody, body);
      publicUrl(saved.finalUrl);
      assert.equal(sha(Buffer.from(saved.bodyBase64, 'base64')), saved.bodyHash, 'Cached response integrity');
      return { saved, cachePath, cacheHit: true };
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('Public request timed out')); }, this.timeoutMs); });
    const operation = async () => {
      let url = initial;
      for (let redirects = 0; redirects <= 4; redirects++) {
        const addresses = await this.addresses(url);
        if (route) await routeSlot();
        controller.signal.throwIfAborted();
        this.options.beforeRequest?.();
        const response = await this.fetchPinned(url, addresses, method, body, controller.signal);
        assert.ok(!response.redirected, 'Transport followed an unchecked redirect');
        if (response.status >= 300 && response.status < 400) {
          await response.body?.cancel();
          assert.ok(response.headers.get('location'), 'Redirect without destination');
          assert.ok(method === 'GET', 'Route redirects rejected; no coordinate forwarding');
          url = publicUrl(new URL(response.headers.get('location')!, url).href); continue;
        }
        if(!response.ok)throw await publicHttpError(response);
        assert.ok(!response.headers.get('content-encoding') || response.headers.get('content-encoding') === 'identity', 'Compressed response unsupported');
        assert.ok(Number(response.headers.get('content-length') ?? 0) <= this.maxBytes, 'Response exceeds byte limit');
        const reader = response.body?.getReader(), chunks: Uint8Array[] = []; let size = 0;
        if (reader) for (;;) {
          const chunk = await reader.read(); if (chunk.done) break;
          size += chunk.value.length;
          if (size > this.maxBytes) { await reader.cancel(); throw Error('Response exceeds byte limit'); }
          chunks.push(chunk.value);
        }
        const bytes = Buffer.concat(chunks);
        const saved: ResponseRecord = { ...(this.connectionAttempts.has(response)?{connectionAttempts:this.connectionAttempts.get(response)}:{}),requestUrl: initial.href, method, requestBody: body, finalUrl: url.href, status: response.status,
          contentType: response.headers.get('content-type') ?? '', retrievedAt: new Date().toISOString(), bodyBase64: bytes.toString('base64'), bodyHash: sha(bytes) };
        return saved;
      }
      throw Error('Too many public redirects');
    };
    let saved: ResponseRecord;
    try { saved = await Promise.race([map ? mapRequest(operation) : operation(), timeout]); }
    finally { clearTimeout(timer!); controller.abort(); }
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const pending = `${cachePath}.${randomUUID()}.tmp`;
    await writeFile(pending, JSON.stringify(saved) + '\n', { mode: 0o600 }); await rename(pending, cachePath);
    return { saved, cachePath, cacheHit: false };
  }
  async readPage(url: string): Promise<PageResult> {
    const { saved, cachePath, cacheHit } = await this.retrieve(url);
    const raw = Buffer.from(saved.bodyBase64, 'base64').toString('utf8');
    const html = /^(text\/html|application\/xhtml\+xml)(;|$)/i.test(saved.contentType);
    assert.ok(html || /^text\/plain(;|$)/i.test(saved.contentType), 'Unsupported page type; only HTML or plain text is extracted');
    const extracted = html ? htmlText(raw) : { title: new URL(saved.finalUrl).hostname, text: normalizeSourceText(raw) };
    assert.ok(extracted.text.length, 'No readable source text');
    const images: { url: string; alt: string }[] = [];
    if (html) for (const match of raw.matchAll(/<(?:img|meta)\b[^>]*>/gi)) {
      const attrs = new Map([...match[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(a => [a[1].toLowerCase(), entities(a[3])]));
      const src = /^<img/i.test(match[0]) ? attrs.get('src') : attrs.get('property') === 'og:image' ? attrs.get('content') : undefined;
      if (!src) continue;
      try { const imageUrl = publicUrl(new URL(src, saved.finalUrl).href).href;
        if (!images.some(i => i.url === imageUrl) && images.length < 8) images.push({ url: imageUrl, alt: normalizeSourceText(attrs.get('alt') ?? '') });
      } catch { /* Image discovery never authorizes private/non-HTTPS retrieval. */ }
    }
    return { url: saved.requestUrl, finalUrl: saved.finalUrl, ...extracted, images, retrievedAt: saved.retrievedAt,
      hash: sha(extracted.text), bodyHash: saved.bodyHash, cachePath, cacheHit, extraction: html ? 'html-text-v1' : 'plain-text-v1' };
  }
  /** Actual image bytes for a vision-capable caller; retrieval alone is not image inspection. */
  async readImage(url: string) {
    const { saved, cachePath, cacheHit } = await this.retrieve(url);
    const bytes = Buffer.from(saved.bodyBase64, 'base64');
    assert.ok(bytes.length <= 2_000_000, 'Image exceeds two-megabyte limit');
    const mimeType = saved.contentType.split(';')[0].trim().toLowerCase();
    const png = bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) && bytes.subarray(12, 16).toString() === 'IHDR';
    const jpeg = bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9;
    assert.ok((mimeType === 'image/png' && png) || (mimeType === 'image/jpeg' && jpeg), 'Expected actual JPEG or PNG image bytes');
    if (png) assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0 && bytes.readUInt32BE(16) * bytes.readUInt32BE(20) <= 40_000_000, 'Image dimensions exceed inspection limit');
    return { url: saved.requestUrl, finalUrl: saved.finalUrl, retrievedAt: saved.retrievedAt, hash: saved.bodyHash,
      mimeType: mimeType as 'image/jpeg' | 'image/png', image: { mimeType: mimeType as 'image/jpeg' | 'image/png', dataUrl: `data:${mimeType};base64,${saved.bodyBase64}`, sha256: saved.bodyHash }, cachePath, cacheHit,
      inspection: 'pending' as const, captureDate: null, physicalClearance: 'unverified' as const };
  }
  /** Small read-only OSM snapshot, never a public-access or safe-standing certification. */
  async mapFeatures(center: Coordinate, radius: number) {
    return this.mapSnapshot(center, radius, false);
  }
  /** Separate route-phase tool: station identity/entrances, not ordinary doorway discovery. */
  async transportFeatures(center: Coordinate, radius: number) {
    return this.mapSnapshot(center, radius, true);
  }
  /** Separate route-phase tool for crossing evidence, retaining current-access uncertainty. */
  async crossingFeatures(center: Coordinate, radius: number) {
    return this.mapSnapshot(center, radius, false, true);
  }
  private async mapSnapshot(center: Coordinate, radius: number, transport: boolean, crossing = false) {
    coordinate.parse(center); assert.ok(Number.isFinite(radius) && radius > 0 && radius <= 250, 'Map feature radius must be within 250 metres');
    if(this.options.mapEvidence){this.localMap??=loadLocalMap(this.options.mapEvidence);return localMapQuery(this.localMap,this.options.mapEvidence,center,radius,transport,crossing);}
    const around = `(around:${radius},${center.latitude},${center.longitude})`;
    // Never expand relations: a named relation touching this radius can contain
    // an entire district or park. Clip long way geometry to the local box too.
    const latitudeSpan = radius / 111195;
    const longitudeSpan = radius / (111195 * Math.cos(center.latitude * Math.PI / 180));
    const geometryBox = [center.latitude - latitudeSpan, center.longitude - longitudeSpan,
      center.latitude + latitudeSpan, center.longitude + longitudeSpan].join(',');
    const roadTypes = ['trunk', 'primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'service', 'living_street', 'pedestrian'];
    // Declare a small resource envelope: Overpass otherwise reserves its512MiB default,
    // which can cause504 admission failures even for these bounded local queries.
    const query = transport
      ? `[out:json][timeout:12][maxsize:33554432];(node${around}[railway~"^(station|subway_entrance)$"];way${around}[railway~"^(station|subway_entrance)$"];node${around}[building=train_station];way${around}[building=train_station];);out body center geom(${geometryBox}) 200;`
      : crossing
        ? `[out:json][timeout:12][maxsize:33554432];(node${around}[highway=crossing];way${around}[footway=crossing];way${around}[highway=footway];way${around}[highway~"^(${roadTypes.join('|')})$"];);out body center geom(${geometryBox}) 200;`
        : `[out:json][timeout:12][maxsize:33554432];(node${around}[name];way${around}[name];way${around}[highway];node${around}[entrance];node${around}[barrier];way${around}[barrier];way${around}[building];node${around}[access];way${around}[access];);out body center geom(${geometryBox}) 200;`;
    const requestUrl = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
    const { saved, cachePath, cacheHit } = await this.retrieve(requestUrl, 'GET', '', false, true);
    const point = z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) });
    const parsed = z.object({ remark: z.string().optional(), osm3s: z.object({ timestamp_osm_base: z.string().optional() }).optional(), elements: z.array(z.object({
      type: z.enum(['node', 'way']), id: z.number().int().positive(), tags: z.record(z.string(), z.string()).optional(),
      lat: z.number().optional(), lon: z.number().optional(), center: point.optional(), geometry: z.array(point.nullable()).optional(),
    })).max(200) }).parse(JSON.parse(Buffer.from(saved.bodyBase64, 'base64').toString('utf8')));
    assert.ok(!parsed.remark, `Overpass returned an incomplete/error response: ${parsed.remark}`);
    const eligible = transport ? parsed.elements.filter(e => e.tags?.railway === 'station' || e.tags?.railway === 'subway_entrance' || e.tags?.building === 'train_station')
      : crossing ? parsed.elements.filter(e => e.tags?.highway === 'crossing' || e.tags?.footway === 'crossing' || e.tags?.highway === 'footway' || (e.type === 'way' && roadTypes.includes(e.tags?.highway ?? '')))
        : parsed.elements;
    const priority = (e: typeof parsed.elements[number]) => transport
      ? e.tags?.railway === 'station' ? 0 : e.tags?.building === 'train_station' ? 1 : 2
      : crossing ? e.tags?.highway === 'crossing' ? 0 : e.tags?.footway === 'crossing' ? 1 : e.tags?.highway === 'footway' ? 2 : 3
        : e.tags?.entrance ? 0 : e.tags?.highway ? 1 : e.tags?.name ? 2 : e.tags?.barrier ? 3 : e.tags?.access ? 4 : 5;
    const candidates = eligible.sort((a, b) => priority(a) - priority(b)).slice(0, 60).map(e => ({ ...e,
      ...(e.geometry ? { geometry: e.geometry.slice(0, 100), geometryTruncated: e.geometry.length > 100 } : {}) }));
    const elements: typeof candidates = [];
    for (const feature of candidates) {
      if (JSON.stringify([...elements, feature]).length > 24000) break;
      elements.push(feature);
    }
    const text = normalizeSourceText('OpenStreetMap mapped features only; current public access, safe standing and visibility are unverified. ' + JSON.stringify(elements));
    return { url: 'https://overpass-api.de/api/interpreter#query-' + sha(query), requestUrl, text, elements,
      ...(saved.connectionAttempts?{connectionAttempts:saved.connectionAttempts}:{}),hash: sha(text), bodyHash: saved.bodyHash, retrievedAt: saved.retrievedAt, mapDataAt: parsed.osm3s?.timestamp_osm_base ?? null,
      cachePath, cacheHit, query, queryLimit: 200, queryLimitReached: parsed.elements.length === 200,
      ...(transport ? { focus: 'transport' as const, excludedNonTransportCount: parsed.elements.length - eligible.length } : {}),
      ...(crossing ? { focus: 'crossing' as const, excludedUnrelatedCount: parsed.elements.length - eligible.length } : {}),
      returnedCount: parsed.elements.length, selectedCount: elements.length,
      geometryClippedToQueryBox: true, truncated: parsed.elements.length === 200 || parsed.elements.length > elements.length || elements.some(e => e.geometryTruncated),
      attribution: '© OpenStreetMap contributors, ODbL; Overpass API', physicalClearance: 'unverified' as const };
  }
  async pedestrianRoute(points: Coordinate[], options?: PedestrianRouteOptions): Promise<RouteResult> {
    const requestedPoints = z.array(coordinate).min(2).max(16).parse(points);
    const routingOptions=options===undefined?undefined:pedestrianRouteOptions.parse(options);
    if(routingOptions?.throughByLeg){
      assert.equal(routingOptions.throughByLeg.length,requestedPoints.length-1,'One through-point list per tour leg');
      assert.ok(routingOptions.throughByLeg.reduce((n,leg)=>n+leg.length,0)<=32,'At most32 through points per route');
    }
    const locations=requestedPoints.flatMap((p,index)=>[
      {lat:p.latitude,lon:p.longitude,type:'break'},
      ...(routingOptions?.throughByLeg?.[index]??[]).map(through=>({lat:through.latitude,lon:through.longitude,type:'through',node_snap_tolerance:1})),
    ]);
    const body = JSON.stringify({ locations,
      costing: 'pedestrian', costing_options: { pedestrian: { walking_speed: 4.5,...(routingOptions?.preferMappedWalkways?{walkway_factor:0.3,sidewalk_factor:0.3}:{}) } }, units: 'kilometers', language: 'en-GB', shape_format: 'polyline6' });
    // Observed FOSSGIS error150 limits each request to10 locations. Preserve
    // tour legs and constraints by routing each leg sequentially, never dropping
    // waypoints. Each component uses the normal shared rate limit and cache.
    if(locations.length>10){
      assert.ok(requestedPoints.length-1<=7,'At most7 tour legs may use split public routing');
      const parts:RouteResult[]=[];
      for(let index=0;index<requestedPoints.length-1;index++)parts.push(await this.pedestrianRoute(requestedPoints.slice(index,index+2),{
        ...(routingOptions?.throughByLeg?{throughByLeg:[routingOptions.throughByLeg[index]]}:{}),
        ...(routingOptions?.preferMappedWalkways===undefined?{}:{preferMappedWalkways:routingOptions.preferMappedWalkways}),
      }));
      const legs=parts.map(part=>part.legs[0]);
      for(let index=1;index<legs.length;index++)assert.deepEqual(legs[index-1].geometry.at(-1),legs[index].geometry[0],'Disconnected split routed legs');
      const throughValidation=routingOptions?.throughByLeg?verifyThroughPoints(legs,routingOptions.throughByLeg):undefined;
      const segments=parts.map((part,legIndex)=>({legIndex,hash:part.hash,cachePath:part.cachePath,retrievedAt:part.retrievedAt}));
      // The last leg may come from an older cache than a revised middle leg.
      // Keep retrieval provenance stable on recomposition; it is not assembly time.
      const retrievedAt=parts.reduce((latest,part)=>Date.parse(part.retrievedAt)>Date.parse(latest)?part.retrievedAt:latest,parts[0].retrievedAt);
      const hash=sha(JSON.stringify(parts.map(part=>part.hash))),cachePath=join(this.directory,`route-composition-${sha(body)}.json`);
      const composition:NonNullable<RouteResult['composition']>={mode:'per-tour-leg',maxLocationsPerRequest:10,hashBasis:'ordered-provider-response-hashes',segments};
      const manifest={schemaVersion:1,requestedPoints,routingOptions:routingOptions??{},hash,composition};
      try{assert.deepEqual(JSON.parse(await readFile(cachePath,'utf8')),manifest,'Combined route manifest integrity');}
      catch(error){
        if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;
        await mkdir(this.directory,{recursive:true,mode:0o700});const temporary=cachePath+'.'+randomUUID()+'.tmp';await writeFile(temporary,JSON.stringify(manifest,null,2)+'\n',{mode:0o600});await rename(temporary,cachePath);
      }
      return {legs,geometry:legs.flatMap((leg,index)=>index?leg.geometry.slice(1):leg.geometry),distanceMetres:parts.reduce((n,part)=>n+part.distanceMetres,0),durationSeconds:parts.reduce((n,part)=>n+part.durationSeconds,0),provider:'FOSSGIS public Valhalla',retrievedAt,url:publicRoutingPolicy.endpoint,hash,cachePath,cacheHit:parts.every(part=>part.cacheHit),requestedPoints,provenance:publicRoutingPolicy,physicalClearance:'unverified',...(routingOptions?{routingOptions}:{}),...(throughValidation?{throughValidation}:{}),composition};
    }
    const { saved, cachePath, cacheHit } = await this.retrieve(publicRoutingPolicy.endpoint, 'POST', body, true);
    const response = routeResponse.parse(JSON.parse(Buffer.from(saved.bodyBase64, 'base64').toString('utf8')));
    assert.equal(response.trip.legs.length, requestedPoints.length - 1, 'One returned leg per waypoint pair');
    const legs = response.trip.legs.map(leg => {
      const geometry = decodePolyline6(leg.shape);
      const maneuvers = leg.maneuvers.map(m => {
        assert.ok(m.begin_shape_index <= m.end_shape_index && m.end_shape_index < geometry.length, 'Maneuver outside leg geometry');
        return { instruction: m.instruction, beginShapeIndex: m.begin_shape_index, endShapeIndex: m.end_shape_index, ...(m.type === undefined ? {} : { type: m.type }) };
      });
      return { geometry, distanceMetres: leg.summary.length * 1000, durationSeconds: leg.summary.time, maneuvers };
    });
    const geometry = legs.flatMap((leg, i) => i ? leg.geometry.slice(1) : leg.geometry);
    for (let i = 1; i < legs.length; i++) assert.deepEqual(legs[i - 1].geometry.at(-1), legs[i].geometry[0], 'Disconnected routed legs');
    const throughValidation=routingOptions?.throughByLeg?verifyThroughPoints(legs,routingOptions.throughByLeg):undefined;
    return { legs, geometry, distanceMetres: response.trip.summary.length * 1000, durationSeconds: response.trip.summary.time,
      provider: 'FOSSGIS public Valhalla', retrievedAt: saved.retrievedAt, url: saved.finalUrl, hash: saved.bodyHash, cachePath, cacheHit,
      requestedPoints, provenance: publicRoutingPolicy, physicalClearance: 'unverified',...(routingOptions?{routingOptions}:{}),...(throughValidation?{throughValidation}:{}) };
  }
}
