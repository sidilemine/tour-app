import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PublicTools, decodePolyline6, normalizeSourceText, publicRoutingPolicy, type PublicToolsOptions } from '../tools/generation/factory/public-tools';

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
    assert.match(query, /around:200,51.55,-0.17/); assert.match(query, /out body center geom\([^)]+\) 200/); assert.ok(!/nwr|relation/.test(query));
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
