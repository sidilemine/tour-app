import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { distance, type Coordinate } from '../src/domain/fixture';
import { parseTourPackage } from '../src/tours/package';
import { buildTour, validateBuilderInput, type BuilderAudioTools } from '../tools/generation/builder';
import { prepareRoute, routingOptionsForPlan, assemble, runFactory, applyRouteDisposition, applyPhysicalCoverage, retainReviewContext, retainPackageReviewInput, type Routed } from '../tools/generation/factory/pipeline';
import { briefSchema, surveySchema, researchSchema, routePlanSchema, draftSchema, excludeUnusedEmptySources, validateDraft, validateResearch, type Draft, type FactoryReview } from '../tools/generation/factory/contracts';
import { durationBudget, durationFits, PRACTICAL_ACCESS_POLICY } from '../tools/generation/factory/experience-policy';
import { FactoryRuntime, digest } from '../tools/generation/factory/runtime';
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

test('built player package exposes every canonical leg even when model directions omit crossings and return',async t=>{
 const f=fixture();
 f.prepared.legs.forEach((leg,i)=>{leg.directions=[`Canonical leg ${i+1}: use its evidenced crossing.`,`Canonical leg ${i+1}: remain on its public approach.`];});
 f.draft.stories.forEach(story=>{story.directions=['Model direction omits the crossing.'];});f.draft.finishInstructions='Model finish omits the complete return.';
 const originalDraft=structuredClone(f.draft),input=assemble(f.brief,f.plan,f.research,f.prepared,f.draft);
 const directory=await mkdtemp(join((await import('node:os')).tmpdir(),'tour-canonical-navigation-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const built=await buildTour(input,{outputDirectory:join(directory,'package'),cacheDirectory:join(directory,'audio-cache'),audioTools:syntheticAudio()});
 const parsed=parseTourPackage(JSON.parse(await readFile(built.packagePath,'utf8'))),narration=parsed.fixture.narration!;
 assert.ok(narration.introduction.startsWith(`Welcome to ${f.brief.area}.`));
 assert.ok(!narration.introduction.includes(f.draft.introduction),'Writer status prose does not override current producer status');
 for(const line of f.prepared.legs[0].directions)assert.ok(narration.introduction.includes(line),'First leg available before starting');
 for(const [i,story] of narration.stories.entries()){
  assert.deepEqual(story.directions,f.prepared.legs[i+1].directions,'Next directions must be the exact onward leg');
  assert.equal(story.transcript,f.draft.stories[i].paragraphs.map(p=>p.text).join('\n\n'),'Visual navigation projection does not change rendered transcript');
 }
 for(const line of f.prepared.legs.at(-1)!.directions)assert.ok(narration.finishInstructions.includes(line),'Complete return remains visible when all stops finish');
 assert.ok(!narration.finishInstructions.includes('Model finish'));assert.deepEqual(narration.chapters.map(c=>c.directions),f.draft.chapters.map(c=>c.directions));
 assert.deepEqual(f.draft,originalDraft,'Frozen model artifact remains unchanged');
 input.stories[0].directions[0]='Local output mutation';assert.notEqual(f.prepared.legs[1].directions[0],'Local output mutation');
});

test('canonical navigation projection refuses missing legs or player field overflow rather than dropping instructions',()=>{
 const missing=fixture();missing.prepared.legs.pop();assert.throws(()=>assemble(missing.brief,missing.plan,missing.research,missing.prepared,missing.draft),/full return/);
 const longIntro=fixture();longIntro.prepared.legs[0].directions=['x'.repeat(4000)];assert.throws(()=>assemble(longIntro.brief,longIntro.plan,longIntro.research,longIntro.prepared,longIntro.draft));
 const longReturn=fixture();longReturn.prepared.legs.at(-1)!.directions=['a'.repeat(1100),'b'.repeat(1100)];assert.throws(()=>assemble(longReturn.brief,longReturn.plan,longReturn.research,longReturn.prepared,longReturn.draft));
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
function syntheticAudio(slowFirst = false, stationaryDuration?:number): BuilderAudioTools {
  const voiceConfig = { provider: 'synthetic-test', voice: 'bm_george', model: 'fixture', revision: 'fixture', dtype: 'fp32', device: 'cpu', speed: 1, kokoroJs: 'fixture', paragraphGapSeconds: 0.25, loudnessLufs: -19, encoding: 'test only', rendererRevision: 2 };
  return { voiceConfig, async render(text, destination) {
    await writeFile(destination, Buffer.concat([Buffer.from('00000018667479704d34412000000000', 'hex'), Buffer.from(text)]));
    await writeFile(`${destination}.render.json`, JSON.stringify({ voiceConfig, chunks: text.split('\n\n').map(chunk => ({ text: chunk, durationSeconds: stationaryDuration!==undefined&&/^Synthetic (revised )?account [0-3] /.test(text)?(stationaryDuration-0.25)/2:slowFirst && text.startsWith('Synthetic account 0 ') ? 800 : 2 })) }));
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
async function replay(t: TestContext, rejectReviews: boolean, measuredOverrun = false, failTester = false, evidenceRepair:'valid'|'invalid'|false=false, stationaryBudget?:number, invalidFirstThrough=false, readiness:'all'|'selected'|'unrepaired'|false=false,experience:'legacy'|'short'|'fit'|'correct'='legacy',rejectDirections:boolean|'ambiguous'=false) {
  const f = fixture(); if(stationaryBudget!==undefined)f.brief.durationSeconds=f.prepared.walkingSeconds+f.plan.allowanceSeconds+stationaryBudget; await mkdir('local-data', { recursive: true }); const directory = await mkdtemp(resolve('local-data/factory-pipeline-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  if(experience==='fit'||experience==='correct')f.brief.durationSeconds=f.prepared.walkingSeconds+f.plan.allowanceSeconds+480;
  const requests: string[] = [], testerInputs: unknown[] = []; let buildCalls = 0, routeCalls = 0;
  const evidenceRequests:InferenceRequest[]=[],network={map:0,image:0};
  const imageUrl='https://example.com/retained.png',imageBytes=Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489','hex');
  let mapText='',mapUrl='';
  const accepted: FactoryReview = { verdict: 'accepted', summary: 'Synthetic desk review', issues: [], checks: ['Synthetic exact-input check'] };
  const provider = { async request(request: InferenceRequest):Promise<ProviderResult> {
    const name = request.jsonSchema!.name; requests.push(name);
    if (name === 'survey') { assert.ok(request.instructions.includes(f.brief.area)); return providerResult(request, f.survey); }
    if (name === 'research' && requests.filter(n => n === name).length === 1) return providerResult(request, null, [...f.research.sources.map((s, i) => ({ type: 'function_call', namespace: 'factory', name: 'read_page', call_id: `page-${i}`, arguments: JSON.stringify({ url: s.url }) })),...(evidenceRepair?[
      {type:'function_call',namespace:'factory',name:'read_map',call_id:'map-original',arguments:JSON.stringify({latitude:51.55,longitude:-0.17,radius:100})},
      {type:'function_call',namespace:'factory',name:'read_image',call_id:'image-original',arguments:JSON.stringify({url:imageUrl})}]:[])]);
    if(evidenceRepair&&name==='research'){
      const map=JSON.parse(String(request.input.find(i=>i.type==='function_call_output'&&i.call_id==='map-original')!.output));mapText=map.text;mapUrl=map.url;
      f.research.sources.push({id:'map-source',url:mapUrl,title:'Mapped path',origin:'Synthetic OSM response',passage:'OpenStreetMap mapped features only;',locator:'Map'},{id:'image-source',url:imageUrl,title:'Exterior',origin:'Synthetic pixels',passage:'',locator:'Image'});
      f.research.places[0].sourceIds.push('map-source','image-source');
      const invalid=structuredClone(f.research);invalid.places.push({...invalid.places[0],candidateId:'station-not-a-candidate'});invalid.places[0].essentialUnknowns=['Synthetic standing approach needs evidence'];
      return providerResult(request,invalid);
    }
    if(evidenceRepair&&name==='research_repair'){
      assert.ok(!JSON.stringify(request.tools).includes('"name":"read_image"'),'Previously dispatched protocol keeps its original tools');
      const invalid=structuredClone(f.research);invalid.sources.find(s=>s.id==='map-source')!.passage='';invalid.places[0].essentialUnknowns=['Synthetic standing approach needs evidence'];return providerResult(request,invalid);
    }
    if(evidenceRepair&&name==='research_evidence_repair'){
      evidenceRequests.push(structuredClone({...request,signal:undefined}));
      if(evidenceRequests.length===1){
        const input=JSON.parse(String(request.input[0].content));assert.equal(input.problem.originalResearch.sources.find((s:{id:string})=>s.id==='map-source').passage,'OpenStreetMap mapped features only;');
        return providerResult(request,null,[{type:'function_call',namespace:'factory',name:'read_page',call_id:'map-reopen',arguments:JSON.stringify({url:mapUrl})},{type:'function_call',namespace:'factory',name:'read_page',call_id:'page-reopen',arguments:JSON.stringify({url:f.research.sources[0].url})},{type:'function_call',namespace:'factory',name:'read_image',call_id:'image-reopen',arguments:JSON.stringify({url:imageUrl})}]);
      }
      const map=JSON.parse(String(request.input.find(i=>i.type==='function_call_output'&&i.call_id==='map-reopen')!.output));assert.equal(map.text,mapText);assert.equal(map.url,mapUrl);assert.equal(map.cacheHit,true);
      const page=JSON.parse(String(request.input.find(i=>i.type==='function_call_output'&&i.call_id==='page-reopen')!.output));assert.equal(page.text.length,28000);assert.equal(page.truncated,true);assert.equal(page.cacheHit,true);assert.equal(page.hash,createHash('sha256').update(page.text).digest('hex'));assert.notEqual(page.hash,page.fullHash);
      assert.ok(request.input.some(i=>Array.isArray(i.content)&&i.content.some(p=>p.type==='input_image'&&p.image_url==='data:image/png;base64,'+imageBytes.toString('base64'))));
      const repaired=structuredClone(f.research);if(evidenceRepair==='invalid')repaired.sources.find(s=>s.id==='map-source')!.passage='';return providerResult(request,repaired);
    }
    if(readiness&&(name==='research'||name==='physical_readiness'||name.startsWith('route_research_'))){
      const value=structuredClone(f.research);
      if(name==='research'||readiness==='unrepaired'){
        if(readiness==='selected'){
          value.places[0].essentialUnknowns=['Synthetic unknown public approach'];
          value.places.push({...structuredClone(value.places[1]),candidateId:'place-4'});
        }else value.places.forEach(p=>{p.essentialUnknowns=['Synthetic unknown public approach'];});
      }
      return providerResult(request,value);
    }
    if (name === 'research' || name === 'research_repair') return providerResult(request, f.research);
    if (name.startsWith('route_plan_')) return providerResult(request, {...f.plan,walkingNarration:'eligible-windows',routing:{preferMappedWalkways:false,throughByLeg:invalidFirstThrough&&name==='route_plan_1'?[{legId:'leg-1',points:[{point:f.prepared.geometry[1],sourceUrl:'https://overpass-api.de/api/interpreter#query-'+'b'.repeat(64),basis:'Synthetic missing evidence'}]}]:[]}});
    if(name === 'tester'){
      testerInputs.push(structuredClone(request.input));
      if(failTester&&testerInputs.length===1)return {...providerResult(request,null),status:'failed',diagnostic:{code:'fixture_settled_failure',retryable:false,automaticRetries:0}};
      return providerResult(request,accepted);
    }
    if(name.endsWith('_closure'))return providerResult(request,accepted);
    if(name==='route_directions'||name.startsWith('route_directions_')){assert.ok(request.instructions.includes(PRACTICAL_ACCESS_POLICY));return providerResult(request,{review:rejectDirections?{...accepted,verdict:rejectDirections==='ambiguous'?'accepted':'blocked',issues:[{id:'wrong-crossing',scope:'leg-1',required:true,problem:rejectDirections==='ambiguous'?'Returned corrected directions still await compilation':'Crossing belongs to another road arm',repair:rejectDirections==='ambiguous'?'Compile these unchanged proposed directions':'Resolve the actual crossing identity',evidence:rejectDirections==='ambiguous'?'Synthetic returned directions close the original finding':'Synthetic contradictory map evidence'}]}:accepted,legDirections:f.prepared.legs.map(l=>({legId:l.id,directions:l.directions}))});}
    if (name.startsWith('scout_')) return providerResult(request, accepted);
    if (name === 'writing' || name.startsWith('correction_')) {
      const context = JSON.parse(String(request.input[0].content)) as { prepared: { chapterIds: string[] } };
      const draft: Draft = structuredClone(f.draft); draft.chapters = context.prepared.chapterIds.map((id, i) => ({ ...draft.chapters[i], id }));
      if ((measuredOverrun||experience==='correct') && name.startsWith('correction_')) draft.stories[0].paragraphs[0].text = 'Synthetic revised account 0 concerns about five makers.';
      if(experience==='correct'&&name.startsWith('correction_'))draft.stories.forEach((story,i)=>{story.paragraphs[0].text=`Synthetic revised account ${i} concerns about five makers.`;});
      return providerResult(request, draft);
    }
    if (name.startsWith('editor_') || name.startsWith('verification_')) return providerResult(request, rejectReviews ? { ...accepted, verdict: 'needs-revision', issues: [{ id: 'required-fix', scope: 'story', required: true, problem: 'Synthetic unresolved detail', repair: 'Remove unsupported detail', evidence: 'Synthetic missing support' }] } : accepted);
    throw Error(`Unexpected synthetic phase ${name}`);
  } };
  const runtime = new FactoryRuntime(directory, f.brief, async () => provider, () => '2026-10-07T10:00:00.000Z');
  await writeFile(join(directory,'phase-protocols.json'),JSON.stringify({'experience-policy':experience==='legacy'?1:2,...(evidenceRepair?{'research-repair':1}:{})}));
  const tools = new PublicTools({ directory: join(directory, 'public-tools'), lookup: async () => [{ address: '93.184.216.34', family: 4 }], fetch: async url => {
    if(String(url).startsWith('https://overpass-api.de/')){network.map++;assert.equal(network.map,1,'Retained map must not be fetched again');return Response.json({elements:[{type:'way',id:123,tags:{highway:'footway',access:'yes'},geometry:[{lat:51.55,lon:-0.17},{lat:51.5501,lon:-0.17}]}]});}
    if(String(url)===imageUrl){network.image++;assert.equal(network.image,1,'Retained pixels must not be fetched again');return new Response(imageBytes,{headers:{'content-type':'image/png'}});}
    if (String(url).includes('valhalla1.openstreetmap.de')) {routeCalls++;return Response.json({ trip: { status: 0, units: 'kilometers', summary: { length: f.routed.legs.reduce((n, l) => n + l.distanceMetres, 0) / 1000, time: f.routed.legs.reduce((n, l) => n + l.durationSeconds, 0) }, legs: f.routed.legs.map(l => ({ shape: encode(l.geometry), summary: { length: l.distanceMetres / 1000, time: l.durationSeconds }, maneuvers: l.maneuvers.map(m => ({ instruction: m.instruction, begin_shape_index: m.beginShapeIndex, end_shape_index: m.endShapeIndex, type: m.type })) })) } });}
    const source = f.research.sources.find(s => s.url === String(url)); assert.ok(source);
    return new Response(`<title>${source.title}</title><p>${source.passage}${evidenceRepair&&source===f.research.sources[0]?' Longer retained source context.'.repeat(1500):''}</p>`, { headers: { 'content-type': 'text/html' } });
  } });
  const options = { build: async (...args: Parameters<typeof buildTour>) => { buildCalls++; return buildTour(args[0], { ...args[1], audioTools: experience==='legacy'||experience==='short'?syntheticAudio(measuredOverrun):syntheticAudio(false,experience==='correct'&&buildCalls===1?4:120) }); } };
  return { runtime, tools, options, requests, testerInputs, evidenceRequests, network, routeCalls:()=>routeCalls, buildCalls: () => buildCalls, directory };
}

test('completed legacy research repair uses one bounded evidence recovery with exact retained map and pixels',async t=>{
 const r=await replay(t,false,false,false,'valid'),handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(handoff.status,'awaiting-listening');assert.equal(r.runtime.job.counters.research,2);assert.deepEqual(r.network,{map:1,image:1});
 const original=JSON.parse(await readFile(join(r.directory,'phases/research.json'),'utf8')).result;
 const failed=JSON.parse(await readFile(join(r.directory,'phases/research-repair.json'),'utf8')).result;
 const repaired=JSON.parse(await readFile(join(r.directory,'research-validated.json'),'utf8'));
 assert.ok(original.places.some((p:{candidateId:string})=>p.candidateId==='station-not-a-candidate'));
 assert.equal(failed.sources.find((s:{id:string})=>s.id==='map-source').passage,'');assert.equal(failed.places[0].essentialUnknowns.length,1);
 assert.equal(repaired.sources.find((s:{id:string})=>s.id==='map-source').passage,'OpenStreetMap mapped features only;');assert.equal(repaired.sources.find((s:{id:string})=>s.id==='image-source').passage,'');assert.equal(repaired.places[0].essentialUnknowns.length,0);
 assert.deepEqual(repaired.claims,original.claims);assert.ok(r.runtime.job.events.some(e=>e.type==='factory-allowance'&&e.detail==='research-evidence-repair'));
 const count=r.requests.length;await assert.rejects(runFactory(r.runtime,r.tools,r.options));assert.equal(r.requests.length,count);assert.equal(r.runtime.job.counters.research,2);
});

test('failed bounded evidence recovery preserves artifacts and cannot silently consume another research round',async t=>{
 const r=await replay(t,false,false,false,'invalid');
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/Supporting passage not present/);
 const count=r.requests.length;assert.equal(r.runtime.job.counters.research,2);assert.equal(r.runtime.job.counters.route,0);
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/Supporting passage not present/);assert.equal(r.requests.length,count);assert.equal(r.runtime.job.counters.research,2);
 assert.equal(r.buildCalls(),0);assert.equal(JSON.parse(await readFile(join(r.directory,'phases/research-evidence-repair.json'),'utf8')).result.sources.find((s:{id:string})=>s.id==='map-source').passage,'');
});

test('settled tester failure retries its exact frozen receipt input after actual build rechecks',async t=>{
 const r=await replay(t,false,false,true,false,undefined,false,'all');
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/fixture_settled_failure/);
 const failed=r.runtime.job.costLedger.operations.at(-1)!;
 assert.equal(failed.state,'settled');assert.equal(failed.failure,'fixture_settled_failure');
 const before=r.requests.length,deadline=r.runtime.job.deadline,counters=structuredClone(r.runtime.job.counters);
 await rm(join(r.directory,'review-inputs','tester.json')); // Migrate an already-dispatched phase without a new snapshot.
 r.runtime.recoverKnownFailure(failed.id,'Synthetic checked transport repair');
 const handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(handoff.status,'awaiting-listening');assert.equal(r.buildCalls(),2);
 assert.equal(r.requests.length,before+1,'Only the failed tester is dispatched again');
 assert.deepEqual(r.testerInputs[1],r.testerInputs[0],'Recomputed check times never alter dispatched binding');
 assert.equal(r.runtime.job.deadline,deadline);assert.equal(r.runtime.job.counters.correction,0);
 assert.deepEqual(r.runtime.job.counters,counters,'Readiness replay consumes no allowance again');assert.equal(r.requests.filter(name=>name==='physical_readiness').length,1);assert.equal(r.routeCalls(),1);
 assert.equal(r.runtime.job.costLedger.operations.at(-2)!.id,failed.id,'Original settled failure remains in ledger');
});

test('package review input permits only check timestamps to change and preserves source/check identity',async t=>{
 const r=await replay(t,false);
 const current={acceptedDraftSha256:'draft',preparation:{inputSha256:'input',packageSha256:'package'},packagedNavigation:{introduction:'First leg'},research:{passage:'Retained evidence'},build:{validation:{checkedAt:'first',inputSha256:'input',packageSha256:'package',checks:['Decode passed']}},packageChecks:{checkedAt:'first',checks:['Parser passed']},currentProductionManifest:{validation:{checkedAt:'first'},packageChecks:{checkedAt:'first'}}};
 for(const phase of ['tester','package-check-review'] as const){
  assert.deepEqual(retainPackageReviewInput(r.runtime,phase,current),current);
  const later=structuredClone(current);later.build.validation.checkedAt='later';later.packageChecks.checkedAt='later';later.currentProductionManifest.validation.checkedAt='later';later.currentProductionManifest.packageChecks.checkedAt='later';
  assert.deepEqual(retainPackageReviewInput(r.runtime,phase,later),current);
  for(const mutate of [(v:typeof later)=>{v.preparation.inputSha256='changed';},(v:typeof later)=>{v.preparation.packageSha256='changed';},(v:typeof later)=>{v.packagedNavigation.introduction='Different approach';},(v:typeof later)=>{v.research.passage='Changed evidence';},(v:typeof later)=>{v.build.validation.checks=[];}]){
   const changed=structuredClone(later);mutate(changed);assert.throws(()=>retainPackageReviewInput(r.runtime,phase,changed),/beyond receipt timestamps/);
  }
 }
});

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


test('failed unused empty map lead can be retained separately without altering depended-on evidence',()=>{
 const f=fixture();const failed={...f.research.sources[0],id:'failed-lead',url:'https://example.org/invalid-map-identity',passage:''};f.research.sources.push(failed);
 const original=structuredClone(f.research),cleaned=excludeUnusedEmptySources(f.research,new Map());
 assert.deepEqual(cleaned.excludedSources,[failed]);assert.equal(cleaned.research.sources.length,5);assert.deepEqual(f.research,original);
 const depended=structuredClone(f.research);depended.claims[0].sourceIds.push(failed.id);
 assert.equal(excludeUnusedEmptySources(depended,new Map()).excludedSources.length,0);
 assert.throws(()=>validateResearch(depended,f.survey,new Map(f.research.sources.map(s=>[s.url,{text:s.passage}]))));
 assert.equal(excludeUnusedEmptySources(f.research,new Map([[failed.url,{sha256:'a'.repeat(64)}]])).excludedSources.length,0);
});

test('semantic review mode preserves research constraints without forcing researcher metadata into narration',()=>{
 const f=fixture();f.research.claims[0].qualifications.push('Candidate place-0; first-party institutional history.','Preserve uncertainty; do not invent a precise count.');
 const before=structuredClone(f.research);
 assert.throws(()=>validateDraft(f.draft,f.research,f.plan,f.prepared.chapterIds),/qualification/);
 assert.doesNotThrow(()=>validateDraft(f.draft,f.research,f.plan,f.prepared.chapterIds,'semantic-review'));
 assert.deepEqual(f.research,before,'All material qualifications remain available to writer and independent reviewer');
 const missing=structuredClone(f.draft);missing.stories[0].paragraphs[0].claimIds=['invented'];
 assert.throws(()=>validateDraft(missing,f.research,f.plan,f.prepared.chapterIds,'semantic-review'),/Missing claim/);
});

 test('frozen-route disposition requires explicit acceptance and every unchanged leg; never moves standing points', () => {
 const f=fixture(), review:FactoryReview={verdict:'accepted',summary:'Synthetic resolved crossing',issues:[],checks:['Synthetic evidence']};
 const legDirections=f.prepared.legs.map(l=>({legId:l.id,directions:['Synthetic complete pedestrian approach']}));
 const out=applyRouteDisposition(f.prepared,{review,legDirections});
 assert.deepEqual(out.geometry,f.prepared.geometry);assert.deepEqual(out.stops,f.prepared.stops);assert.equal(out.legs[0].directions[0],legDirections[0].directions[0]);
 assert.throws(()=>applyRouteDisposition(f.prepared,{review:{...review,verdict:'needs-revision'},legDirections}),/explicitly accept/);
 assert.throws(()=>applyRouteDisposition(f.prepared,{review,legDirections:legDirections.slice(1)}),/every unchanged leg/);
 assert.throws(()=>applyRouteDisposition(f.prepared,{review:{...review,issues:[{id:'crossing',scope:'leg-4',required:true,problem:'Missing evidence',repair:'Inspect',evidence:'None'}]},legDirections}),/explicitly accept/);
 });

test('physical instruction repair preserves geometry and standing coordinates and requires exact baseline and retained evidence',()=>{
 const f=fixture(),source={url:'https://example.com/map',text:'Actual synthetic mapping',hash:'test',operationId:'operation-1',callId:'call-1',phaseId:'scout-1',toolName:'read_map'};
 const coverage={schemaVersion:1,baselinePlanSha256:digest(f.plan),baselinePreparedSha256:digest(f.prepared),legDirections:f.prepared.legs.map(l=>({legId:l.id,directions:['Synthetic complete revised crossing instruction']})),findings:[{issueId:'junction',status:'resolved',basis:'Synthetic mapped side road',sourceUrls:[source.url]}],remainingEssentialUnknowns:[],note:'Synthetic repair; review still required'};
 const result=applyPhysicalCoverage(f.plan,f.prepared,coverage,[source]);
 assert.deepEqual(result.prepared.geometry,f.prepared.geometry);assert.deepEqual(result.prepared.stops,f.prepared.stops);
 assert.equal(result.prepared.legs[0].directions[0],coverage.legDirections[0].directions[0]);
 assert.throws(()=>applyPhysicalCoverage(f.plan,f.prepared,{...coverage,baselinePreparedSha256:'stale'},[source]),/exact prepared/);
 assert.throws(()=>applyPhysicalCoverage(f.plan,f.prepared,coverage,[]),/retained route text/);
 assert.throws(()=>applyPhysicalCoverage(f.plan,f.prepared,{...coverage,legDirections:coverage.legDirections.slice(1)},[source]),/every leg/);
});

test('review replay permits only a compiler status introduction change and rejects stale spoken or navigation evidence',()=>{
 const old={draft:{stories:['unchanged transcript']},draftSha256:'same',projectedNavigation:{introduction:'old status',finishInstructions:'return',stories:[{directions:['cross at zebra']}]},physicalCoverage:{source:'same'}};
 const current={...structuredClone(old),producerMetadata:{spokenContent:'stories only'}};current.projectedNavigation.introduction='corrected status';
 assert.deepEqual(retainReviewContext(old,current),old);
 const changed=structuredClone(current);changed.draft.stories[0]='changed fact';assert.throws(()=>retainReviewContext(old,changed),/cannot be reused/);
 const moved=structuredClone(current);moved.projectedNavigation.stories[0].directions=['cross elsewhere'];assert.throws(()=>retainReviewContext(old,moved),/cannot be reused/);
});


test('route shaping requires actual same-job map vertices and keeps leg order distinct from stops',()=>{
 const f=fixture(),url='https://overpass-api.de/api/interpreter#query-'+'a'.repeat(64),point=f.prepared.geometry[1];
 const pages=new Map([[url,{text:'OpenStreetMap mapped features only; '+JSON.stringify([{type:'way',id:1,tags:{highway:'footway'},geometry:[{lat:point.latitude,lon:point.longitude}]}])}]]);
 const plan={...f.plan,routing:{preferMappedWalkways:true,throughByLeg:[{legId:'leg-1',points:[{point,sourceUrl:url,basis:'Synthetic mapped footway vertex'}]}]}};
 const options=routingOptionsForPlan(plan,pages)!;assert.equal(options.throughByLeg.length,f.plan.stopIds.length+1);assert.deepEqual(options.throughByLeg[0],[point]);assert.deepEqual(options.throughByLeg[1],[]);
 const wrongPoint=structuredClone(plan);wrongPoint.routing.throughByLeg[0].points[0].point.latitude+=0.001;assert.throws(()=>routingOptionsForPlan(wrongPoint,pages),/absent/);
 assert.throws(()=>routingOptionsForPlan(plan,new Map()),/exact retained map/);
 const wrongLeg=structuredClone(plan);wrongLeg.routing.throughByLeg[0].legId='leg-7';assert.throws(()=>routingOptionsForPlan(wrongLeg,pages),/Unknown constrained leg/);
 const duplicate=structuredClone(plan);duplicate.routing.throughByLeg.push(duplicate.routing.throughByLeg[0]);assert.throws(()=>routingOptionsForPlan(duplicate,pages),/Duplicate/);
});

test('complete factory permits a useful four-story budget below the old fixed twelve-minute reserve, then checks actual audio',async t=>{
 const r=await replay(t,false,false,false,false,400),handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(r.runtime.job.counters.route,1);assert.ok(handoff.timing.withinTarget);assert.ok(handoff.timing.totalSeconds<=handoff.timing.targetSeconds);
 assert.ok(Math.abs(handoff.timing.targetSeconds-handoff.timing.walkingSeconds-handoff.timing.allowanceSeconds-400)<1e-9);
 assert.ok(r.requests.includes('writing')&&r.requests.includes('tester'));assert.equal(r.buildCalls(),1);
});


test('unverified through point consumes one proposal without routing and reaches a reviewed replacement within the cap',async t=>{
 const r=await replay(t,false,false,false,false,undefined,true);await runFactory(r.runtime,r.tools,r.options);
 assert.equal(r.runtime.job.counters.route,2);assert.ok(r.requests.includes('route_plan_2'));assert.ok(!r.requests.includes('scout_1'));assert.ok(r.requests.includes('scout_2'));
 assert.match(JSON.parse(await readFile(join(r.directory,'route-plan-1-routing-error.json'),'utf8')).summary,/exact retained map evidence/);
});

test('stationary-only route keeps real route and stops while declining otherwise eligible walking windows',()=>{
 const f=fixture();assert.ok(f.prepared.chapterWindows.length>0);
 const quiet=prepareRoute({...f.plan,walkingNarration:'stationary-only'},f.research,f.routed);
 assert.deepEqual(quiet.geometry,f.prepared.geometry);assert.deepEqual(quiet.stops,f.prepared.stops);assert.deepEqual(quiet.legs,f.prepared.legs);
 assert.deepEqual(quiet.chapterIds,[]);assert.deepEqual(quiet.chapterWindows,[]);
});

test('opt-in coincident zero-length final leg becomes stationary arrival without changing raw geometry or legacy directions',()=>{
 const f=fixture(),end=f.plan.end;
 f.research.places.at(-1)!.standing={...end};
 f.routed.legs.at(-2)!.geometry[1]={...end};
 f.routed.legs.at(-1)!.geometry=[{...end},{...end}];
 f.routed.legs.at(-1)!.distanceMetres=0;f.routed.legs.at(-1)!.durationSeconds=0;
 f.routed.legs.at(-1)!.maneuvers[0].instruction='Walk north on the walkway.';
 const original=structuredClone(f.routed),legacy=prepareRoute(f.plan,f.research,f.routed);
 const normalized=prepareRoute(f.plan,f.research,f.routed,{normalizeCoincidentFinalLeg:true});
 assert.deepEqual(legacy.legs.at(-1)!.directions,['Walk north on the walkway.']);
 assert.deepEqual(normalized.legs.at(-1)!.directions,['You are already at the tour endpoint. No further walking is needed.']);
 assert.deepEqual(normalized.geometry,legacy.geometry);assert.deepEqual(normalized.stops,legacy.stops);assert.deepEqual(normalized.chapterWindows,legacy.chapterWindows);
 assert.equal(normalized.routeMetres,legacy.routeMetres);assert.deepEqual(f.routed,original);
 assert.match(normalized.legs.at(-1)!.evidence,/zero metres\/seconds/);
 validateBuilderInput(assemble(f.brief,f.plan,f.research,normalized,f.draft));
});

test('normalization never suppresses a short nonzero, moving, noncoincident or intermediate leg',()=>{
 for(const kind of ['distance','duration','geometry','standing','intermediate'] as const){
  const f=fixture(),end=f.plan.end;
  f.research.places.at(-1)!.standing={...end};f.routed.legs.at(-2)!.geometry[1]={...end};
  const final=f.routed.legs.at(-1)!;final.geometry=[{...end},{...end}];final.distanceMetres=0;final.durationSeconds=0;final.maneuvers[0].instruction='Keep real final directions.';
  if(kind==='distance')final.distanceMetres=0.01;
  if(kind==='duration')final.durationSeconds=0.01;
  if(kind==='geometry')final.geometry[1].latitude+=0.00000001;
  if(kind==='standing')f.research.places.at(-1)!.standing.latitude+=0.00000001;
  if(kind==='intermediate'){
   final.distanceMetres=1;
   const first=f.routed.legs[0];f.research.places[0].standing={...f.plan.start};first.geometry=[{...f.plan.start},{...f.plan.start}];first.distanceMetres=0;first.durationSeconds=0;f.routed.legs[1].geometry[0]={...f.plan.start};
  }
  const value=prepareRoute(f.plan,f.research,f.routed,{normalizeCoincidentFinalLeg:true});
  assert.deepEqual(value.legs.at(-1)!.directions,['Keep real final directions.']);
  if(kind==='intermediate')assert.deepEqual(value.legs[0].directions,[f.routed.legs[0].maneuvers[0].instruction]);
 }
});

test('fresh all-unknown research uses physical readiness once before first route and reaches a checked package',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,'all');const handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(handoff.status,'awaiting-listening');assert.equal(r.runtime.job.counters.research,1);assert.equal(r.runtime.job.counters.route,1);assert.equal(r.routeCalls(),1);
 assert.ok(r.requests.indexOf('physical_readiness')<r.requests.indexOf('route_plan_1'));assert.ok(!r.requests.includes('route_plan_2'));
 const protocol=JSON.parse(await readFile(join(r.directory,'phase-protocols.json'),'utf8'));assert.equal(protocol['physical-readiness'],2);assert.equal(protocol['coincident-final-leg'],2);
 const before=r.requests.length;
 // Directly replay retained phases up to the terminal-state guard; the CLI returns
 // an existing completed handoff without entering runFactory a second time.
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/Offline review draft built/);
 assert.equal(r.requests.length,before,'Completed readiness/route retain exact bindings on replay');assert.equal(r.runtime.job.counters.research,1);
});

test('exhausted research or still-unknown readiness blocks before any phantom route request',async t=>{
 for(const mode of ['exhausted','unrepaired'] as const){
  const r=await replay(t,false,false,false,false,undefined,false,mode==='exhausted'?'all':'unrepaired');
  if(mode==='exhausted')r.runtime.job.counters.research=2;
  await assert.rejects(runFactory(r.runtime,r.tools,r.options),mode==='exhausted'?/research allowance exhausted before routing/:/did not establish four eligible/);
  assert.equal(r.runtime.job.counters.route,0);assert.equal(r.routeCalls(),0);assert.ok(!r.requests.some(name=>name.startsWith('route_plan_')));assert.equal(r.buildCalls(),0);
  assert.equal(r.runtime.job.counters.research,mode==='exhausted'?2:1);
 }
});

test('selected real IDs with physical unknowns use remaining research before a replacement route, not a failed router call',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,'selected');await runFactory(r.runtime,r.tools,r.options);
 assert.ok(!r.requests.includes('physical_readiness'),'Four other eligible places bypass proactive repair');
 assert.ok(r.requests.indexOf('route_plan_1')<r.requests.indexOf('route_research_1'));assert.ok(r.requests.indexOf('route_research_1')<r.requests.indexOf('route_plan_2'));
 assert.equal(r.runtime.job.counters.research,1);assert.equal(r.runtime.job.counters.route,2);assert.equal(r.routeCalls(),1);assert.ok(!r.requests.includes('scout_1'));
});

test('previously dispatched route jobs freeze the legacy readiness path without injecting a repair',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,'all');
 r.runtime.job.tasks.push({taskId:'legacy-route-task',role:'route',scope:'route-plan-1',purpose:'Retained dispatched fixture',inputRefs:[],audienceContext:r.runtime.brief.audience,allowedDecisions:[],toolPermissions:[],limits:{seconds:1},expectedOutput:'Fixture',completionCondition:'Fixture',recipient:'producer',contextId:'legacy',execution:'returned',operationId:'legacy-operation'});
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/Incomplete phase route-plan-1/);
 const protocols=JSON.parse(await readFile(join(r.directory,'phase-protocols.json'),'utf8'));assert.equal(protocols['physical-readiness'],1);assert.equal(protocols['coincident-final-leg'],1);
 assert.ok(!r.requests.includes('physical_readiness'));assert.equal(r.runtime.job.counters.research,0);assert.equal(r.routeCalls(),0);
});


test('duration policy rejects the actual compact Hampstead estimate and uses a bounded range',()=>{
 const budget=durationBudget(3600,1079.725,480,4);
 assert.equal(budget.routeFeasible,false);assert.equal(durationFits(1887.825,budget),false);
 assert.equal(durationFits(3300,budget),true);assert.equal(durationFits(3900,budget),true);
 assert.equal(durationFits(3299,budget),false);assert.equal(durationFits(3901,budget),false);
});
test('new factory rejects an underfilled route before scouting, writing or rendering within three proposals',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,false,'short');
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/three proposals/);
 assert.equal(r.runtime.job.counters.route,3);assert.equal(r.buildCalls(),0);
 assert.ok(!r.requests.some(n=>n.startsWith('scout_')||n==='writing'));
});
test('new factory accepts actual measured duration in range with practical canonical directions',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,false,'fit');
 const handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(handoff.durationAcceptance.status,'estimate-within-range');
 assert.equal(r.buildCalls(),1);assert.ok(r.requests.includes('route_directions_1'));assert.ok(r.requests.indexOf('route_directions_1')<r.requests.indexOf('scout_1'));
});
test('new factory corrects measured underfill instead of accepting an upper-bound-only pass',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,false,'correct');
 const handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(handoff.durationAcceptance.status,'estimate-within-range');assert.equal(r.buildCalls(),2);
 assert.equal(r.runtime.job.counters.correction,1);
 const feedback=JSON.parse(await readFile(join(r.directory,'render-feedback-0.json'),'utf8'));
 assert.match(feedback.validationError,/falls outside/);
});

test('practical crossing policy still blocks a concrete wrong-crossing direction before writing',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,false,'fit',true);
 await assert.rejects(runFactory(r.runtime,r.tools,r.options),/three proposals/);
 assert.equal(r.buildCalls(),0);assert.ok(!r.requests.includes('writing'));
});

test('accepted direction review with contradictory required flags uses one frozen clarification, preserving original',async t=>{
 const r=await replay(t,false,false,false,false,undefined,false,false,'fit','ambiguous');
 const handoff=await runFactory(r.runtime,r.tools,r.options);
 assert.equal(handoff.durationAcceptance.status,'estimate-within-range');
 assert.equal(r.requests.filter(n=>n==='route_directions_1_closure').length,1);
 const original=JSON.parse(await readFile(join(r.directory,'phases/route-directions-1.json'),'utf8')).result;
 assert.equal(original.review.issues[0].required,true);assert.equal(original.review.verdict,'accepted');
 assert.equal(r.runtime.job.counters.route,1);
});
