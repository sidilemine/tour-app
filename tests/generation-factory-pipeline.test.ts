import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { distance, type Coordinate } from '../src/domain/fixture';
import { parseTourPackage } from '../src/tours/package';
import { buildTour, validateBuilderInput, type BuilderAudioTools } from '../tools/generation/builder';
import { prepareRoute, assemble, runFactory, type Routed } from '../tools/generation/factory/pipeline';
import { briefSchema, surveySchema, researchSchema, routePlanSchema, draftSchema, validateDraft, validateResearch, type Draft, type FactoryReview } from '../tools/generation/factory/contracts';
import { FactoryRuntime } from '../tools/generation/factory/runtime';
import { PublicTools } from '../tools/generation/factory/public-tools';
import type { ProviderResult, InferenceRequest } from '../tools/generation/provider';

// Entirely synthetic content and coordinates, constructed here rather than read
// from an authored tour. Bundled map identity is infrastructure, not content.
function fixture() {
  const start = { latitude: 51.55, longitude: -0.17 };
  const locations = [{ latitude: 51.551, longitude: -0.17 }, { latitude: 51.555, longitude: -0.17 },
    { latitude: 51.555, longitude: -0.162 }, { latitude: 51.551, longitude: -0.162 }];
  const brief = briefSchema.parse({ schemaVersion: 1, id: 'synthetic-factory', area: 'Synthetic area', start: 'Synthetic station exterior', end: 'Synthetic station exterior', durationSeconds: 3600,
    access: 'Synthetic public exterior', audience: { reason: 'Synthetic test', assumedKnowledge: 'None', intendedDiscovery: 'Test stories', presentAnchor: 'Synthetic points' },
    voice: 'local Kokoro George', model: 'gpt-6-astra', effort: 'medium', directPaidCeilingUsd: 0, mapId: 'hampstead-0abcc26a600e0718', freshContentOnly: true, requirements: ['Synthetic fresh content only'] });
  const sources = Array.from({ length: 5 }, (_, i) => ({ id: `source-${i}`, url: `https://example.com/source-${i}`, title: `Synthetic source ${i}`, origin: 'Synthetic test',
    passage: `Synthetic source ${i} reports about five makers.`, locator: 'Synthetic paragraph' }));
  const survey = surveySchema.parse({ publishedWalks: Array.from({ length: 3 }, (_, i) => ({ title: `Synthetic published walk ${i}`, url: `https://example.com/walk-${i}`, stops: ['Synthetic point'], themes: ['Test'], stories: ['Test'] })),
    candidates: sources.map((s, i) => ({ id: `place-${i}`, name: `Synthetic place ${i}`, why: 'Synthetic test', leadUrls: [s.url] })), gaps: [] });
  const research = researchSchema.parse({ sources, claims: Array.from({ length: 8 }, (_, i) => ({ id: `claim-${i}`, text: 'Synthetic account of about five makers.', sourceIds: [`source-${i % 5}`], qualifications: ['about'] })),
    places: locations.map((standing, i) => ({ candidateId: `place-${i}`, standing, landmark: { latitude: standing.latitude + 0.0001, longitude: standing.longitude },
      approach: 'Synthetic public approach', viewpoint: 'Synthetic exterior view', access: 'Synthetic public pavement claim for tests only', sourceIds: [`source-${i}`], essentialUnknowns: [] })), rejected: [], gaps: [] });
  const plan = routePlanSchema.parse({ title: 'Synthetic loop', stopIds: locations.map((_, i) => `place-${i}`), start, end: start, selectionReason: 'Test route only', rejectedAlternatives: [], allowanceSeconds: 360, walkingMetresPerSecond: 1.25 });
  const all = [start, ...locations, start];
  const routed: Routed = { provider: 'Synthetic router fixture', retrievedAt: '2026-10-07T10:00:00.000Z', url: 'https://example.com/route', legs: all.slice(1).map((p, i) => ({ geometry: [all[i], p],
    distanceMetres: distance(all[i], p), durationSeconds: distance(all[i], p) / 1.25, maneuvers: [{ instruction: `Synthetic leg ${i + 1} instructions.`, beginShapeIndex: 0, endShapeIndex: 1, type: 1 }] })) };
  const prepared = prepareRoute(plan, research, routed);
  const story = (id: string, i: number) => ({ id, title: `Synthetic story ${i}`, paragraphs: [
    { text: `Synthetic account ${i} concerns about five makers.`, kind: 'factual' as const, claimIds: [`claim-${i % 8}`], basis: 'Synthetic supporting source only' },
    { text: 'Synthetic editorial reflection.', kind: 'editorial' as const, claimIds: [], basis: 'Editorial test paragraph' }], directions: [`Synthetic saved directions ${i}.`] });
  const draft = draftSchema.parse({ description: 'Synthetic description', introduction: 'Synthetic AI-generated introduction; manual fallback.', finishInstructions: 'Synthetic return to the station.',
    stories: plan.stopIds.map(story), chapters: prepared.chapterIds.map((id, i) => story(id, i + 4)), editorialIntent: 'Synthetic test narration' });
  return { brief, survey, research, plan, routed, prepared, draft };
}
const sectionMetres = (geometry: Coordinate[], start: number, end: number) => geometry.slice(start + 1, end + 1).reduce((n, p, i) => n + distance(geometry[start + i], p), 0);

test('prepared route includes station approach and full return, keeps distinct standing/landmark and uses actual player validation', () => {
  const f = fixture(), value = assemble(f.brief, f.plan, f.research, f.prepared, f.draft);
  validateBuilderInput(value);
  assert.deepEqual(value.fixture.route[0], f.plan.start); assert.deepEqual(value.fixture.route.at(-1), f.plan.end);
  assert.equal(value.legs.length, 5); assert.equal(value.legs.at(-1)!.endRouteIndex, value.fixture.route.length - 1);
  assert.notDeepEqual(value.fixture.stops[0].standing, value.fixture.stops[0].landmark);
  assert.equal(value.fixture.verification.status, 'unverified');
  assert.ok(f.prepared.routeMetres > f.prepared.legs.slice(0, -1).reduce((n, l) => n + sectionMetres(f.prepared.geometry, l.startRouteIndex, l.endRouteIndex), 0));
});

test('route rejects essential access unknowns, large standing snaps, disconnected legs, and missing station return', () => {
  for (const change of [
    (f: ReturnType<typeof fixture>) => { f.research.places[0].essentialUnknowns = ['No public entrance evidence']; },
    (f: ReturnType<typeof fixture>) => { f.research.places[0].standing.latitude += 0.001; },
    (f: ReturnType<typeof fixture>) => { f.routed.legs[1].geometry[0] = { latitude: 51.58, longitude: -0.16 }; },
    (f: ReturnType<typeof fixture>) => { f.routed.legs.pop(); },
    (f: ReturnType<typeof fixture>) => { f.plan.end = { latitude: 51.58, longitude: -0.16 }; },
    (f: ReturnType<typeof fixture>) => { f.routed.legs.at(-1)!.geometry[1] = { latitude: 51.58, longitude: -0.16 }; },
  ]) { const f = fixture(); change(f); assert.throws(() => prepareRoute(f.plan, f.research, f.routed)); }
});

test('chapter windows have usable spatial width beyond player exclusion radii and preserve full latest-launch budget', () => {
  const f = fixture(); assert.equal(f.prepared.chapterWindows.length, 2);
  for (const c of f.prepared.chapterWindows) {
    const from = f.prepared.stops[c.afterStopIndex], to = f.prepared.stops[c.afterStopIndex + 1];
    assert.ok(sectionMetres(f.prepared.geometry, c.startRouteIndex, c.endRouteIndex) >= 30, 'Wide enough for three fresh fixes and four-second persistence');
    for (const p of f.prepared.geometry.slice(c.startRouteIndex, c.endRouteIndex + 1)) {
      assert.ok(distance(p, from.standing) > 40, 'Player must permit departing stop clearance');
      assert.ok(distance(p, to.standing) > 40, 'Player must permit destination clearance');
    }
    assert.ok(sectionMetres(f.prepared.geometry, c.endRouteIndex, c.navigationRouteIndex) / c.fastWalkingMetresPerSecond >= c.maximumAudioSeconds + c.marginSeconds);
  }
});

test('assembly preserves exact paragraph/source references and rejects missing claims or lost qualifications', () => {
  const f = fixture(), input = assemble(f.brief, f.plan, f.research, f.prepared, f.draft);
  assert.equal(input.stories[0].evidence[0].paragraph, f.draft.stories[0].paragraphs[0].text);
  assert.deepEqual(input.stories[0].evidence[0].sourceUrls, [f.research.sources[0].url]);
  assert.equal(input.stories[0].evidence[1].kind, 'editorial'); assert.deepEqual(input.stories[0].evidence[1].sourceUrls, []);
  const missing = structuredClone(f.draft); missing.stories[0].paragraphs[0].claimIds = ['absent'];
  assert.throws(() => assemble(f.brief, f.plan, f.research, f.prepared, missing), /Missing claim/);
  const exact = structuredClone(f.draft); exact.stories[0].paragraphs[0].text = exact.stories[0].paragraphs[0].text.replace('about ', '');
  assert.throws(() => validateDraft(exact, f.research, f.plan, f.prepared.chapterIds), /qualification/);
  const pages = new Map(f.research.sources.map(s => [s.url, { text: `Heading ${s.passage} More source context.` }]));
  assert.doesNotThrow(() => validateResearch(f.research, f.survey, pages));
  f.research.sources[0].passage = 'This sentence was never retrieved.';
  assert.throws(() => validateResearch(f.research, f.survey, pages), /not present/);
});

function encode(points: Coordinate[]) {
  let lat = 0, lon = 0, result = '';
  for (const p of points) for (const [key, old] of [['latitude', lat], ['longitude', lon]] as const) {
    const value = Math.round(p[key] * 1e6), change = value - old;
    let n = change < 0 ? -change * 2 - 1 : change * 2;
    while (n >= 32) { result += String.fromCharCode((n % 32) + 95); n = Math.floor(n / 32); }
    result += String.fromCharCode(n + 63); if (key === 'latitude') lat = value; else lon = value;
  }
  return result;
}
function syntheticAudio(slowFirst = false): BuilderAudioTools {
  const voiceConfig = { provider: 'synthetic-test', voice: 'bm_george', model: 'fixture', revision: 'fixture', dtype: 'fp32', device: 'cpu', speed: 1, kokoroJs: 'fixture', paragraphGapSeconds: 0.25, loudnessLufs: -19, encoding: 'test only', rendererRevision: 2 };
  return { voiceConfig, async render(text, destination) {
    await writeFile(destination, Buffer.concat([Buffer.from('00000018667479704d34412000000000', 'hex'), Buffer.from(text)]));
    await writeFile(`${destination}.render.json`, JSON.stringify({ voiceConfig, chunks: text.split('\n\n').map(chunk => ({ text: chunk, durationSeconds: slowFirst && text.startsWith('Synthetic account 0 ') ? 800 : 2 })) }));
  }, async inspect(path) {
    const metadata = JSON.parse(await readFile(`${path}.render.json`, 'utf8'));
    return { durationSeconds: metadata.chunks.reduce((n: number, c: { durationSeconds: number }) => n + c.durationSeconds, 0) + (metadata.chunks.length - 1) * 0.25, channels: 1, sampleRate: 24000 };
  }, async close() {} };
}
function providerResult(request: InferenceRequest, value: unknown, calls: ProviderResult['output'] = []): ProviderResult {
  return { status: 'completed', contextId: request.contextId, model: 'gpt-6-astra', effort: 'medium', text: calls.length ? '' : JSON.stringify(value), output: calls,
    ...(request.webSearch ? { webSearchCalls: [{ id: 'synthetic-search', status: 'completed', action: { type: 'search', queries: ['synthetic fixture'] }, sources: [] }] } : {}),
    usage: { inputTokens: 20, outputTokens: 10, totalTokens: 30, source: 'response.completed' }, elapsedMs: 1, evidenceKind: 'fixture', diagnostic: { code: 'fixture', retryable: false, automaticRetries: 0 }, directChargeUsd: 0, estimatedApiEquivalentUsd: null };
}
async function replay(t: TestContext, rejectReviews: boolean, measuredOverrun = false) {
  const f = fixture(); await mkdir('local-data', { recursive: true }); const directory = await mkdtemp(resolve('local-data/factory-pipeline-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const requests: string[] = []; let buildCalls = 0;
  const accepted: FactoryReview = { verdict: 'accepted', summary: 'Synthetic desk review', issues: [], checks: ['Synthetic exact-input check'] };
  const provider = { async request(request: InferenceRequest) {
    const name = request.jsonSchema!.name; requests.push(name);
    if (name === 'survey') return providerResult(request, f.survey);
    if (name === 'research' && requests.filter(n => n === name).length === 1) return providerResult(request, null, f.research.sources.map((s, i) => ({ type: 'function_call', namespace: 'factory', name: 'read_page', call_id: `page-${i}`, arguments: JSON.stringify({ url: s.url }) })));
    if (name === 'research' || name === 'research_repair') return providerResult(request, f.research);
    if (name.startsWith('route_plan_')) return providerResult(request, f.plan);
    if (name.startsWith('scout_') || name === 'tester') return providerResult(request, accepted);
    if (name === 'writing' || name.startsWith('correction_')) {
      const context = JSON.parse(String(request.input[0].content)) as { prepared: { chapterIds: string[] } };
      const draft: Draft = structuredClone(f.draft); draft.chapters = context.prepared.chapterIds.map((id, i) => ({ ...draft.chapters[i], id }));
      if (measuredOverrun && name.startsWith('correction_')) draft.stories[0].paragraphs[0].text = 'Synthetic revised account 0 concerns about five makers.';
      return providerResult(request, draft);
    }
    if (name.startsWith('editor_') || name.startsWith('verification_')) return providerResult(request, rejectReviews ? { ...accepted, verdict: 'needs-revision', issues: [{ id: 'required-fix', scope: 'story', required: true, problem: 'Synthetic unresolved detail', repair: 'Remove unsupported detail', evidence: 'Synthetic missing support' }] } : accepted);
    throw Error(`Unexpected synthetic phase ${name}`);
  } };
  const runtime = new FactoryRuntime(directory, f.brief, async () => provider, () => '2026-10-07T10:00:00.000Z');
  const tools = new PublicTools({ directory: join(directory, 'public-tools'), lookup: async () => [{ address: '93.184.216.34', family: 4 }], fetch: async url => {
    if (String(url).includes('valhalla1.openstreetmap.de')) return Response.json({ trip: { status: 0, units: 'kilometers', summary: { length: f.routed.legs.reduce((n, l) => n + l.distanceMetres, 0) / 1000, time: f.routed.legs.reduce((n, l) => n + l.durationSeconds, 0) }, legs: f.routed.legs.map(l => ({ shape: encode(l.geometry), summary: { length: l.distanceMetres / 1000, time: l.durationSeconds }, maneuvers: l.maneuvers.map(m => ({ instruction: m.instruction, begin_shape_index: m.beginShapeIndex, end_shape_index: m.endShapeIndex, type: m.type })) })) } });
    const source = f.research.sources.find(s => s.url === String(url)); assert.ok(source);
    return new Response(`<title>${source.title}</title><p>${source.passage}</p>`, { headers: { 'content-type': 'text/html' } });
  } });
  const options = { build: async (...args: Parameters<typeof buildTour>) => { buildCalls++; return buildTour(args[0], { ...args[1], audioTools: syntheticAudio(measuredOverrun) }); } };
  return { runtime, tools, options, requests, buildCalls: () => buildCalls, directory };
}

test('complete synthetic factory performs fresh tools, independent reviews and actual package build with usage retained', async t => {
  const r = await replay(t, false), handoff = await runFactory(r.runtime, r.tools, r.options);
  assert.equal(handoff.status, 'awaiting-listening'); assert.equal(handoff.freshContentOnly, true); assert.equal(r.buildCalls(), 1);
  const pkg = parseTourPackage(JSON.parse(await readFile(handoff.packagePath, 'utf8')));
  assert.equal(pkg.fixture.stops.length, 4); assert.equal(pkg.fixture.narration!.chapters.length, 2);
  assert.ok(r.requests.includes('editor_0') && r.requests.includes('verification_0') && r.requests.includes('tester'));
  assert.ok(r.runtime.job.costLedger.operations.every(o => o.state === 'settled' && o.usage?.totalTokens === 30));
  assert.equal(r.runtime.job.status, 'awaiting-decision'); assert.ok(handoff.timing.withinTarget);
  assert.ok(handoff.limitations.some(l => l.includes('listening')));
});

test('factory never renders a repeatedly rejected script and does not silently redispatch completed work on failure replay', async t => {
  const r = await replay(t, true);
  await assert.rejects(runFactory(r.runtime, r.tools, r.options), /acceptance not achieved/);
  assert.equal(r.buildCalls(), 0); assert.equal(r.runtime.job.counters.correction, 2);
  const calls = r.requests.length;
  await assert.rejects(runFactory(r.runtime, r.tools, r.options));
  assert.equal(r.requests.length, calls, 'Completed provider phases do not silently dispatch again');
  assert.equal(r.buildCalls(), 0);
});


test('measured overrun gets one changed-clip render after renewed exact-draft reviews and retains the earlier version', async t => {
  const r = await replay(t, false, true), handoff = await runFactory(r.runtime, r.tools, r.options);
  assert.equal(r.buildCalls(), 2); assert.equal(r.runtime.job.counters.correction, 1);
  assert.equal(r.runtime.job.counters.render['place-0'], 1);
  assert.ok(r.requests.includes('editor_1') && r.requests.includes('verification_1'));
  const before = JSON.parse(await readFile(join(r.directory, 'package-v1', 'preparation.json'), 'utf8'));
  const after = JSON.parse(await readFile(join(r.directory, 'package-v2', 'preparation.json'), 'utf8'));
  assert.equal(before.timing.withinTarget, false); assert.equal(after.timing.withinTarget, true);
  assert.equal(after.recordings.filter((r: { cacheHit: boolean }) => !r.cacheHit).length, 1);
  assert.equal(parseTourPackage(JSON.parse(await readFile(handoff.packagePath, 'utf8'))).fixture.version, 2);
});
