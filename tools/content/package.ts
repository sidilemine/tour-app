import { z } from 'zod';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { distance } from '../../src/domain/fixture';

const text = z.string().trim().min(1);
const id = text.regex(/^[a-z0-9][a-z0-9-]*$/);
const coordinate = z.object({ latitude: z.number().finite().min(-85).max(85), longitude: z.number().finite().min(-180).max(180) }).strict();
const date = z.string().date();
const url = z.string().url().refine(value => { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; }, 'Use a public HTTP(S) source URL without credentials');
const review = z.object({ status: z.enum(['unverified', 'desk_checked', 'field_checked', 'stale', 'blocked']), note: text, reviewer: text.nullable(), checkedAt: date.nullable() }).strict().refine(r => !['desk_checked','field_checked'].includes(r.status) || !!(r.reviewer && r.checkedAt), 'Checked assertions need reviewer/date');
const relativePath = text.refine(p => !isAbsolute(p) && !/[\\:%?#\x00-\x1f]/.test(p) && p.split('/').every(part => !!part && part !== '.' && part !== '..'), 'Use a plain relative asset path without traversal, URLs or encoded separators');
const paragraph = z.object({ kind: z.enum(['factual','editorial']), text, claimIds: z.array(id) }).strict().refine(p => p.kind !== 'factual' || p.claimIds.length > 0, 'Factual paragraphs need claims');
export const packageSchema = z.object({
  schemaVersion: z.literal(1), id, contentVersion: z.number().int().positive(), title: text, mode: z.literal('walking'), stage: z.enum(['draft','ready']),
  sources: z.array(z.object({ id, title: text, url, publisher: text, retrievedAt: date, rightsNote: text }).strict()),
  claims: z.array(z.object({ id, statement: text, status: z.enum(['needs_review','source_checked','disputed','rejected']), uncertainty: text,
    supports: z.array(z.object({ sourceId: id, passage: text, locator: text }).strict()) }).strict()),
  stops: z.array(z.object({ id, title: text, landmark: z.object({ name: text, point: coordinate.nullable() }).strict(),
    standing: z.object({ point: coordinate.nullable(), review }).strict(),
    approach: z.object({ instruction: text, review }).strict(), viewpoint: z.object({ description: text, review }).strict(), access: z.object({ description: text, review }).strict(), clipId: id,
  }).strict()).min(3).max(12),
  clips: z.array(z.object({ id, stopId: id, audioAssetId: id.nullable(), transcriptAssetId: id.nullable(), paragraphs: z.array(paragraph).min(1) }).strict()),
  route: z.object({ provider: text.nullable(), generatedAt: date.nullable(), review, geometry: z.array(coordinate),
    legs: z.array(z.object({ fromStopId: id, toStopId: id, startIndex: z.number().int().nonnegative(), endIndex: z.number().int().nonnegative(), directions: z.array(text).min(1), review }).strict()),
  }).strict(),
  map: z.object({ format: z.enum(['maplibre-offline-db','mbtiles','pmtiles','raster-tiles']).nullable(), assetIds: z.array(id), attribution: text.nullable(),
    bounds: z.tuple([z.number().finite(), z.number().finite(), z.number().finite(), z.number().finite()]).nullable(), rendererCheck: review }).strict(),
  assets: z.array(z.object({ id, path: relativePath, kind: z.enum(['audio','transcript','map','image']), bytes: z.number().int().positive().max(500_000_000), sha256: text.regex(/^[a-f0-9]{64}$/), license: text, sourceUrl: url.nullable(), durationSeconds: z.number().finite().positive().nullable() }).strict()),
}).strict();
export type TourPackage = z.infer<typeof packageSchema>;
export type PackageReport = { id: string; stage: 'draft' | 'ready'; ready: boolean; blockers: string[]; verifiedAssets: number };

export function checkPackage(value: unknown, root: string): PackageReport {
  const p = packageSchema.parse(value), blockers: string[] = [];
  const block = (condition: boolean, message: string) => { if (condition) blockers.push(message); };
  function index<T extends { id: string }>(items: T[], label: string) {
    const result = new Map<string,T>();
    for (const item of items) { if (result.has(item.id)) throw Error(`Duplicate ${label}: ${item.id}`); result.set(item.id,item); }
    return result;
  }
  const sources=index(p.sources,'source'), claims=index(p.claims,'claim'), stops=index(p.stops,'stop'), clips=index(p.clips,'clip'), assets=index(p.assets,'asset');
  const requireRef = <T>(map: Map<string,T>, key: string, label: string): T => { const item=map.get(key); if (!item) throw Error(`Missing ${label}: ${key}`); return item; };
  for (const claim of p.claims) {
    block(claim.status !== 'source_checked' || !claim.supports.length, `claim:${claim.id}: evidence needs review`);
    for (const support of claim.supports) requireRef(sources,support.sourceId,'claim source');
  }
  for (const stop of p.stops) {
    const clip=requireRef(clips,stop.clipId,'stop clip');
    if (clip.stopId !== stop.id) throw Error(`Clip/stop mismatch: ${stop.id}`);
    block(!stop.standing.point,`stop:${stop.id}: standing position missing`);
    for (const field of ['standing','approach','viewpoint','access'] as const) block(stop[field].review.status !== 'field_checked',`stop:${stop.id}:${field}: field verification required`);
  }
  for (const clip of p.clips) {
    const stop=requireRef(stops,clip.stopId,'clip stop');
    if (stop.clipId !== clip.id) throw Error(`Orphan clip: ${clip.id}`);
    for (const paragraph of clip.paragraphs) for (const claimId of paragraph.claimIds) requireRef(claims,claimId,'paragraph claim');
    for (const [field,kind] of [['audioAssetId','audio'],['transcriptAssetId','transcript']] as const) {
      const key=clip[field]; block(!key,`clip:${clip.id}: ${kind} asset missing`);
      if (key) { const a=requireRef(assets,key,'clip asset'); if (a.kind !== kind) throw Error(`Wrong ${kind} asset type: ${key}`); block(kind==='audio' && a.durationSeconds===null,`clip:${clip.id}: measured audio duration missing`); }
    }
  }
  block(!p.route.provider || !p.route.generatedAt, 'route: real routing provenance missing');
  block(p.route.review.status !== 'field_checked','route: physical verification required');
  block(p.route.geometry.length < 2,'route: geometry missing');
  block(p.route.legs.length !== p.stops.length-1,'route: one planned leg per stop pair required');
  for (const [i,leg] of p.route.legs.entries()) {
    requireRef(stops,leg.fromStopId,'leg start'); requireRef(stops,leg.toStopId,'leg end');
    if (leg.fromStopId !== p.stops[i]?.id || leg.toStopId !== p.stops[i+1]?.id || leg.startIndex >= leg.endIndex || leg.endIndex >= p.route.geometry.length) throw Error(`Invalid route leg/order: ${i}`);
    if (i && leg.startIndex !== p.route.legs[i-1].endIndex) throw Error(`Disconnected route leg: ${i}`);
    if ((!i && leg.startIndex !== 0) || (i === p.route.legs.length-1 && leg.endIndex !== p.route.geometry.length-1)) throw Error('Route legs must cover the full geometry');
    for (const [stopId,pointIndex] of [[leg.fromStopId,leg.startIndex],[leg.toStopId,leg.endIndex]] as const) {
      const standing=stops.get(stopId)!.standing.point;
      if (standing && distance(standing,p.route.geometry[pointIndex]) > 10) throw Error(`Route endpoint misses standing position: ${stopId}`);
    }
    block(leg.review.status !== 'field_checked',`leg:${i}: directions/access verification required`);
  }
  block(!p.map.format || !p.map.assetIds.length || !p.map.bounds || !p.map.attribution,'map: local map/coverage/attribution missing');
  block(p.map.rendererCheck.status !== 'field_checked','map: offline renderer check required');
  for (const assetId of p.map.assetIds) if (requireRef(assets,assetId,'map asset').kind !== 'map') throw Error(`Wrong map asset type: ${assetId}`);
  if (p.map.bounds) {
    const [west,south,east,north]=p.map.bounds;
    if (west < -180 || east > 180 || south < -85 || north > 85 || west >= east || south >= north) throw Error('Invalid map bounds');
    for (const point of [...p.route.geometry,...p.stops.flatMap(s=>s.standing.point?[s.standing.point]:[])]) if (point.longitude<west || point.longitude>east || point.latitude<south || point.latitude>north) throw Error('Planned route/standing point outside map coverage');
  }
  const base=realpathSync(root), paths=new Set<string>(); let total=0;
  for (const asset of p.assets) {
    const folded=asset.path.toLowerCase(); if (paths.has(folded)) throw Error(`Duplicate asset path: ${asset.path}`); paths.add(folded);
    const target=resolve(base,asset.path), rel=relative(base,target);
    if (rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw Error('Asset escapes package');
    // Reject symlink components (including links that currently point inside).
    let current=base;
    for (const part of asset.path.split('/')) { current=resolve(current,part); if (lstatSync(current).isSymbolicLink()) throw Error(`Symlink in asset path: ${asset.path}`); }
    const stat=lstatSync(target); if (!stat.isFile() || stat.size !== asset.bytes) throw Error(`Asset size/type mismatch: ${asset.id}`);
    total+=stat.size; if (total>750_000_000) throw Error('Prototype package exceeds 750 MB');
    if (createHash('sha256').update(readFileSync(target)).digest('hex') !== asset.sha256) throw Error(`Asset checksum mismatch: ${asset.id}`);
  }
  if (p.stage==='ready' && blockers.length) throw Error(`Package falsely declares ready:\n${blockers.join('\n')}`);
  return { id:p.id, stage:p.stage, ready:blockers.length===0, blockers, verifiedAssets:p.assets.length };
}
export function checkPackageFile(file: string) { return checkPackage(JSON.parse(readFileSync(file,'utf8')),dirname(resolve(file))); }
