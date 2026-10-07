import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PublicTools, PublicToolHttpError, decodePolyline6, normalizeSourceText, publicRoutingPolicy, type PublicToolsOptions, type PedestrianRouteOptions } from '../tools/generation/factory/public-tools';
import type { Coordinate } from '../src/domain/fixture';

async function setup(t: TestContext, fetch: typeof globalThis.fetch, extra: Partial<PublicToolsOptions> = {}) {
  await mkdir('local-data', { recursive: true });
  const directory = await mkdtemp(resolve('local-data/public-tools-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return new PublicTools({ directory, fetch, lookup: async () => [{ address: '93.184.216.34', family: 4 }], ...extra });
}
function response(body: string, type = 'text/html') { return new Response(body, { headers: { 'content-type': type } }); }

test('public page extraction preserves source wording and exact normalized passage, caches original privately', async t => {
  let calls = 0;
  const html = '<html><head><title>A &amp; B</title><script>secret()</script></head><body><h1>A title</h1><p>Exact &ldquo;quoted&rdquo;\n source <b>words</b>.</p><script>ignore me</script><!-- comment --></body></html>';
  const tools = await setup(t, async () => { calls++; return response(html); });
  const page = await tools.readPage('https://example.com/source');
  assert.equal(page.title, 'A & B');
  assert.equal(page.text, 'A title Exact “quoted” source words.');
  assert.ok(!page.text.includes('secret')); assert.ok(!page.text.includes('ignore'));
  const cached = await tools.readPage('https://example.com/source');
  assert.equal(calls, 1); assert.equal(cached.cacheHit, true); assert.equal(cached.retrievedAt, page.retrievedAt); assert.equal(cached.hash, page.hash);
  const raw = JSON.parse(await readFile(page.cachePath, 'utf8'));
  assert.equal(Buffer.from(raw.bodyBase64, 'base64').toString(), html);
  assert.equal((await stat(page.cachePath)).mode & 0o777, 0o600);
  raw.bodyBase64 = Buffer.from('changed response').toString('base64'); await writeFile(page.cachePath, JSON.stringify(raw));
  await assert.rejects(tools.readPage('https://example.com/source'), /Cached response integrity/);
});

test('normalizes whitespace without paraphrasing and decodes numeric entities', async t => {
  const tools = await setup(t, async () => response('<title>Notes</title><p>Caf&#233; &#x2014; two\t words.</p>'));
  assert.equal((await tools.readPage('https://example.com/numeric')).text, 'Café — two words.');
  assert.equal(normalizeSourceText(' a\n b\t c '), 'a b c');
});

test('private/file/credential/non-HTTPS URL variants are rejected before transport', async t => {
  let calls = 0;
  const tools = await setup(t, async () => { calls++; return response('Never'); });
  for (const url of ['file:///etc/passwd', 'http://example.com/', 'https://user:pass@example.com/', 'https://example.com:444/',
    'https://127.0.0.1/', 'https://2130706433/', 'https://0x7f000001/', 'https://[::1]/', 'https://[2001:db8::1]/', 'https://[::ffff:127.0.0.1]/',
    'https://10.0.0.1/', 'https://169.254.169.254/', 'https://192.168.1.1/', 'https://100.64.0.1/', 'https://localhost/', 'https://printer.local/', 'https://internal/']) {
    await assert.rejects(tools.readPage(url), { name: 'AssertionError' }, url);
  }
  assert.equal(calls, 0);
});

test('DNS private addresses and mixed public/private answers fail closed', async t => {
  let calls = 0;
  for (const addresses of [[{ address: '127.0.0.1', family: 4 }], [{ address: '93.184.216.34', family: 4 }, { address: '10.0.0.1', family: 4 }]]) {
    const tools = await setup(t, async () => { calls++; return response('Never'); }, { lookup: async () => addresses });
    await assert.rejects(tools.readPage('https://example.com/'), /DNS resolved/);
  }
  assert.equal(calls, 0);
});

test('redirects validate each destination, retain final URL and have a finite limit', async t => {
  const urls: string[] = [];
  const tools = await setup(t, async url => {
    urls.push(String(url));
    return urls.length === 1 ? new Response(null, { status: 302, headers: { location: '/final' } }) : response('<title>Final</title><p>Actual source.</p>');
  });
  const page = await tools.readPage('https://example.com/start'); assert.equal(page.finalUrl, 'https://example.com/final'); assert.equal(urls.length, 2);
  let calls = 0;
  const unsafe = await setup(t, async () => { calls++; return new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/private' } }); });
  await assert.rejects(unsafe.readPage('https://example.com/start')); assert.equal(calls, 1);
  const loop = await setup(t, async () => new Response(null, { status: 302, headers: { location: '/loop' } }));
  await assert.rejects(loop.readPage('https://example.com/loop'), /Too many/);
});

test('byte limits, timeout, HTTP failure and unsupported PDF are explicit failures', async t => {
  const large = await setup(t, async () => response('x'.repeat(100)), { maxBytes: 10 });
  await assert.rejects(large.readPage('https://example.com/large'), /byte limit/);
  const stalled = await setup(t, async () => new Promise(() => {}), { timeoutMs: 10 });
  await assert.rejects(stalled.readPage('https://example.com/stalled'), /timed out/);
  const failure = await setup(t, async () => new Response('limited', { status: 429 }));
  await assert.rejects(failure.readPage('https://example.com/failure'), /HTTP 429/);
  const pdf = await setup(t, async () => response('%PDF-1.7', 'application/pdf'));
  await assert.rejects(pdf.readPage('https://example.com/doc.pdf'), /Unsupported page type/);
});

test('public HTTP errors preserve bounded JSON diagnostics, discard HTML/oversized bodies and cancel unread streams',async t=>{
 const tools=await setup(t,async()=>Response.json({error_code:150,error:'Exceeded max locations\nfor pedestrian',ignored:'Never export other fields'},{status:400}));
 await assert.rejects(tools.readPage('https://example.com/json-error'),(error:unknown)=>{
  assert.ok(error instanceof PublicToolHttpError);assert.equal(error.status,400);assert.equal(error.providerCode,150);assert.equal(error.providerMessage,'Exceeded max locations for pedestrian');assert.match(error.message,/Public HTTP 400/);assert.ok(!error.message.includes('Never export'));return true;
 });
 for(const contentType of ['text/html','application/json']){
  let cancelled=false;
  const body=contentType==='text/html'?'<html>Upstream secret debug body</html>':JSON.stringify({error_code:151,error:'x'.repeat(3000)});
  const bounded=await setup(t,async()=>new Response(new ReadableStream({start(controller){controller.enqueue(Buffer.from(body));},cancel(){cancelled=true;}}),{status:400,headers:{'content-type':contentType}}));
  await assert.rejects(bounded.readPage('https://example.com/bounded-error'),(error:unknown)=>{
   assert.ok(error instanceof PublicToolHttpError);assert.equal(error.message,'Public HTTP 400');assert.equal(error.providerMessage,undefined);assert.equal(error.providerCode,undefined);return true;
  });assert.equal(cancelled,true);
 }
 const malformed=await setup(t,async()=>new Response('not JSON',{status:429,headers:{'content-type':'application/json'}}));
 await assert.rejects(malformed.readPage('https://example.com/malformed-error'),(error:unknown)=>error instanceof PublicToolHttpError&&error.message==='Public HTTP 429');
});

const shape = 'e~epoA|jfpOiDaK'; // Official Valhalla polyline6 decoder example, not an authored tour.
const points = [{ latitude: 42.225139, longitude: -8.670911 }, { latitude: 42.225224, longitude: -8.670718 }];
function routeBody() {
  return { trip: { status: 0, units: 'kilometers', summary: { length: 0.02, time: 16 }, legs: [{ shape,
    summary: { length: 0.02, time: 16 }, maneuvers: [{ instruction: 'Walk on the path.', begin_shape_index: 0, end_shape_index: 1, type: 1 }] }] } };
}

test('pedestrian route retains actual polyline6, maneuver indices, request and provider provenance', async t => {
  let calls = 0;
  const tools = await setup(t, async (url, options) => {
    calls++; assert.equal(String(url), publicRoutingPolicy.endpoint); assert.equal(options?.method, 'POST'); assert.equal(options?.redirect, 'manual');
    const payload = JSON.parse(String(options?.body)); assert.equal(payload.costing, 'pedestrian'); assert.equal(payload.units, 'kilometers');
    assert.deepEqual(payload,{locations:points.map(p=>({lat:p.latitude,lon:p.longitude,type:'break'})),costing:'pedestrian',costing_options:{pedestrian:{walking_speed:4.5}},units:'kilometers',language:'en-GB',shape_format:'polyline6'},'Default request remains byte-equivalent in structure and property order');
    assert.deepEqual(payload.locations.map((p: { lat: number; lon: number }) => ({ latitude: p.lat, longitude: p.lon })), points);
    assert.ok(new Headers(options?.headers).get('user-agent')); assert.ok(new Headers(options?.headers).get('x-client-id'));
    return response(JSON.stringify(routeBody()), 'application/json');
  });
  const route = await tools.pedestrianRoute(points);
  assert.deepEqual(route.geometry, points); assert.equal(route.distanceMetres, 20); assert.equal(route.durationSeconds, 16);
  assert.deepEqual(route.legs[0].maneuvers[0], { instruction: 'Walk on the path.', beginShapeIndex: 0, endShapeIndex: 1, type: 1 });
  assert.equal(route.physicalClearance, 'unverified'); assert.equal(route.provenance.fixMapUrl, 'https://www.openstreetmap.org/fixthemap');
  assert.equal((await tools.pedestrianRoute(points)).cacheHit, true); assert.equal(calls, 1);
});

function encodeRoute(points:Coordinate[]){
 let lat=0,lon=0,result='';
 for(const p of points)for(const [key,old]of [['latitude',lat],['longitude',lon]] as const){
  const value=Math.round(p[key]*1e6),change=value-old;let n=change<0?-change*2-1:change*2;
  while(n>=32){result+=String.fromCharCode((n%32)+95);n=Math.floor(n/32);}result+=String.fromCharCode(n+63);
  if(key==='latitude')lat=value;else lon=value;
 }
 return result;
}
function routedGeometry(legs:Coordinate[][]){return {trip:{status:0,units:'kilometers',summary:{length:1,time:800},legs:legs.map(geometry=>({shape:encodeRoute(geometry),summary:{length:1/legs.length,time:800/legs.length},maneuvers:[{instruction:'Synthetic complete path.',begin_shape_index:0,end_shape_index:geometry.length-1}]}))}};}

test('through constraints preserve tour legs, constrain ordered real segments and have separate request cache identity',async t=>{
 const a={latitude:51.55,longitude:-0.17},b={latitude:51.55,longitude:-0.169},c={latitude:51.55,longitude:-0.168};
 const nearA={latitude:51.55,longitude:-0.1698},nearB={latitude:51.55,longitude:-0.1692},secondLeg={latitude:51.55,longitude:-0.1685};
 const payloads:Record<string,unknown>[]=[];
 const tools=await setup(t,async(_url,request)=>{payloads.push(JSON.parse(String(request?.body)));return Response.json(routedGeometry([[a,b],[b,c]]));});
 const baseline=await tools.pedestrianRoute([a,b,c]);assert.equal(baseline.routingOptions,undefined);
 const options={throughByLeg:[[nearA,nearB],[secondLeg]],preferMappedWalkways:true};
 const route=await tools.pedestrianRoute([a,b,c],options);
 assert.equal(route.legs.length,2);assert.deepEqual(route.requestedPoints,[a,b,c]);assert.deepEqual(route.geometry,[a,b,c],'No inserted through vertices or fabricated geometry');
 assert.deepEqual(payloads[1].locations,[{lat:a.latitude,lon:a.longitude,type:'break'},{lat:nearA.latitude,lon:nearA.longitude,type:'through',node_snap_tolerance:1},{lat:nearB.latitude,lon:nearB.longitude,type:'through',node_snap_tolerance:1},{lat:b.latitude,lon:b.longitude,type:'break'},{lat:secondLeg.latitude,lon:secondLeg.longitude,type:'through',node_snap_tolerance:1},{lat:c.latitude,lon:c.longitude,type:'break'}]);
 assert.deepEqual(payloads[1].costing_options,{pedestrian:{walking_speed:4.5,walkway_factor:0.3,sidewalk_factor:0.3}});
 assert.deepEqual(route.routingOptions,options);assert.notEqual(route.cachePath,baseline.cachePath);assert.equal(route.throughValidation!.checks.length,3);assert.ok(route.throughValidation!.checks.every(c=>c.distanceMetres<0.01));assert.equal(route.throughValidation!.toleranceMetres,3);
 assert.ok(route.throughValidation!.checks[1].shapePosition>route.throughValidation!.checks[0].shapePosition);
 assert.equal((await tools.pedestrianRoute([a,b,c],options)).cacheHit,true);assert.equal(payloads.length,2);
 const changed=await tools.pedestrianRoute([a,b,c],{...options,throughByLeg:[[nearA],[secondLeg]]});assert.notEqual(changed.cachePath,route.cachePath);assert.equal(payloads.length,3);
});

test('routing rejects skipped and reordered through points and providers that create extra legs',async t=>{
 const a={latitude:51.55,longitude:-0.17},b={latitude:51.55,longitude:-0.169},c={latitude:51.55,longitude:-0.168};
 const first={latitude:51.55,longitude:-0.1698},second={latitude:51.55,longitude:-0.1692};
 const tools=await setup(t,async()=>Response.json(routedGeometry([[a,b]])));
 await assert.rejects(tools.pedestrianRoute([a,b],{throughByLeg:[[{latitude:51.5501,longitude:-0.1695}]]}),/missed by returned geometry/);
 await assert.rejects(tools.pedestrianRoute([a,b],{throughByLeg:[[second,first]]}),/out of order/);
 const extra=await setup(t,async()=>Response.json(routedGeometry([[a,b],[b,c]])));
 await assert.rejects(extra.pedestrianRoute([a,c],{throughByLeg:[[b]]}),/One returned leg/);
});

test('routing validates through bounds and finite coordinates before dispatch, with no cap reset',async t=>{
 let calls=0;const tools=await setup(t,async()=>{calls++;return Response.json(routeBody());});
 const options:PedestrianRouteOptions[]=[{throughByLeg:[]},{throughByLeg:[[],[]]},{throughByLeg:[Array(9).fill(points[0])]},{throughByLeg:[[{latitude:NaN,longitude:0}]]},{throughByLeg:[[{latitude:Infinity,longitude:0}]]},{throughByLeg:[[{latitude:51,longitude:181}]]}];
 for(const option of options)await assert.rejects(tools.pedestrianRoute(points,option));
 await assert.rejects(tools.pedestrianRoute(Array(6).fill(points[0]),{throughByLeg:Array.from({length:5},()=>Array(7).fill(points[0]))}),/At most32/);
 await assert.rejects(tools.pedestrianRoute(Array(9).fill(points[0]),{throughByLeg:Array.from({length:8},()=>[points[0]])}),/At most7/);
 assert.equal(calls,0);
});

test('public ten-location limit splits bounded tour legs sequentially and preserves every constraint and response provenance',async t=>{
 const stops=[{latitude:51.55,longitude:-0.17},{latitude:51.55,longitude:-0.169},{latitude:51.55,longitude:-0.168}];
 const through=Array.from({length:8},(_,i)=>({latitude:51.55,longitude:-0.17+(i+1)*0.0001}));
 const starts:number[]=[],payloads:{locations:{lat:number;lon:number;type:string;node_snap_tolerance?:number}[]}[]=[];
 const tools=await setup(t,async(_url,request)=>{
  starts.push(Date.now());const payload=JSON.parse(String(request?.body));payloads.push(payload);assert.ok(payload.locations.length<=10);
  return Response.json(routedGeometry([[payload.locations[0],payload.locations.at(-1)].map(p=>({latitude:p.lat,longitude:p.lon}))]));
 });
 const options={throughByLeg:[through,[]],preferMappedWalkways:true};
 const route=await tools.pedestrianRoute(stops,options);
 assert.equal(payloads.length,2);assert.ok(starts[1]-starts[0]>=1090,'Split requests obey the existing public rate envelope');
 assert.deepEqual(payloads[0].locations.filter(p=>p.type==='through').map(p=>({latitude:p.lat,longitude:p.lon})),through);
 assert.equal(payloads[0].locations.length,10);assert.equal(payloads[1].locations.length,2);assert.equal(route.legs.length,2);assert.deepEqual(route.requestedPoints,stops);
 assert.equal(route.throughValidation!.checks.length,8);assert.equal(route.distanceMetres,2000);assert.equal(route.durationSeconds,1600);
 assert.equal(route.composition?.segments.length,2);assert.equal(route.composition?.hashBasis,'ordered-provider-response-hashes');assert.equal(route.composition?.maxLocationsPerRequest,10);
 const manifest=JSON.parse(await readFile(route.cachePath,'utf8'));assert.deepEqual(manifest.routingOptions,options);assert.equal(manifest.hash,route.hash);assert.equal((await stat(route.cachePath)).mode&0o777,0o600);
 assert.equal((await tools.pedestrianRoute(stops,options)).cacheHit,true);assert.equal(payloads.length,2);
});

test('split routing retains completed component cache after failure and refuses disconnected provider legs',async t=>{
 const stops=[{latitude:51.55,longitude:-0.17},{latitude:51.55,longitude:-0.169},{latitude:51.55,longitude:-0.168}];
 const through=Array.from({length:8},(_,i)=>({latitude:51.55,longitude:-0.17+(i+1)*0.0001}));
 let calls=0;
 const tools=await setup(t,async(_url,request)=>{
  calls++;if(calls===2)return Response.json({error_code:171,error:'No path'},{status:400});
  const payload=JSON.parse(String(request?.body));return Response.json(routedGeometry([[payload.locations[0],payload.locations.at(-1)].map(p=>({latitude:p.lat,longitude:p.lon}))]));
 });
 const options={throughByLeg:[through,[]]};await assert.rejects(tools.pedestrianRoute(stops,options),/Public HTTP 400 \[171\]/);
 const route=await tools.pedestrianRoute(stops,options);assert.equal(calls,3,'Completed first leg is read from its exact cache');assert.equal(route.legs.length,2);
 let index=0;const disconnected=await setup(t,async()=>{const i=index++;return Response.json(routedGeometry([[i?{...stops[1],latitude:51.551}:stops[0],stops[i+1]]]));});
 await assert.rejects(disconnected.pedestrianRoute(stops,options),/Disconnected split routed legs/);
});

test('deadline expiry after one split response prevents the next outbound request and preserves completed cache',async t=>{
 const stops=[{latitude:51.55,longitude:-0.17},{latitude:51.55,longitude:-0.169},{latitude:51.55,longitude:-0.168}];
 const through=Array.from({length:8},(_,i)=>({latitude:51.55,longitude:-0.17+(i+1)*0.0001}));
 let now=0,calls=0,guards=0;const deadline=1,expired=Error('Generation deadline reached');
 const tools=await setup(t,async(_url,request)=>{
  calls++;const payload=JSON.parse(String(request?.body));now=deadline;
  return Response.json(routedGeometry([[payload.locations[0],payload.locations.at(-1)].map(p=>({latitude:p.lat,longitude:p.lon}))]));
 },{beforeRequest:()=>{guards++;if(now>=deadline)throw expired;}});
 await assert.rejects(tools.pedestrianRoute(stops,{throughByLeg:[through,[]]}),error=>error===expired,'Original deadline error is not replaced or retried');
 assert.equal(calls,1,'No second split-leg transport begins after expiry');assert.equal(guards,2);
 const retained=await tools.pedestrianRoute(stops.slice(0,2),{throughByLeg:[through]});
 assert.equal(retained.cacheHit,true);assert.equal(calls,1);assert.equal(guards,2,'Reading a completed private cache is not an outbound request');
});

test('route input and malformed polyline/response fail without fabricated geometry', async t => {
  let calls = 0;
  const tools = await setup(t, async () => { calls++; const bad = routeBody(); bad.trip.legs[0].maneuvers[0].end_shape_index = 20; return response(JSON.stringify(bad), 'application/json'); });
  await assert.rejects(tools.pedestrianRoute([points[0]]));
  await assert.rejects(tools.pedestrianRoute([{ latitude: NaN, longitude: 1 }, points[1]]));
  assert.equal(calls, 0);
  await assert.rejects(tools.pedestrianRoute(points), /Maneuver outside/);
  assert.deepEqual(decodePolyline6(shape), points);
  assert.throws(() => decodePolyline6('~~~~'), /Malformed/);
  assert.throws(() => decodePolyline6('?'), /Malformed/);
});

test('public cache destination cannot put full response bodies in tracked content', () => {
  assert.throws(() => new PublicTools({ directory: join('content', 'full-pages') }), /local-data/);
});

test('readImage returns actual bounded image bytes without claiming inspection, rejects mislabeled HTML', async t => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', 'base64');
  const tools = await setup(t, async () => new Response(png, { headers: { 'content-type': 'image/png' } }));
  const image = await tools.readImage('https://example.com/image.png');
  assert.equal(image.image.dataUrl, `data:image/png;base64,${png.toString('base64')}`);
  assert.equal(image.inspection, 'pending'); assert.equal(image.physicalClearance, 'unverified');
  const bad = await setup(t, async () => response('<html>Not an image</html>', 'image/jpeg'));
  await assert.rejects(bad.readImage('https://example.com/fake.jpg'), /JPEG or PNG/);
});

test('mapFeatures sends small read-only query, retains mapped coordinates/tags and bounded provenance', async t => {
  let calls = 0;
  const tools = await setup(t, async url => {
    calls++; const query = new URL(String(url)).searchParams.get('data')!;
    assert.match(query, /\[maxsize:33554432\]/); assert.match(query, /around:200,51.55,-0.17/); assert.match(query, /out body center geom\([^)]+\) 200/); assert.ok(!/nwr|relation/.test(query));
    assert.match(query, /node\(around:[^)]+\)\[entrance\]/);
    return Response.json({ osm3s: { timestamp_osm_base: '2026-10-07T10:00:00Z' }, elements: [
      { type: 'way', id: 1, tags: { highway: 'footway', access: 'yes', name: 'Synthetic path' }, center: { lat: 51.55, lon: -0.17 }, geometry: [{ lat: 51.55, lon: -0.17 }, { lat: 51.551, lon: -0.17 }] },
      { type: 'node', id: 2, lat: 51.55, lon: -0.17, tags: { barrier: 'gate', access: 'private' } },
    ] });
  });
  const result = await tools.mapFeatures({ latitude: 51.55, longitude: -0.17 }, 200);
  assert.equal(result.elements[0].tags?.highway, 'footway'); assert.match(result.text, /private/); assert.match(result.url, /#query-[a-f0-9]{64}$/);
  assert.equal(result.physicalClearance, 'unverified'); assert.equal(result.mapDataAt, '2026-10-07T10:00:00Z');
  await assert.rejects(tools.mapFeatures({ latitude: 51.55, longitude: -0.17 }, 251), /250/);
  assert.equal(calls, 1);
});


test('page image discovery retains at most eight public image URLs and alternate text without fetching images', async t => {
  let calls = 0;
  const tools = await setup(t, async () => { calls++; return response('<title>Photo source</title><p>Actual text.</p><meta property="og:image" content="/lead.jpg"><img src="/exterior.png" alt="Building &amp; pavement"><img src="https://127.0.0.1/private.jpg"><img src="data:image/png;base64,AA==">'); });
  const page = await tools.readPage('https://example.com/source');
  assert.deepEqual(page.images, [{ url: 'https://example.com/lead.jpg', alt: '' }, { url: 'https://example.com/exterior.png', alt: 'Building & pavement' }]);
  assert.equal(calls, 1);
});


test('map requests serialize across instances, wait after completion, and never expand irrelevant relations', async t => {
  const starts: number[] = [], ends: number[] = []; let active = 0, maximumActive = 0;
  const transport: typeof fetch = async () => {
    starts.push(Date.now()); active++; maximumActive = Math.max(maximumActive, active);
    await new Promise(r => setTimeout(r, 20)); active--; ends.push(Date.now());
    return Response.json({ elements: [{ type: 'node', id: 1, lat: 51.55, lon: -0.17, tags: { entrance: 'yes', name: 'Synthetic entrance' } },
      { type: 'way', id: 2, tags: { building: 'yes' } }, { type: 'way', id: 3, tags: { name: 'Synthetic landmark' } }] });
  };
  const a = await setup(t, transport), b = await setup(t, transport);
  const [first, second] = await Promise.all([a.mapFeatures({ latitude: 51.55, longitude: -0.17 }, 60), b.mapFeatures({ latitude: 51.551, longitude: -0.17 }, 60)]);
  assert.equal(maximumActive, 1); assert.ok(starts[1] - ends[0] >= 1990, 'Two-second interval follows completion');
  assert.deepEqual(first.elements.map(e => e.id), [1, 3, 2]); assert.equal(second.queryLimit, 200);
  assert.equal(first.queryLimitReached, false); assert.equal(first.geometryClippedToQueryBox, true);
  const count = starts.length; const cached = await a.mapFeatures({ latitude: 51.55, longitude: -0.17 }, 60);
  assert.equal(cached.cacheHit, true); assert.equal(starts.length, count);
});

test('Overpass result cap remains explicit even when the private full response has all returned rows', async t => {
  const tools = await setup(t, async () => Response.json({ elements: Array.from({ length: 200 }, (_, i) => ({ type: 'node', id: i + 1, lat: 51.55, lon: -0.17, tags: { name: `Synthetic feature ${i}` } })) }));
  const result = await tools.mapFeatures({ latitude: 51.55, longitude: -0.17 }, 50);
  assert.equal(result.returnedCount, 200); assert.equal(result.queryLimitReached, true); assert.equal(result.truncated, true); assert.equal(result.selectedCount, 60);
  const saved = JSON.parse(await readFile(result.cachePath, 'utf8'));
  assert.equal(JSON.parse(Buffer.from(saved.bodyBase64, 'base64').toString()).elements.length, 200);
});

test('transport snapshot excludes ordinary doorways and retains actual station names, entrance level, tunnel and access tags', async t => {
  const queries: string[] = [];
  const tools = await setup(t, async url => {
    queries.push(new URL(String(url)).searchParams.get('data')!);
    return Response.json({ elements: [
      ...Array.from({ length: 60 }, (_, i) => ({ type: 'node', id: i + 1, lat: 51.55, lon: -0.17, tags: { entrance: 'yes' } })),
      { type: 'node', id: 61, lat: 51.5502, lon: -0.1702, tags: { railway: 'subway_entrance', entrance: 'main', level: '0', tunnel: 'no', access: 'yes' } },
      { type: 'way', id: 62, tags: { building: 'train_station', name: 'Synthetic Station Building', access: 'customers' }, center: { lat: 51.5501, lon: -0.1701 }, geometry: [{ lat: 51.55, lon: -0.17 }, { lat: 51.5502, lon: -0.1702 }] },
      { type: 'node', id: 63, lat: 51.55, lon: -0.17, tags: { railway: 'station', name: 'Synthetic Underground Station', station: 'subway', level: '-1', tunnel: 'yes' } },
    ] });
  });
  const ordinary = await tools.mapFeatures({ latitude: 51.55, longitude: -0.17 }, 100);
  assert.deepEqual(ordinary.elements.map(e => e.id), Array.from({ length: 60 }, (_, i) => i + 1), 'Existing default ordering is unchanged');
  assert.match(queries[0], /node\(around:[^)]+\)\[entrance\]/);
  const station = await tools.transportFeatures({ latitude: 51.55, longitude: -0.17 }, 100);
  assert.notEqual(station.url, ordinary.url, 'Transport evidence has separate exact-query identity/cache');
  assert.match(queries[1], /railway~"\^\(station\|subway_entrance\)\$"/);
  assert.match(queries[1], /building=train_station/);
  assert.doesNotMatch(queries[1], /nwr|relation|\[entrance\]|\[name\]/);
  assert.match(queries[1], /out body center geom\([^)]+\) 200/);
  assert.deepEqual(station.elements.map(e => e.id), [63, 62, 61]);
  assert.equal(station.elements[0].tags?.name, 'Synthetic Underground Station');
  assert.equal(station.elements[0].tags?.level, '-1'); assert.equal(station.elements[0].tags?.tunnel, 'yes');
  assert.equal(station.elements[2].tags?.access, 'yes'); assert.equal(station.elements[2].tags?.level, '0');
  assert.equal(station.excludedNonTransportCount, 60); assert.equal(station.focus, 'transport');
  assert.equal(station.physicalClearance, 'unverified'); assert.equal(station.geometryClippedToQueryBox, true);
  assert.equal((await tools.transportFeatures({ latitude: 51.55, longitude: -0.17 }, 100)).cacheHit, true);
  assert.equal(queries.length, 2);
  await assert.rejects(tools.transportFeatures({ latitude: 51.55, longitude: -0.17 }, 251), /250/);
});

test('crossing snapshot prioritizes explicit crossings over anonymous entrances while retaining footway and road evidence', async t => {
  let query = '', calls = 0;
  const tools = await setup(t, async url => {
    calls++; query = new URL(String(url)).searchParams.get('data')!;
    return Response.json({ elements: [
      ...Array.from({ length: 60 }, (_, i) => ({ type: 'node', id: i + 1, lat: 51.55, lon: -0.17, tags: { entrance: 'yes' } })),
      { type: 'way', id: 61, tags: { highway: 'primary', name: 'Synthetic Road' }, geometry: [{ lat: 51.55, lon: -0.17 }, { lat: 51.5501, lon: -0.17 }] },
      { type: 'way', id: 62, tags: { highway: 'footway', access: 'yes' }, geometry: [{ lat: 51.55, lon: -0.17 }, { lat: 51.5501, lon: -0.17 }] },
      { type: 'way', id: 63, tags: { highway: 'footway', footway: 'crossing', crossing: 'marked' }, geometry: [{ lat: 51.55, lon: -0.17 }, { lat: 51.55, lon: -0.1701 }] },
      { type: 'node', id: 64, lat: 51.55, lon: -0.17, tags: { highway: 'crossing', crossing: 'traffic_signals', tactile_paving: 'yes', kerb: 'lowered' } },
    ] });
  });
  const result = await tools.crossingFeatures({ latitude: 51.55, longitude: -0.17 }, 100);
  assert.match(query, /node\(around:[^)]+\)\[highway=crossing\]/);
  assert.match(query, /way\(around:[^)]+\)\[footway=crossing\]/);
  assert.match(query, /way\(around:[^)]+\)\[highway=footway\]/);
  assert.match(query, /primary\|secondary/); assert.match(query, /out body center geom\([^)]+\) 200/);
  assert.doesNotMatch(query, /nwr|relation|\[entrance\]|\[name\]/);
  assert.deepEqual(result.elements.map(e => e.id), [64, 63, 62, 61]);
  assert.equal(result.elements[0].tags?.crossing, 'traffic_signals'); assert.equal(result.elements[0].tags?.tactile_paving, 'yes');
  assert.equal(result.elements[0].tags?.kerb, 'lowered'); assert.equal(result.elements[2].tags?.access, 'yes');
  assert.equal(result.focus, 'crossing'); assert.equal(result.excludedUnrelatedCount, 60); assert.equal(result.physicalClearance, 'unverified');
  assert.equal((await tools.crossingFeatures({ latitude: 51.55, longitude: -0.17 }, 100)).cacheHit, true); assert.equal(calls, 1);
  await assert.rejects(tools.crossingFeatures({ latitude: 51.55, longitude: -0.17 }, 251), /250/);
});
