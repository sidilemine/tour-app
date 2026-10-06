// Retrospective, explicit import of supervised manual calibration artifacts.
// It never dispatches a provider or upgrades returned output into acceptance.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createJob, putRecord, issue, event, finish, exact, fresh } from './engine';
import { saveJob, loadJob } from './store';
import { RecordItem, Ref, Usage, ref, audienceSchema } from './records';
import type { Fixture } from '../../src/domain/fixture';
import { distance } from '../../src/domain/fixture';
import type { Story } from '../../src/domain/narration';
import { parseTourPackage } from '../../src/tours/package';
const root='content/generation-pilot';
const read=(name:string)=>JSON.parse(readFileSync(`${root}/${name}`,'utf8'));
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const now=new Date().toISOString();
const inputs=['plan.json','stories.json','evidence.json','encounters.json','preparation.json','package.json'];
const fingerprint=inputs.map(path=>`${path}:${sha(`${root}/${path}`)}`).join('\n');
const path=`${root}/authoring-job.json`;
if(existsSync(path)) {
  const previous=loadJob(path);
  assert.equal(previous.conditions.startingEvidence,fingerprint,'Changed pilot inputs: preserve this job and import a new version explicitly');
  previous.records.forEach(r=>{r.dependsOn.forEach(d=>exact(previous,d));assert.ok(fresh(previous,ref(r)));});
  console.log(`Existing manual-calibration job validated: ${previous.records.length} records; no duplicate work or altered reviews.`);
} else {
  const plan=read('plan.json') as {fixture:Fixture;authoring:{routeMetres:number}};
  const stories=(read('stories.json') as {stories:Omit<Story,'audio'>[]}).stories;
  const evidence=read('evidence.json') as {sources:{id:string;url:string;title:string;retrievedAt:string;publishedAt:string|null;locator:string;passage:string|null;rights:string;freshRead:boolean}[];claims:{id:string;storyId:string;text:string;kind:string;qualification:string;sourceIds:string[]}[]};
  const encounters=(read('encounters.json') as {encounters:{id:string;landmark:{name:string;address:string};visitorCandidate:{latitude:number;longitude:number};approach:string;viewpoint:string;access:string;camera:{latitude:number;longitude:number;captureDate:string}|null;imageryStatus:string}[]}).encounters;
  const prepared=read('preparation.json') as {preparedAt:string;synthesis:Record<string,unknown>;recordings:{id:string;path:string;sha256:string;bytes:number;durationSeconds:number}[];timing:{walkingMinutesAt4_5KmH:number;stationaryAudioMinutes:number;lookingSettlingCrossingAllowanceMinutes:number}};
  const pkg=parseTourPackage(read('package.json'));
  const j=createJob('clerkenwell-balanced-manual-calibration',now,'manual-calibration');
  j.conditions.model='Codex implementation assistance; exact runtime usage unavailable; NOT gpt-6.1-sol subscription trial';
  j.conditions.effort='unknown; not a controlled comparison';j.conditions.tools=['built-in web research','public account-free Valhalla','cached local Kokoro George','actual app parseTourPackage','ffprobe/ffmpeg'];
  j.conditions.startingEvidence=fingerprint;
  j.conditions.promptHashes={};
  const audience=audienceSchema.parse({reason:'Find ordinary skilled work behind public Clerkenwell exteriors',assumedKnowledge:'Little neighbourhood familiarity',intendedDiscovery:'Meat carrying, reused architecture, working writers, practical cooperation and handmade flowers',presentAnchor:'Five public exterior story stops on a Farringdon loop'});
  function add(id:string,kind:RecordItem['kind'],data:unknown,dependsOn:Ref[]=[]):RecordItem {
    const distinct=[...new Map(dependsOn.map(r=>[`${r.id}@${r.revision}`,r])).values()];
    return putRecord(j,{id,kind,revision:1,owner:'manual-pilot-integrator',createdAt:now,updatedAt:now,dependsOn:distinct,data},now);
  }
  const brief=add('pilot-brief','brief',{originalRequest:'Balanced proposed 60-minute daytime Clerkenwell loop, Farringdon start/end, public exterior, low familiarity, ordinary lives and less obvious stories.',requirements:['Farringdon Cowcross Street start and end','60-minute planning envelope','Public exterior stops','No invented distinctive claim','At least three actual narration samples'],preferences:['Ordinary lives','Warm documentary narration','Low assumed neighbourhood knowledge'],assumptions:['4.5 km/h walking estimate','Daytime; specific outing date unknown','Quiet walking legs in this calibration'],delegation:['Routine theme/route selection','Adapt existing evidence and scripts','Local free George synthesis'],endpoints:['Farringdon Cowcross Street entrance','Farringdon Cowcross Street entrance'],area:'Clerkenwell, London',researchExtent:'Reused September Clerkenwell survey and research with bounded October current-use refresh',routeExtent:'2.245 km southern Clerkenwell public-street loop',durationSeconds:3600,audience,access:'Exterior only; exact current station/Smithfield standing clearance unresolved',date:'Proposed daytime; no outing date selected'});
  const sources=new Map<string,RecordItem>();
  for(const s of evidence.sources) {
    if(!s.passage){event(j,now,'source-gap',`${s.id}: reference retained in evidence.json; no supporting passage invented or imported`);continue;}
    sources.set(s.id,add(s.id,'source',{url:s.url,title:s.title,origin:s.freshRead?'October web-text refresh':'September retained researcher record, not independently rediscovered',publishedOn:s.publishedAt,retrievedAt:`${s.retrievedAt}T00:00:00.000Z`,passage:s.passage,locator:s.locator,retention:'minimal-passage',attribution:s.title,exportAllowed:true}));
  }
  const routeSource=add('pilot-route-evidence','source',{url:'https://valhalla.github.io/valhalla/start/introduction/',title:'Retained Valhalla responses and archived selected geometry',origin:'Actual saved public router responses; raw coordinates and metadata retained under routes/',publishedOn:null,retrievedAt:now,passage:JSON.stringify({start:read('routes/start-response.json').trip.summary,return:read('routes/return-response.json').trip.summary,archivedCore:'content/clerkenwell/plan.json vertices 92–246',archivedSha256:sha('content/clerkenwell/plan.json')}),locator:'content/generation-pilot/routes/*-response.json and ROUTE.md; © OpenStreetMap contributors ODbL',retention:'minimal-passage',attribution:'FOSSGIS Valhalla; © OpenStreetMap contributors ODbL',exportAllowed:true});
  const encounterMap=new Map<string,RecordItem>(),candidateMap=new Map<string,RecordItem>();
  for(const e of encounters) {
    const id=e.id.replace('pilot-encounter-','');
    const unknowns=['Landmark coordinate not independently resolved','Current pedestrian clearance and works not observed'];
    if(!e.camera)unknowns.push('No satisfactory exterior standing-position imagery');
    const enc=add(e.id,'encounter',{landmark:{value:null,reason:`${e.landmark.name}, ${e.landmark.address}; do not substitute camera/visitor position`},visitor:{value:e.visitorCandidate,reason:'Desk candidate only'},camera:{value:e.camera?{latitude:e.camera.latitude,longitude:e.camera.longitude}:null,reason:e.camera?'Archived camera, never visitor position':'No satisfactory exterior imagery'},approach:e.approach,intendedView:e.viewpoint,captureDate:e.camera?.captureDate??null,checkedAt:now,state:'unverified',observations:[e.imageryStatus],interpretations:['Archived facade identity can inform the candidate but cannot prove present clearance'],conditions:[e.access],unknowns,evidenceRefs:[ref(routeSource)]},[ref(routeSource)]);
    encounterMap.set(id,enc);
    candidateMap.set(id,add(`pilot-candidate-${id}`,'candidate',{name:e.landmark.name,landmark:{value:null,reason:'Named/addressed place; exact landmark point unresolved'},audience:{...audience,presentAnchor:e.viewpoint},disposition:'selected',rationale:'Selected by delegated integrator for manual draft; no output acceptance or owner enjoyment implied',alternatives:['Charterhouse, Ingersoll and Exmouth omitted to retain station return within hour']},[ref(brief),ref(enc)]));
  }
  const claimMap=new Map<string,RecordItem>();
  for(const c of evidence.claims) {
    if(c.kind==='editorial'||c.kind==='physical')continue;
    const refs=c.sourceIds.flatMap(id=>sources.has(id)?[ref(sources.get(id)!)]:[]);
    assert.ok(refs.length,`${c.id}: no retained passage`);
    // Preserve full contextual qualification in scope; spoken qualification markers remain literal.
    const qualifiers=['Imagine a delivery','To picture the skill','A mission assistant reported','Writing after Quelch’s death','sometimes','advertised'].filter(q=>c.text.includes(q));
    claimMap.set(c.id,add(c.id,'claim',{proposition:c.text,qualifications:qualifiers,sourceRefs:refs,status:'proposed',scope:c.qualification+' Independent current-version sentence review remains pending; related minimal excerpts are not blanket entailment.'},refs));
  }
  const routePoints=plan.fixture.route,stopRecords=plan.fixture.stops.map(s=>candidateMap.get(s.id)!);
  const routeStops=[...stopRecords,stopRecords[0]],indices=[...plan.fixture.stops.map(s=>s.routeIndex),routePoints.length-1];
  const legs=routeStops.slice(0,-1).map((s,i)=>{const geometry=routePoints.slice(indices[i],indices[i+1]+1);let metres=0;geometry.slice(1).forEach((v,k)=>{metres+=distance(geometry[k],v);});return {from:s.id,to:routeStops[i+1].id,geometry,distanceMetres:metres,durationSeconds:metres/1.25,maneuvers:i<5?[plan.fixture.stops[i+1].approach]:stories.at(-1)!.directions,provider:i===0||i===5?'FOSSGIS public Valhalla, fresh 6 October':'Retained 20 September Valhalla selected geometry',retrievedAt:i===0||i===5?now:'2026-09-20T00:00:00.000Z',evidenceRefs:[ref(routeSource)]};});
  const route=add('pilot-route','route',{stops:routeStops.map(ref),encounterRefs:[...encounterMap.values()].map(ref),legs,walkingSeconds:prepared.timing.walkingMinutesAt4_5KmH*60,speechSeconds:prepared.timing.stationaryAudioMinutes*60,overlapSeconds:0,lookingSeconds:prepared.timing.lookingSettlingCrossingAllowanceMinutes*60-180,practicalSeconds:180,allowanceSeconds:3600,assumptions:['Movement estimated at 4.5 km/h; no field timing','Three minutes crossing/settling assigned within total remainder, not observed','No walking speech; all recorded audio counted once','Return endpoint is a route waypoint, not a seventh narration stop']},[ref(brief),...routeStops.map(ref),...[...encounterMap.values()].map(ref),ref(routeSource)]);
  const scriptMap=new Map<string,RecordItem>();
  for(const s of stories) {
    const claims=evidence.claims.filter(c=>c.storyId===s.id);
    const assertions=claims.map(c=>{const claim=claimMap.get(c.id);return {text:c.text,kind:claim?'factual' as const:'physical' as const,evidenceRefs:claim?[ref(claim)]:[ref(encounterMap.get(s.id)!),ref(encounterMap.get(plan.fixture.stops[plan.fixture.stops.findIndex(p=>p.id===s.id)+1]?.id ?? 'farringdon')!)],qualifications:claim?.kind==='claim'?claim.data.qualifications:[]};});
    // Introduction mixes editorial scene-setting with route instruction: conservative physical classification.
    const dependencies=[ref(brief),ref(route),ref(candidateMap.get(s.id)!),...assertions.flatMap(a=>a.evidenceRefs)];
    const seconds=prepared.recordings.find(r=>r.id===s.id)!.durationSeconds;
    scriptMap.set(s.id,add(`pilot-script-${s.id}`,'script',{audience:{...audience,presentAnchor:plan.fixture.stops.find(p=>p.id===s.id)!.viewpoint},transcript:s.transcript,narrationWindowSeconds:seconds,assertions,pronunciation:['Human listening pending; no pronunciation pass inferred from decode'],delivery:'Local George, warm documentary; stationary. Historical prose adapted, not newly generated by subscription adapter.'},dependencies));
  }
  const assets=prepared.recordings.map(a=>add(`pilot-audio-${a.id}`,'asset',{clipId:a.id,path:a.path,sha256:a.sha256,bytes:a.bytes,measuredSeconds:a.durationSeconds,voice:'Kokoro bm_george',settings:prepared.synthesis,rights:'Original AI-assisted script adaptation, local cached Kokoro; Apache-2.0 model. Private review; no third-party images.',exportAllowed:true,listening:'pending'},[ref(scriptMap.get(a.id)!)]));
  const packageRecord=add('pilot-package','package',{path:`${root}/package.json`,sha256:sha(`${root}/package.json`),importer:'walking-tour-package-v1',structuralChecks:[`parseTourPackage passed with ${pkg.assets.length} complete audio assets and bundled map coverage`,'ffprobe mono 24 kHz, complete paragraph PCM/encoded duration, ffmpeg full decode passed','Transport MD5s and sample identities passed'],assetRefs:assets.map(ref),device:'pending',outdoors:'pending'},[ref(route),...[...scriptMap.values()].map(ref),...assets.map(ref)]);
  for(const id of ['farringdon','smithfield'])issue(j,{itemId:encounterMap.get(id)!.id,category:'exterior-position',owner:'scout',required:true,description:'Exact current exterior standing clearance unresolved; no satisfactory current imagery/field observation',resolution:'Review suitable exterior evidence or one targeted ordinary-use observation; revise candidate if needed',refs:[ref(encounterMap.get(id)!)]},now);
  issue(j,{itemId:packageRecord.id,category:'current-review-and-listening',owner:'planner-producer',required:true,description:'Independent current-version source/editorial review and human listening pending; recordings/parse are not acceptance',resolution:'Review frozen inputs and actual recordings, retain qualifications, resolve practical route issues before package acceptance',refs:[ref(packageRecord)]},now);
  const usage:Usage={inputTokens:null,outputTokens:null,subscription:false,apiEquivalentUsd:null,priceDate:null,uncertainty:'Manual Codex assistance; model usage/active research time not observed. No subscription-stage request or paid API call.'};
  const initialRender=(read('render-runs.json') as {elapsedSeconds:number;finishedAt:string}[])[0];
  j.tasks.push({taskId:'manual-pilot-artifact-import',role:'planner-producer',purpose:'Retain already-completed manual calibration artifacts without implying workflow equivalence',scope:'Frozen local pilot artifacts only',inputRefs:[ref(brief)],audienceContext:audience,allowedDecisions:['Select reversible draft content'],toolPermissions:['Observed local tools and free public-coordinate router only'],limits:{seconds:1200},expectedOutput:'Inspectable draft, source gaps, measured media and actual transport',completionCondition:'Returned useful artifacts; acceptance remains separate',recipient:'planner-producer',contextId:'manual-context-not-independent-review',execution:'returned',result:{usableOutputRefs:[ref(packageRecord)],unresolvedQuestions:['Route exterior positions','Independent current-version review','Actual listening','Outdoor duration/enjoyment'],failedAttempts:['Sandbox DNS failure','Two formatted-JSON HTTP400 errors','Rejected Peter’s Lane waypoint','Raw-vs-parsed key-order rerun guard corrected in tooling'],usage,recommendedNextAction:'Complete independent review and retain blocked state pending precise physical/listening evidence'}});
  j.costLedger.operations.push({id:'manual-calibration-tools',taskId:'manual-pilot-artifact-import',stage:'retrospective-manual-calibration',state:'settled',reservedUsd:0,chargedUsd:0,startedAt:now,endedAt:now,usage});
  event(j,now,'observed-render-duration',`${initialRender.elapsedSeconds}s initial rendering/validation; active research and overall pre-import elapsed unknown. Initial recording completion: ${initialRender.finishedAt}.`);
  event(j,now,'usage-boundary','Five public router dispatches (two parse errors, three responses, one response rejected); one prior DNS nondispatch. No account/paid overflow path. Costs US$0. Import is not a timed Balanced workflow run.');
  j.counters.research=1;j.counters.route=3;j.counters.correction=1;
  event(j,now,'counter-basis','Research=1 consolidated current-context/source refresh in one manual context, reusing archived survey rather than recounting it. Route=3 completed public solutions: rejected start via Peter’s Lane, selected direct start, selected return; historical core reuse not dispatched. Correction=1 consolidated evidence/metadata correction batch after independent review: classify physical paragraphs with encounter dependencies and strengthen the flower passage. JSON request repairs are technical failures; the removed waypoint belongs to the counted route proposals. Implementation fixes/import/check-only reruns do not count as content corrections. These retrospective manual counts are not a matched timed workflow run.');
  // Initial renders are not corrective rerenders; cache verification is not a render operation.
  event(j,now,'render-count','Six initial local recordings; zero corrective audio renders; cached validation runs retained separately in render-runs.json.');
  finish(j,'blocked','Manual calibration artifacts retained; independent review, listening and unresolved exterior encounters prevent acceptance. Requested subscription pipeline remains a separate access gate.',now);
  j.records.forEach(r=>{r.dependsOn.forEach(d=>exact(j,d));assert.ok(fresh(j,ref(r)));});
  assert.equal(j.decisions.length,0);assert.equal(j.reviews.length,0);
  saveJob(path,j);console.log(`Imported ${j.records.length} exact-revision records; ${j.issues.length} open issues; no acceptance decisions.`);
}
