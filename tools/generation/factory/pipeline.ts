import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { distance, type Coordinate } from '../../../src/domain/fixture';
import { mapArea } from '../../../src/map/areas';
import { buildTour, validateBuilderInput, type BuilderInput, type BuildResult, type WrittenStory } from '../builder';
import { count, event, finish } from '../engine';
import { SubscriptionProvider } from '../provider';
import { loadOverflowEvidence, renewCredentials } from '../signin';
import { withJobLock } from '../store';
import { briefSchema, draftSchema, excludeUnusedEmptySources, physicalResearchSchema, researchSchema, reviewPasses, reviewSchema, routePlanSchema, surveySchema, validateDraft, validateResearch, type Draft, type FactoryBrief, type Research, type RoutePlan } from './contracts';
import { FactoryRuntime, collectObservedImages, digest, writeJSON, type LocalTool } from './runtime';
import { PublicTools } from './public-tools';
import { inspectBundledMap } from './software-evidence';
import { checkPackageForHandoff } from './package-checks';
import { collectRouteTextEvidence, createRetainedEvidenceTools, type RouteTextEvidence } from './retained-evidence';

export interface RouteLeg {geometry:Coordinate[];distanceMetres:number;durationSeconds:number;maneuvers:{instruction:string;beginShapeIndex:number;endShapeIndex:number;type?:number}[]}
export interface Routed {legs:RouteLeg[];provider:string;retrievedAt:string;url:string}
export interface PreparedRoute {geometry:Coordinate[];stops:{id:string;routeIndex:number;standing:Coordinate}[];legs:BuilderInput['legs'];chapterWindows:Omit<BuilderInput['chapters'][number],'story'>[];chapterIds:string[];walkingSeconds:number;routeMetres:number}
export function resumeAfterLocalFix(runtime:FactoryRuntime,evidence:string){
 const j=runtime.job;
 assert.ok(evidence.trim()&&j.status==='blocked'&&runtime.remainingMs()>0,'A checked local fix and original remaining envelope are required');
 assert.ok(j.costLedger.operations.every(o=>o.state==='settled'&&o.chargedUsd===0),'Unknown outcomes cannot resume through local recovery');
 assert.ok(j.tasks.every(t=>t.execution!=='working'&&existsSync(join(runtime.directory,'phases',t.scope+'.json'))),'Incomplete provider phases need their explicit recovery path');
 event(j,runtime.now(),'factory-local-fix-resume',evidence);j.status='running';j.reason='Checked local implementation fix; completed phases and original limits retained';runtime.save();
}
export function prepareRoute(plan:RoutePlan,research:Research,routed:Routed):PreparedRoute {
 assert.ok(distance(plan.start,plan.end)<=20,'Loop must return to its public starting point');
 assert.equal(new Set(plan.stopIds).size,plan.stopIds.length,'Unique selected stops');
 const places=plan.stopIds.map(id=>{const p=research.places.find(p=>p.candidateId===id);assert.ok(p,`Unknown place ${id}`);assert.equal(p.essentialUnknowns.length,0,`Essential unknowns at ${id}`);return p;});
 assert.equal(routed.legs.length,places.length+1,'Start, every selected stop and return legs');
 assert.ok(distance(routed.legs[0].geometry[0],plan.start)<=10&&distance(routed.legs.at(-1)!.geometry.at(-1)!,plan.end)<=10,'Routed start/end must meet loop endpoints');
 const geometry:Coordinate[]=[],legs:PreparedRoute['legs']=[],stops:PreparedRoute['stops']=[];
 const windows:{length:number;afterStopIndex:number;startRouteIndex:number;endRouteIndex:number;navigationRouteIndex:number}[]=[];
 for(const [i,rawLeg] of routed.legs.entries()){
  // Interpolate only along the returned path, preserving bends and maneuver boundaries.
  // Ten-metre samples provide a usable launch interval; sparse OSM vertices do not.
  const dense:Coordinate[]=[rawLeg.geometry[0]],indices=[0];
  for(let n=1;n<rawLeg.geometry.length;n++){
   const a=rawLeg.geometry[n-1],b=rawLeg.geometry[n],parts=Math.max(1,Math.ceil(distance(a,b)/10));
   for(let k=1;k<=parts;k++)dense.push({latitude:a.latitude+(b.latitude-a.latitude)*k/parts,longitude:a.longitude+(b.longitude-a.longitude)*k/parts});
   indices.push(dense.length-1);
  }
  const leg={...rawLeg,geometry:dense,maneuvers:rawLeg.maneuvers.map(m=>({...m,beginShapeIndex:indices[m.beginShapeIndex],endShapeIndex:indices[m.endShapeIndex]}))};
  assert.ok(leg.geometry.length>=2&&leg.maneuvers.length,'Usable pedestrian geometry and directions');
  const startRouteIndex=geometry.length?geometry.length-1:0;
  if(geometry.length)assert.ok(distance(geometry.at(-1)!,leg.geometry[0])<3,'Connected route legs');
  geometry.push(...leg.geometry.slice(geometry.length?1:0));
  const endRouteIndex=geometry.length-1;
  legs.push({id:`leg-${i+1}`,startRouteIndex,endRouteIndex,directions:leg.maneuvers.map(m=>m.instruction).filter(Boolean),evidence:`${routed.provider}; ${routed.url}; retrieved ${routed.retrievedAt}; public OSM pedestrian route, not an access inspection`});
  if(i<places.length){assert.ok(distance(places[i].standing,geometry[endRouteIndex])<=10,`Router snapped beyond standing tolerance: ${places[i].candidateId}`);stops.push({id:plan.stopIds[i],routeIndex:endRouteIndex,standing:places[i].standing});}
  if(i>0&&i<places.length)for(const m of leg.maneuvers){
   const begin=startRouteIndex+m.beginShapeIndex,end=startRouteIndex+m.endShapeIndex;
   // Reserve an interval well inside one navigation segment. Never narrate over its next decision.
   if(end-begin<5)continue;
   let start=Math.max(begin+1,startRouteIndex+1);
   while(start<end&&(distance(geometry[start],places[i-1].standing)<=45||distance(geometry[start],places[i].standing)<=45))start++;
   if(start>=end)continue;
   let latest=start,launchMetres=0;
   while(latest<end&&launchMetres<30){latest++;launchMetres+=distance(geometry[latest-1],geometry[latest]);}
   let length=0;for(let n=latest+1;n<=end;n++)length+=distance(geometry[n-1],geometry[n]);
   const clear=geometry.slice(start,latest+1).every(p=>distance(p,places[i-1].standing)>40&&distance(p,places[i].standing)>40);
   if(clear&&launchMetres>=30&&length>=150&&end<geometry.length)windows.push({length,afterStopIndex:i-1,startRouteIndex:start,endRouteIndex:latest,navigationRouteIndex:end});
  }
 }
 for(let n=1;n<geometry.length;n++)assert.ok(distance(geometry[n-1],geometry[n])<250,'Route geometry too sparse');
 const picked:typeof windows=[];
 for(const w of windows.sort((a,b)=>b.length-a.length))if(!picked.some(p=>p.afterStopIndex===w.afterStopIndex)&&picked.length<2)picked.push(w);
 picked.sort((a,b)=>a.afterStopIndex-b.afterStopIndex);
 const chapterWindows=picked.map(({length,...w})=>({...w,fastWalkingMetresPerSecond:1.8,marginSeconds:15,maximumAudioSeconds:Math.floor(Math.min(80,length/1.8-15))}));
 const routeMetres=geometry.slice(1).reduce((s,p,i)=>s+distance(geometry[i],p),0);
 return {geometry,stops,legs,chapterWindows,chapterIds:chapterWindows.map((_,i)=>`walking-${i+1}`),routeMetres,walkingSeconds:routeMetres/plan.walkingMetresPerSecond};
}
export function assemble(brief:FactoryBrief,plan:RoutePlan,research:Research,prepared:PreparedRoute,draft:Draft,version=1,qualificationMode:'literal'|'semantic-review'='literal'):BuilderInput {
 validateDraft(draft,research,plan,prepared.chapterIds,qualificationMode);
 assert.equal(prepared.legs.length,draft.stories.length+1,'Canonical navigation needs first approach, every onward leg and full return');
 const numbered=(directions:string[])=>directions.map((line,i)=>`${i+1}. ${line}`).join('\n');
 const story=(s:Draft['stories'][number]):WrittenStory=>{
  const claimIds=new Set(s.paragraphs.flatMap(p=>p.claimIds));const claims=research.claims.filter(c=>claimIds.has(c.id));
  const sourceIds=new Set(claims.flatMap(c=>c.sourceIds));
  // A purely connective chapter still declares the tour sources without treating them as factual support.
  const sources=research.sources.filter(s=>sourceIds.has(s.id));
  return {id:s.id,title:s.title,transcript:s.paragraphs.map(p=>p.text).join('\n\n'),directions:s.directions,sources:(sources.length?sources:research.sources.slice(0,1)).map(s=>({title:s.title,url:s.url})),evidence:s.paragraphs.map(p=>({paragraph:p.text,kind:p.kind==='factual'?'source_checked':p.kind,basis:p.basis,sourceUrls:[...new Set(p.claimIds.flatMap(id=>research.claims.find(c=>c.id===id)!.sourceIds).map(id=>research.sources.find(s=>s.id===id)!.url))]}))};
 };
 const input:BuilderInput={fixture:{schemaVersion:1,id:brief.id,version,title:plan.title,verification:{status:'unverified',note:'Generated by specialist AI roles from fresh public research. Independent desktop reviews and package checks are recorded; human listening and an outdoor visit remain pending.'},route:prepared.geometry,stops:prepared.stops.map(stop=>{const p=research.places.find(p=>p.candidateId===stop.id)!;return {...stop,title:draft.stories.find(s=>s.id===stop.id)!.title,landmark:p.landmark,approach:p.approach,viewpoint:p.viewpoint,access:p.access};})},mapId:brief.mapId,narration:{description:`${plan.title}. ${draft.stories.length} exterior stops, returning to ${brief.end}. This is a desktop review draft; estimated duration and listening status are recorded with the package.`,introduction:`Welcome to ${brief.area}. This AI-written tour uses published sources and mapped pedestrian routes. It has been reviewed at a desk; human listening and an outdoor visit remain pending. Listen while stationary, keep entrances and paths clear, and pause before walking or crossing. Use the saved map and directions, and select stories manually if automatic playback is unavailable. Current access can change: stop if the stated public approach is unavailable.\n\nGetting to the first stop\n${numbered(prepared.legs[0].directions)}`,finishInstructions:`Return to ${brief.end}\n${numbered(prepared.legs.at(-1)!.directions)}`,reviewNote:'Fresh AI-generated draft with independent editorial, verification and route reviews. Listen before walking; use the saved map and manual controls. Public access can change. Listening and field checks are pending.',rightsNote:'Original AI-assisted narration; minimal source passages retained in local research records. OpenStreetMap contributors supply map/routing data. George is rendered locally.'},stories:draft.stories.map((s,i)=>({...story(s),directions:[...prepared.legs[i+1].directions]})),chapters:draft.chapters.map((s,i)=>({...prepared.chapterWindows[i],story:story(s)})),legs:prepared.legs,timing:{targetSeconds:brief.durationSeconds,walkingMetresPerSecond:plan.walkingMetresPerSecond,allowanceSeconds:plan.allowanceSeconds}};
 // These are saved visual instructions. Audio transcripts and chapter directions
 // remain unchanged; the real player parser must accept every complete field.
 validateBuilderInput(input);
 return input;
}

export const routeDispositionSchema=z.object({review:reviewSchema,legDirections:z.array(z.object({legId:z.string(),directions:z.array(z.string().min(1)).min(1).max(8)}).strict()).max(7)}).strict();
/** Disposition may repair instructions, never the frozen route, stops or a rejected verdict. */
export function applyRouteDisposition(prepared:PreparedRoute,disposition:z.infer<typeof routeDispositionSchema>):PreparedRoute {
 assert.ok(reviewPasses(disposition.review),'Route disposition must explicitly accept and close required issues');
 assert.deepEqual(disposition.legDirections.map(l=>l.legId),prepared.legs.map(l=>l.id),'Disposition must account for every unchanged leg in order');
 return {...prepared,legs:prepared.legs.map((leg,i)=>({...leg,directions:disposition.legDirections[i].directions,evidence:leg.evidence+'; bounded route disposition and its retained evidence'}))};
}

export const physicalCoverageSchema=z.object({schemaVersion:z.literal(1),baselinePlanSha256:z.string(),baselinePreparedSha256:z.string(),legDirections:z.array(z.object({legId:z.string(),directions:z.array(z.string().min(1)).min(1).max(8)}).strict()),findings:z.array(z.object({issueId:z.string(),status:z.enum(['resolved','unresolved']),basis:z.string().min(1),sourceUrls:z.array(z.string().url()).min(1)}).strict()),remainingEssentialUnknowns:z.array(z.string()),note:z.string().min(1)}).strict();
export function applyPhysicalCoverage(plan:RoutePlan,prepared:PreparedRoute,value:unknown,evidence:readonly RouteTextEvidence[]){
 const coverage=physicalCoverageSchema.parse(value);
 assert.equal(coverage.baselinePlanSha256,digest(plan),'Physical repair must bind exact plan');
 assert.equal(coverage.baselinePreparedSha256,digest(prepared),'Physical repair must bind exact prepared route');
 assert.deepEqual(coverage.legDirections.map(l=>l.legId),prepared.legs.map(l=>l.id),'Physical repair must retain every leg in order');
 const urls=new Set(evidence.map(e=>e.url));
 assert.ok(coverage.findings.every(f=>f.sourceUrls.every(url=>urls.has(url))),'Physical repair may cite only retained route text');
 return {coverage,prepared:{...prepared,legs:prepared.legs.map((l,i)=>({...l,directions:[...coverage.legDirections[i].directions]}))}};
}

/** Replay prior reviews only across compiler-owned status-introduction changes; require a new production review. */
export function retainReviewContext(archived:Record<string,unknown>,current:Record<string,unknown>){
 const stable=(value:Record<string,unknown>)=>{const copy=structuredClone(value);delete copy.producerMetadata;if(copy.projectedNavigation&&typeof copy.projectedNavigation==='object'){const navigation=copy.projectedNavigation as Record<string,unknown>;delete navigation.introduction;}return copy;};
 assert.deepEqual(stable(archived),stable(current),'Historical review cannot be reused after changed story, source, physical evidence or navigation');
 return archived;
}

/** Rechecks may produce new receipt times, but a retry must retain its exact dispatched input. */
export function retainPackageReviewInput(runtime:FactoryRuntime,phase:'tester'|'package-check-review',current:Record<string,unknown>):Record<string,unknown>{
 const path=join(runtime.directory,'review-inputs',phase+'.json');
 const task=runtime.job.tasks.find(t=>t.scope===phase&&t.operationId);
 const context=task?JSON.parse(readFileSync(join(runtime.directory,'requests',task.operationId+'-context.json'),'utf8')):null;
 const dispatched=context?JSON.parse(context.input[0].content) as Record<string,unknown>:null;
 const saved=existsSync(path)?JSON.parse(readFileSync(path,'utf8')) as Record<string,unknown>:dispatched;
 if(saved){
  if(dispatched)assert.deepEqual(saved,dispatched,'Frozen review must match its dispatched input');
  const stable=(value:Record<string,unknown>)=>{
   const copy=structuredClone(value);
   for(const keys of [['build','validation'],['packageChecks'],['currentProductionManifest','validation'],['currentProductionManifest','packageChecks']]){
    let receipt:unknown=copy;for(const key of keys)receipt=receipt&&typeof receipt==='object'?(receipt as Record<string,unknown>)[key]:undefined;
    if(receipt&&typeof receipt==='object')delete (receipt as Record<string,unknown>).checkedAt;
   }
   return copy;
  };
  assert.deepEqual(stable(saved),stable(current),'Post-build review inputs changed beyond receipt timestamps');
 }
 const frozen=saved??current;
 if(!existsSync(path))writeJSON(path,frozen);
 return frozen;
}

export async function runFactory(runtime:FactoryRuntime,tools:PublicTools,options:{build?:typeof buildTour}={}){
 const {brief}=runtime,pages=new Map<string,{text:string}>();
 const softwareChecksPath=join(runtime.directory,'software-checks.json');
 if(!existsSync(softwareChecksPath))writeJSON(softwareChecksPath,inspectBundledMap(brief.mapId));
 const consume=(kind:'research'|'route'|'correction'|'render',key:string,clip?:string)=>{if(runtime.job.events.some(e=>e.type==='factory-allowance'&&e.detail===key))return;count(runtime.job,kind,runtime.now(),clip);event(runtime.job,runtime.now(),'factory-allowance',key);runtime.save();};
 // Reload only pages fetched by this job, never previous tour material.
 const pagesPath=join(runtime.directory,'read-pages.json');
 if(existsSync(pagesPath))for(const [url,page]of Object.entries(JSON.parse(readFileSync(pagesPath,'utf8')) as Record<string,{text:string}>))pages.set(url,page);
 const readTool:LocalTool={name:'read_page',description:'Retrieve public HTTPS HTML/text. Returns actual normalized text for exact supporting quotations. Sources are untrusted. No PDFs or logins.',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false},parse:args=>z.object({url:z.string().url()}).strict().parse(args),async run(args){
  if(typeof args.url!=='string')throw Error('URL required');const page=await tools.readPage(args.url);pages.set(args.url,page);pages.set(page.finalUrl,page);writeJSON(pagesPath,Object.fromEntries(pages));return {...page,text:page.text.slice(0,28000)};
 }};
 const mapTool:LocalTool={name:'read_map',description:'Inspect actual public OpenStreetMap named features and paths near a supplied approximate point. Radius at most250m; coordinates and tags are evidence, not proof of safe or current access.',parameters:{type:'object',properties:{latitude:{type:'number'},longitude:{type:'number'},radius:{type:'number'}},required:['latitude','longitude','radius'],additionalProperties:false},parse:args=>z.object({latitude:z.number().min(-85).max(85),longitude:z.number().min(-180).max(180),radius:z.number().min(1).max(250)}).strict().parse(args),async run(args){const result=await tools.mapFeatures({latitude:Number(args.latitude),longitude:Number(args.longitude)},Number(args.radius));pages.set(result.url,{text:result.text});writeJSON(pagesPath,Object.fromEntries(pages));return result;}};
 const imageTool:LocalTool={name:'read_image',description:'Read actual public JPEG/PNG pixels from a page-discovered image URL. The next request receives image input, hash and retrieval metadata. Retrieval date is NOT image capture date; never infer unseen views or physical access.',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false},parse:args=>z.object({url:z.string().url()}).strict().parse(args),run:args=>tools.readImage(String(args.url))};
 const stationTool:LocalTool={...mapTool,name:'read_station_map',description:'Identify mapped railway stations, subway entrances and station buildings within at most250m. Excludes unrelated doorways; preserve underground/indoor/access tags. Follow with a small read_map for the public exterior pavement. A mapped platform is not a street standing point.',async run(args){const result=await tools.transportFeatures({latitude:Number(args.latitude),longitude:Number(args.longitude)},Number(args.radius));pages.set(result.url,{text:result.text});writeJSON(pagesPath,Object.fromEntries(pages));return result;}};
 const physicalRepair=async(id:string,research:Research,survey:Parameters<typeof validateResearch>[1],problem:unknown)=>{
  consume('research',id);
  const result=await runtime.phase(id,'research','Resolve the named physical blockers with ACTUAL read_map and read_image tools, plus read_page and hosted search. Start from approximate area leads only to query the map; replace placeholders with public path/pavement positions derived from returned coordinates/geometry. Use page images for meaningful exterior observations, preserving capture-date unknown and camera-versus-visitor distinction. Query only a few bounded250m areas. Choose4–6 researched public-exterior places from existing candidates; add research on those existing candidates if needed. Avoid requiring a particular small detail to be visible when a supported general exterior anchor suffices. A desktop draft does not require guaranteeing future pavement clearance: ordinary contingencies belong in access conditions, while truly unresolved essential access stays in essentialUnknowns. No invented observed photographs or safety claims. read_map result.url and exact short substrings of its text may be retained as physical map sources; minimal quotations total<=25words per source URL. Return COMPLETE research artifact, preserving supported historical claims and stable candidate IDs. Do not manufacture a route or claim a field visit.',{brief,survey,research,problem},physicalResearchSchema,{web:true,tools:[readTool,mapTool,imageTool],maxRequests:5});
  const images=collectObservedImages(runtime.directory),cleaned=excludeUnusedEmptySources(result,images);
  writeJSON(join(runtime.directory,id+'-source-exclusions.json'),{originalSha256:digest(result),reason:'Unreferenced empty non-image discovery leads remain in original phase/gaps; no successful evidence or dependency is removed',excludedSources:cleaned.excludedSources});
  validateResearch(cleaned.research,survey,pages,images);writeJSON(join(runtime.directory,'research-validated.json'),cleaned.research);return cleaned.research;
 };
 const surveyProtocol=runtime.phaseProtocol('survey',2);
 const survey=await runtime.phase('survey','research',`Begin fresh: use hosted web search to catalogue 3–6 published ${surveyProtocol===1?'Hampstead':brief.area} walking tours/guides and their actual advertised stops/themes/stories. Then propose 8–12 varied candidates, at most16. No earlier project material is available. Avoid writing scripts. Open relevant search results; be explicit about gaps.`,{brief},surveySchema,{web:true});
 for(const c of survey.candidates)count(runtime.job,'candidates',runtime.now(),c.id);runtime.save();
 const researchProtocol=runtime.phaseProtocol('research',2);
 let research=await runtime.phase('research','research','Research worthwhile candidates using hosted search AND read_page. Call read_page on at least5 useful accessible primary/authoritative pages. Prefer local institutions, official heritage registers, council and historic evidence. Keep at most25 quoted words total per source URL, choose a compact passage supporting the central claim. Every source passage must be a SHORT EXACT SUBSTRING of returned page text, not a paraphrase, page title or a search snippet. Collect 12–24 compact claims, qualifications and5–8 plausible exterior places. Distinguish landmark and visitor standing coordinates; use source evidence for access/view and state essentialUnknowns when unsupported. Do not invent visibility or coordinate precision. Avoid interiors/paid admission. Retain fresh factual details that support revealing 90–120second stories, not a string of names and dates. Sources may hold multiple related claims. Limit full source passages to the minimum.'+(researchProtocol===2?' Also establish usable public exterior standing points now with read_map and actual read_image pixels, instead of postponing every physical question until route selection. Use read_station_map for the named station entrance identity and a small read_map for exterior pavement; exclude underground platforms. Keep map/image observations separate from claims, camera positions distinct from visitors, and current conditions unverified. A general supported exterior anchor is sufficient: do not make cipher/dome/small-detail visibility essential unless the story needs it. Sources from actual read_map result URLs may retain a short exact text substring; actual inspected image sources may use an empty passage with precise locator/observation. Return4–8 physically plausible researched places distributed enough for the requested tour length, with unresolved essentials explicit. No invented coordinates, access or image observations.':''),{brief,survey},researchProtocol===2?physicalResearchSchema:researchSchema,{web:true,tools:researchProtocol===2?[readTool,mapTool,stationTool,imageTool]:[readTool],maxRequests:7});
 if(researchProtocol===2){const cleaned=excludeUnusedEmptySources(research,collectObservedImages(runtime.directory));writeJSON(join(runtime.directory,'research-source-exclusions.json'),{originalSha256:digest(research),excludedSources:cleaned.excludedSources});research=cleaned.research;}
 try{validateResearch(research,survey,pages,researchProtocol===2?collectObservedImages(runtime.directory):new Map());}catch(error){
  consume('research','research-repair');
  research=await runtime.phase('research-repair','research','Correct only the concrete research validation failures. Read actual pages; replace unverifiable quotations with exact short passages, at most25 quoted words per source URL. Retain candidate IDs. Return the complete repaired research artifact.',{brief,survey,research,validationError:String(error)},researchProtocol===2?physicalResearchSchema:researchSchema,{tools:[readTool],maxRequests:4});validateResearch(research,survey,pages,researchProtocol===2?collectObservedImages(runtime.directory):new Map());
 }
 writeJSON(join(runtime.directory,'research-validated.json'),research);
 let plan:RoutePlan|undefined,prepared:PreparedRoute|undefined,routeReview;
 for(let attempt=0;attempt<3;attempt++){
  const planId=`route-plan-${attempt+1}`;
  const planProtocol=runtime.phaseProtocol(planId,3);
  consume('route',planId);
  const proposalInstructions=planProtocol===3?`Choose4–6 researched public exterior stops for an approximately ${Math.round(brief.durationSeconds/60)}-minute loop. Use only existing eligible IDs without essentialUnknowns. Include the complete return and hills. Allocate roughly18percent of time to stationary narration and8minutes to looking/crossings, with the rest walking at the stated realistic speed; for60minutes this commonly needs about3km, not a compact1km cluster. Seek a supported route close to the target without artificial padding, detours, speed manipulation or invented content. An upper budget alone is not the requested experience. Station and visitor standing coordinates must be evidence-derived, never building centres. Prefer quiet simple connections for walking chapters only when available. Explain exclusions.`:'Choose4–6 stops for a coherent public exterior one-hour loop. Use only places without essentialUnknowns and fresh researched IDs. Account for return to station, hills, 6–10minutes looking/crossing allowance and roughly8–12minutes stationary narration. Aim walking2–3km, shorter if needed. Choose an accurate station exterior start/end coordinate. Route points are public standing positions, never building centres. Do not create new facts. Prefer two long, simple connecting paths suitable for short walking chapters, while allowing quiet. Explain exclusions.';
  plan=await runtime.phase(planId,'route',proposalInstructions+(planProtocol>=2?' This phase proposes the stop order BEFORE the router runs. Complete measured route geometry is deliberately not supplied yet: the next deterministic step requests pedestrian geometry, then an independent Scout checks it. Missing future geometry is not a reason to refuse a provisional order. Never claim route acceptance here. Resolve only the station endpoint using read_station_map for named station/entrance identification, then read_map for adjacent public pavement and read_image/read_page when useful. Earlier broad map output was crowded by unrelated anonymous doors; do not treat its missing station as proof none is mapped. Inspect tags to exclude underground platforms and indoor passageways from the exterior standing point. Use the retained station-photo URL if needed. Keep source/evidence details concise in selectionReason; no history research or new candidate expansion. Return only actual existing stop IDs, no placeholders.':'') ,{brief,survey,research,previous:plan??null,feedback:routeReview??null},routePlanSchema,planProtocol>=2?{tools:[stationTool,mapTool,imageTool,readTool],maxRequests:4}:{});
  const routedPath=join(runtime.directory,`${planId}-routed.json`);
  let routed:Routed;
  if(existsSync(routedPath))routed=JSON.parse(readFileSync(routedPath,'utf8'));
  else{
   const invalid=plan.stopIds.some(id=>!research.places.some(p=>p.candidateId===id))||new Set(plan.stopIds).size!==plan.stopIds.length;
   if(invalid){routeReview={verdict:'needs-revision',summary:`Planner returned an unresolved/refused proposal: ${plan.selectionReason}. No route request was sent.`};writeJSON(join(runtime.directory,`${planId}-invalid-proposal.json`),routeReview);prepared=undefined;
    const repairId=`physical-research-${attempt+1}`;
    if(attempt<2&&(runtime.job.counters.research<2||runtime.job.events.some(e=>e.type==='factory-allowance'&&e.detail===repairId)))research=await physicalRepair(repairId,research,survey,routeReview);
    continue;
   }
   runtime.assertRunning();routed=await tools.pedestrianRoute([plan.start,...plan.stopIds.map(id=>research.places.find(p=>p.candidateId===id)!.standing),plan.end]);runtime.assertRunning();writeJSON(routedPath,routed);
  }
  try{prepared=prepareRoute(plan,research,routed);}catch(error){routeReview={verdict:'needs-revision',summary:String(error)};writeJSON(join(runtime.directory,`${planId}-preparation-error.json`),routeReview);continue;}
  const [west,south,east,north]=mapArea(brief.mapId).catalog.bounds;
  if(prepared.geometry.some(p=>p.longitude<west||p.longitude>east||p.latitude<south||p.latitude>north)){routeReview={verdict:'needs-revision',summary:'Route exceeds available offline map bounds'};prepared=undefined;continue;}
  routeReview=await runtime.phase(`scout-${attempt+1}`,'scout','Independently inspect the exact chosen public standing points, approaches, access evidence and actual routed legs. Source passages and geometry are evidence; model agreement is not. Use read_map or read_image to inspect material uncertainties when needed; never claim imagery inspected without actually reading pixels, or claim a field visit. Assess whether the public exterior approach is sufficiently supported for a desktop draft, distinguish transient conditions from essential missing access/unsafe assumptions. Reject invented left/right, interior access, long snaps, uncertain private paths or blocked essential views. Check whole-hour plausibility and chapter windows; no narration across navigation decisions. Can accept a DESK DRAFT with normal looking/crossing conditions and manual fallback, not claim physical acceptance. Consolidate concrete required repairs.',{brief,plan,research,routed,prepared},reviewSchema,{tools:[readTool,mapTool,imageTool],maxRequests:3});
  if(attempt===2&&!reviewPasses(routeReview)){
   const originalReview=routeReview;
   const crossingTool:LocalTool={...mapTool,name:'read_crossing_map',description:'Inspect explicit mapped crossing nodes, crossing footways, public footways and road corridors within250m. Ordinary feature lookup omits unnamed crossing nodes. Mapped crossing type is evidence only; current clearance and traffic safety remain unverified.',run:async args=>{const result=await tools.crossingFeatures({latitude:Number(args.latitude),longitude:Number(args.longitude)},Number(args.radius));pages.set(result.url,{text:result.text});writeJSON(pagesPath,Object.fromEntries(pages));return result;}};
   const dispositionProtocol=runtime.phaseProtocol('route-disposition',2);
   const disposition:z.infer<typeof routeDispositionSchema>=await runtime.phase('route-disposition','scout',dispositionProtocol===2?'Resolve the named physical issues on this exact final proposed route using retained evidence and bounded map tools. This is one review of frozen stops, geometry and route order, not another proposal or new historical research. Use read_crossing_map for omitted crossing nodes where useful, choosing approximate query points from this actual route. Preserve the original negative review; a disagreement is not missing evidence. Return blocked if essential access remains unknown. If supported for a desktop draft, return accepted with all complete legDirections in exact order, accounting for every road arm, pavement-to-pavement crossing, public-path approach and station return. Distinguish an unmapped sidewalk tag from evidence of impassability; do not invent continuous separate pavements, exact kerbs, safe clearance or visible detail. Never direct visitors along a road centreline. Preserve normal on-the-day stop conditions and desktop-only limitations. A mapped public residential street can be a pedestrian corridor without claiming a separately mapped pavement. Small standing associations within the supplied10m contract need explicit final approaches, not new stop coordinates. Use plain street/path directions for the walker; keep numerical coordinates and OSM IDs in evidence/checks. Preserve measured timing and any shortfall; no padding. Return only the requested typed result.':'Resolve the named issues on this EXACT third route after the map-tool omission was fixed. This is one bounded disposition, not another route proposal or new historical research: no changed stops, standing points, geometry or new candidates. Retain the original Scout report. Query read_crossing_map near Heath Street/New End (51.55873,-0.17855) to resolve the actual missing crossing; it exposes highway=crossing nodes omitted by the old tool. A missing crossing cannot be replaced with agreement. If essential pedestrian continuity remains unknown, return blocked and no repaired directions. If evidence resolves it, return accepted with complete literal pedestrian directions for EVERY leg in unchanged order, accounting for pavements, actual crossing endpoints, final standing approaches and return. The router polyline represents the road corridor, never an instruction to walk a road centreline. Existing2–5m snaps are within the player10m association contract; retain actual standing coordinates and explain the short mapped-footway approach. Zero walking chapters is appropriate for this decision-dense route. Duration is presently about36minutes against requested60; preserve that shortfall honestly pending actual rendered audio, do not pad. Older station/route-distance gaps are superseded by current actual geometry, with their history retained. Close the alleged unauthorized-tools issue: archived operations24–25 allowed tools; only26 was final tool-free and returned none. The current final-only instruction never applies retroactively. Applicable repository lessons: ROUTE-003/004 distinguish landmark/standing/orientation, do not infer safe access from proximity; ROUTE-006 counts whole route and actual audio; GEN preserves exact versions and missing evidence. Acceptance is only desk draft, no field observation.',{brief,plan,research,routed,prepared,originalReview},routeDispositionSchema,{tools:[crossingTool,mapTool,readTool],maxRequests:3});
   writeJSON(join(runtime.directory,'route-disposition-record.json'),{originalReview,disposition,planSha256:digest(plan),routedSha256:digest(routed),scope:'One review of frozen third proposal; unchanged non-time counters'});
   if(reviewPasses(disposition.review)){prepared=applyRouteDisposition(prepared,disposition);routeReview=disposition.review;}
  }
  if(reviewPasses(routeReview)&&prepared.walkingSeconds+plan.allowanceSeconds+720<=brief.durationSeconds)break;
  if(reviewPasses(routeReview)){
   routeReview={verdict:'needs-revision' as const,summary:`Mechanical timing exceeds target: walking ${Math.ceil(prepared.walkingSeconds)}s + looking/crossings ${plan.allowanceSeconds}s + 720s reserved stationary narration > ${brief.durationSeconds}s. Shorten the routed loop while preserving endpoint and supported places.`,issues:[{id:'route-duration',scope:planId,required:true,problem:'Whole tour allowance exceeded',repair:'Choose a shorter supported route',evidence:`Actual routed geometry ${Math.ceil(prepared.routeMetres)}m`}],checks:routeReview.checks};
   writeJSON(join(runtime.directory,`${planId}-timing-error.json`),routeReview);prepared=undefined;continue;
  }
  if(!reviewPasses(routeReview)&&attempt<2&&(runtime.job.counters.research<2||runtime.job.events.some(e=>e.type==='factory-allowance'&&e.detail===`route-research-${attempt+1}`))){
   const id=`route-research-${attempt+1}`;
   research=await physicalRepair(id,research,survey,{plan,review:routeReview});
  }
  prepared=undefined;
 }
 if(!plan||!prepared||!routeReview||!('issues'in routeReview)||!reviewPasses(routeReview))throw Error('Route/scout acceptance not achieved within three proposals');
 writeJSON(join(runtime.directory,'route-accepted.json'),{plan,prepared,review:routeReview});
 const writingInput={brief,plan,research,prepared,routeReview,stationarySecondsAvailable:brief.durationSeconds-prepared.walkingSeconds-plan.allowanceSeconds};
 const routeEvidencePath=join(runtime.directory,'route-evidence.json');
 const routeEvidence:RouteTextEvidence[]=existsSync(routeEvidencePath)?JSON.parse(readFileSync(routeEvidencePath,'utf8')):collectRouteTextEvidence(runtime.directory,[...new Set(runtime.job.tasks.filter(t=>t.role==='route'||t.role==='scout').map(t=>t.scope))]);
 if(!existsSync(routeEvidencePath))writeJSON(routeEvidencePath,routeEvidence);
 const routeHistoryPath=join(runtime.directory,'route-disposition-record.json');
 const routeReviewHistory=existsSync(routeHistoryPath)?JSON.parse(readFileSync(routeHistoryPath,'utf8')):{review:routeReview};
 const productionEvidence={routeReviewHistory,routeEvidence:routeEvidence.map(({url,hash,operationId,callId,phaseId,toolName})=>({url,hash,operationId,callId,phaseId,toolName,retainedTextAvailable:true})),productionStatus:'Local George synthesis and package building are already authorized. These are pre-render content reviews; actual audio duration and saved assets are checked after render by builder and tester. User requested60minutes; do not claim that merely fitting below60 meets that target. A compact shorter draft can be rendered for inspection with the shortfall explicit; it is not final duration acceptance.'};

 const writerProtocol=runtime.phaseProtocol('writing',2);
 const writerInput=writerProtocol===2?{...writingInput,...productionEvidence,playerContract:'Only story/chapter paragraphs become audio. Introduction/directions/finish are visual fields. The compiler owns factual provenance/status and complete canonical navigation; avoid internal IDs, coordinates, acceptance certificates, tool logs or stale production warnings in user-facing copy. Keep editorialIntent concise as editorial intent, not a duplicate full job audit. Current source/review/build records hold those facts.'}:writingInput;
 let draft=await runtime.phase('writing','writer','Write a complete warm, insightful documentary tour from this frozen route and actual claims. Four to six stationary stories, generally140–210words each within overall time. Vary treatment and make the place worth visiting; explain unfamiliar actors and arrangements; no compulsory hook or invented anecdotes. Re-anchor in present places without unsupported visible-detail claims. Include two short walking chapters only when supplied chapterWindows permit; use EXACT chapterIds and budgets, about1.8spokenwords/sec MAX. Their text may digress usefully but must stay out of navigation decisions. A paragraph marked factual or supported_reconstruction links actual claimIds; apply every material qualification in meaning, retaining uncertainty and attribution. The qualifications arrays also contain researcher notes and candidate identifiers: those are instructions to observe, never text to recite. Keep each paragraph below 512 characters so the local voice renderer can process it without losing an ending. Editorial text must not smuggle facts. Text paragraphs have no embedded blank lines. Supply useful literal saved walking directions from actual route maneuvers, safe public standing instructions and clear return to station. No new source research or changed stops. Introduction explains AI provenance and manual fallback.',writerInput,draftSchema);
 let accepted=false,build:BuildResult|undefined,lastRendered:Draft|undefined,acceptedReviews:unknown[]=[];
 const previousPackages:string[]=[];
 let acceptedPrepared=prepared;
 for(let revision=0;revision<=2;revision++){
  let validationError:string|null=null;try{validateDraft(draft,research,plan,prepared.chapterIds,'semantic-review');}catch(e){validationError=String(e);}
  const exactDraft={...writingInput,draft,draftSha256:digest(draft),mechanicalValidation:validationError};
  const editorProtocol=runtime.phaseProtocol(`editor-${revision}`,3),verificationProtocol=runtime.phaseProtocol(`verification-${revision}`,3);
  let reviewPrepared=prepared,physicalCoverage:z.infer<typeof physicalCoverageSchema>|null=null,reviewRouteEvidence=routeEvidence;
  const coveragePath=join(runtime.directory,'physical-coverage.json');
  if((editorProtocol===3||verificationProtocol===3)&&existsSync(coveragePath)){
   const value=physicalCoverageSchema.parse(JSON.parse(readFileSync(coveragePath,'utf8'))),needed=new Set(value.findings.flatMap(f=>f.sourceUrls));
   const supplemental=collectRouteTextEvidence(runtime.directory,[...new Set(runtime.job.tasks.filter(t=>t.role==='research').map(t=>t.scope))]).filter(e=>needed.has(e.url)&&!routeEvidence.some(old=>old.url===e.url));
   reviewRouteEvidence=[...routeEvidence,...supplemental];
   const repair=applyPhysicalCoverage(plan,prepared,value,reviewRouteEvidence);reviewPrepared=repair.prepared;physicalCoverage=repair.coverage;
  }
  let projectedNavigation:unknown=null,projectedValidation='not checked';
  if(editorProtocol===3||verificationProtocol===3){
   try{const input=assemble(brief,plan,research,reviewPrepared,draft,revision+1,'semantic-review');projectedNavigation={introduction:input.narration.introduction,finishInstructions:input.narration.finishInstructions,stories:input.stories.map(s=>({id:s.id,directions:s.directions}))};projectedValidation='passed actual player parser and builder input checks; media placeholders only, audio pending';}catch(error){projectedValidation=String(error);validationError=projectedValidation;}
  }
  const finalEvidence={...productionEvidence,producerMetadata:{draftSha256:digest(draft),spokenContent:'Exactly the stationary story paragraphs and any walking chapter paragraphs; introduction, directions and finish are visual',editorialIntentStatus:'Retained writer-process history, not current production status or exported user instructions; current validation/review/render records supersede it',navigationStatus:'Pending this exact independent pre-render review; no field verification claimed'},routeEvidence:reviewRouteEvidence.map(({url,hash,operationId,callId,phaseId,toolName})=>({url,hash,operationId,callId,phaseId,toolName,retainedTextAvailable:true})),prepared:reviewPrepared,physicalCoverage,projectedNavigation,mechanicalValidationStatus:validationError??projectedValidation,packageContract:'The player displays story directions as NEXT directions. The deterministic assembler copies approved onward leg i+1 into story i, the first approach into introduction, and the full return into finishInstructions. Review projectedNavigation as the ACTUAL saved visual directions; model draft directions and editorialIntent are not exported as operational directions. Spoken audio contains story paragraphs only; introduction/directions/finish are saved visual text, so no fictional introduction audio is counted.',softwareEvidence:existsSync(join(runtime.directory,'software-checks.json'))?JSON.parse(readFileSync(join(runtime.directory,'software-checks.json'),'utf8')):null};
  let editorInput:Record<string,unknown>=editorProtocol===3?{...exactDraft,...finalEvidence,mechanicalValidation:validationError??'passed pre-render structural validation'}:editorProtocol===2?{...exactDraft,...productionEvidence}:exactDraft;
  let verificationInput:Record<string,unknown>=verificationProtocol===3?{...exactDraft,...finalEvidence,mechanicalValidation:validationError??'passed pre-render structural validation'}:verificationProtocol===2?{...exactDraft,...productionEvidence}:exactDraft;
  let changedProductionWrapper=false;
  for(const [phase,current]of [[`editor-${revision}`,editorInput],[`verification-${revision}`,verificationInput]] as const){
   const artifactPath=join(runtime.directory,'phases',phase+'.json');
   if(revision===2&&existsSync(artifactPath)){
    const artifact=JSON.parse(readFileSync(artifactPath,'utf8')),request=JSON.parse(readFileSync(join(runtime.directory,'requests',artifact.operationId+'-context.json'),'utf8'));
    const archived=JSON.parse(request.input[0].content) as Record<string,unknown>;
    if(digest(archived)!==digest(current)){const original=retainReviewContext(archived,current);if(phase.startsWith('editor'))editorInput=original;else verificationInput=original;changedProductionWrapper=true;}
   }
  }
  const retainedEvidence=createRetainedEvidenceTools({research,pages,directory:runtime.directory,fallbackReadPage:readTool,routeEvidence:reviewRouteEvidence});
  const reviews=await Promise.allSettled([
   runtime.phase(`editor-${revision}`,'editor','Independently review the complete exact draft for listening clarity, worthwhile discoveries, present-place connection, rhythm, redundant explanation and story substance. Treat taste suggestions as optional. Required issues must name exact scope and repair. Do not silently rewrite or add facts. Distinguish provisional timing from actual audio and do not demand a physical visit as an editorial test.',editorInput,reviewSchema),
   runtime.phase(`verification-${revision}`,'verification','Independently check EVERY factual and physical assertion against actual quoted passages, mapped points and qualifications. Check material qualifications semantically: preserve uncertainty, attribution and scope while keeping researcher notes/candidate IDs out of spoken prose. Check actor/action/relationship/time, inference, causal language, quotes, superlatives, unsupported details and editorial labels hiding facts. A claim ID alone does not prove entailment. Retained quotations are deliberately minimal; use read_page for retained text/map sources and read_image for actual archived visual sources. Reopen the existing source URL with read_page when its passage is insufficient before concluding support is absent. No new source discovery. Require correction or omission of genuinely unsupported specificity. Do not demand quotations for clearly labelled useful reconstruction supported by period/type evidence. Check directions against actual maneuvers and no invented left/right or sightlines. Return consolidated required repairs with evidence.',verificationInput,reviewSchema,{tools:[retainedEvidence.readPage,retainedEvidence.readImage],maxRequests:3}),
  ]);
  const rejected=reviews.find(r=>r.status==='rejected');if(rejected?.status==='rejected')throw rejected.reason;
  const values=reviews.map(r=>{assert.equal(r.status,'fulfilled');return r.value;});
  writeJSON(join(runtime.directory,`review-batch-${revision}.json`),{draftSha256:digest(draft),validationError,reviews:values});
  let productionDisposition:z.infer<typeof reviewSchema>|undefined;
  if(revision===2&&!validationError&&changedProductionWrapper&&reviewPasses(values[1])){
   const compiled=assemble(brief,plan,research,reviewPrepared,draft,revision+1,'semantic-review');
   productionDisposition=await runtime.phase('production-review','editor','Resolve only the editorial production-integration findings after the final factual review accepted the exact unchanged spoken paragraphs and canonical navigation. There is no third writing/correction batch. Compare the original required editorial issues against the ACTUAL compiled fields and producer metadata. The writer editorialIntent is retained historical context, not exported or authoritative for render/status. The deterministic compiler owns provenance/status and copies the complete canonical navigation into the correct player fields; introduction is visual text, not audio. Accept ONLY if every remaining required editorial issue is closed by these specific production/field corrections without changing story prose. Do not overrule a real unresolved content-quality issue or invent factual closure. Preserve original reports and distinguish pre-render acceptance from actual audio, requested duration, listening and physical use.',{brief,draftSha256:digest(draft),unchangedStories:draft.stories,chapters:draft.chapters,originalEditor:values[0],finalVerifier:values[1],compiledInput:compiled,producerMetadata:{spokenContent:'Only story/chapter paragraphs become audio; visual introduction/directions/finish are not counted as audio',writerAudit:'Historical non-exported context, superseded for current status by actual immutable job/review/build records'},physicalCoverage,softwareEvidence:finalEvidence.softwareEvidence},reviewSchema);
  }
  if(!validationError&&((!changedProductionWrapper&&values.every(reviewPasses))||(productionDisposition&&reviewPasses(productionDisposition)))){
   runtime.assertRunning();
   assert.ok(!physicalCoverage?.remainingEssentialUnknowns.length,'Essential physical uncertainties remain in the retained repair');
   acceptedPrepared=reviewPrepared;
   const input=assemble(brief,plan,research,acceptedPrepared,draft,revision+1,'semantic-review');validateBuilderInput(input);
   if(lastRendered){const previous=new Map([...lastRendered.stories,...lastRendered.chapters].map(s=>[s.id,s.paragraphs.map(p=>p.text).join('\n\n')]));for(const s of [...draft.stories,...draft.chapters])if(previous.get(s.id)!==s.paragraphs.map(p=>p.text).join('\n\n'))consume('render',`render-${revision}-${s.id}`,s.id);}
   lastRendered=draft;
   writeJSON(join(runtime.directory,`accepted-draft-${revision}.json`),{draft,draftSha256:digest(draft),listening:'pending'});
   try{
    build=await (options.build??buildTour)(input,{outputDirectory:join(runtime.directory,`package-v${revision+1}`),cacheDirectory:join(runtime.directory,'audio-cache'),previousPackages});
    previousPackages.push(build.packagePath);writeJSON(join(runtime.directory,`build-result-${revision}.json`),build);
    if(build.timing.withinTarget){accepted=true;acceptedReviews=productionDisposition?[...values,productionDisposition]:values;break;}
    validationError=`Measured whole tour exceeds its hour by ${Math.ceil(-build.timing.remainingSeconds)} seconds. Shorten stationary narration within the real allowance; do not change route or speed assumptions. Actual measured budget: ${JSON.stringify(build.timing)}`;
   }catch(error){
    const message=String(error);
    if(!/audio exceeds (chapter cap|navigation budget)|Narration paragraph exceeds 512/.test(message))throw error;
    validationError=`Actual rendering rejected timing/text: ${message}. Shorten the affected chapter substantially or split the oversized paragraph at a sentence boundary. Preserve factual coverage.`;
   }
   writeJSON(join(runtime.directory,`render-feedback-${revision}.json`),{validationError});
  }
  if(revision===2)break;
  consume('correction',`correction-${revision+1}`);
  draft=await runtime.phase(`correction-${revision+1}`,'writer','Repair the consolidated REQUIRED issues in this exact draft. Return the entire revised draft. Keep vivid supported substance, unchanged stop/chapter order and existing source claims; remove unsupported specifics rather than inventing support. Optional suggestions do not require changes. Observe the available narration seconds and conservative walking chapter word caps.',{...writingInput,...productionEvidence,draft,validationError,reviews:values,directionContract:'Complete canonical planned directions are also packaged separately in prepared.legs. Keep all operational instructions out of editorialIntent. Human-facing prose should use street names and visible supported landmarks, not OSM way IDs, long decimal coordinates or internal map IDs. Preserve every actual crossing/standing/return decision. Combine related sentences if necessary to fit direction-array limits.'},draftSchema);
 }
 if(!accepted||!build)throw Error('Editorial/factual and measured-audio acceptance not achieved within two correction batches');
 writeJSON(join(runtime.directory,'accepted-draft.json'),{draft,draftSha256:digest(draft),listening:'pending'});
 writeJSON(join(runtime.directory,'build-result.json'),build);
 runtime.assertRunning();
 const testerInstructions='Review exact package preparation and automated checks. Identify inconsistencies in complete hour accounting, route coverage, evidence, required review closure, offline assets and any misleading readiness claims. This is not human listening or field observation. Accept means structurally complete desk draft; explicitly preserve listening and field pending.';
 const packageChecks=checkPackageForHandoff(build.packagePath);
 assert.equal(packageChecks.packageSha256,build.validation.packageSha256,'Package checks and audio validation identify the same package');
 assert.equal(packageChecks.inputSha256,build.validation.inputSha256,'Package checks and audio validation identify the same input');
 writeJSON(join(runtime.directory,'package-checks.json'),packageChecks);
 const currentProductionManifest={draftSha256:digest(draft),inputSha256:build.validation.inputSha256,packageSha256:build.validation.packageSha256,acceptedReviewSha256:acceptedReviews.map(digest),validation:build.validation,packageChecks,spokenContent:'Only story/chapter paragraph collections are audio; introduction/directions/finish are visual',durationStatus:'Target fulfilment unconfirmed; actual estimate and shortfall must be retained',ordinaryUseReady:false};
 writeJSON(join(runtime.directory,'production-manifest.json'),currentProductionManifest);
 const testerInput={currentProductionManifest,packageChecks,brief,plan,research,draft,acceptedReviews,routeReview,...productionEvidence,prepared:acceptedPrepared,physicalCoverage:existsSync(join(runtime.directory,'physical-coverage.json'))?JSON.parse(readFileSync(join(runtime.directory,'physical-coverage.json'),'utf8')):null,softwareEvidence:existsSync(join(runtime.directory,'software-checks.json'))?JSON.parse(readFileSync(join(runtime.directory,'software-checks.json'),'utf8')):null,build,preparation:JSON.parse(readFileSync(build.preparationPath,'utf8')),acceptedDraftSha256:digest(draft),chapterCount:prepared.chapterIds.length,packagedNavigation:(()=>{const p=JSON.parse(readFileSync(build.packagePath,'utf8'));return {introduction:p.fixture.narration.introduction,finishInstructions:p.fixture.narration.finishInstructions,stories:p.fixture.narration.stories.map((s:{id:string;directions:string[]})=>({id:s.id,directions:s.directions}))};})()};
 const oldTesterPath=join(runtime.directory,'phases/tester.json');
 let testReview:z.infer<typeof reviewSchema>;
 if(existsSync(oldTesterPath)){
  const previous=JSON.parse(readFileSync(oldTesterPath,'utf8'));
  const context=JSON.parse(readFileSync(join(runtime.directory,'requests',previous.operationId+'-context.json'),'utf8'));
  const previousInput=JSON.parse(context.input[0].content);
  assert.equal(previousInput.acceptedDraftSha256,testerInput.acceptedDraftSha256,'Post-build review must retain exact accepted draft');
  assert.equal(previousInput.preparation.inputSha256,testerInput.preparation.inputSha256,'Post-build review must concern the same immutable input');
  assert.equal(previousInput.preparation.packageSha256,testerInput.preparation.packageSha256,'Post-build review must concern the same immutable package');
  assert.deepEqual(previousInput.packagedNavigation,testerInput.packagedNavigation,'Post-build review cannot silently change navigation');
  testReview=await runtime.phase('tester','tester',testerInstructions,previousInput.build.validation?retainPackageReviewInput(runtime,'tester',testerInput):previousInput,reviewSchema);
  if(!reviewPasses(testReview)&&!previousInput.build.validation&&build.validation){
   testReview=await runtime.phase('package-check-review','tester','Review the same immutable package after the previously missing final check receipts were supplied. Close only the prior package-test findings using actual revision-linked checks, source hashes and the current manifest. No content or audio was regenerated. Distinguish executed actual-package checks from reused unchanged-player evidence and pending native/listening/field observations. The builder receipt records real complete decode, measured durations, package parser, byte/hash/text identity and immutable input checks. The current post-render receipt supersedes older pre-render pending notes. Do not demand another physical or exhaustive regression campaign for unchanged player code. Acceptance here means a validated compact inspection draft; the approximate60-minute requirement remains unmet when the measured estimate is substantially shorter, and listening/field stay pending. Do not override any real missing or failed check.',retainPackageReviewInput(runtime,'package-check-review',{...testerInput,previousTestReport:testReview}),reviewSchema);
  }
 }else testReview=await runtime.phase('tester','tester',testerInstructions,retainPackageReviewInput(runtime,'tester',testerInput),reviewSchema);
 if(!reviewPasses(testReview))throw Error('Package tester identified a required issue');
 const handoff={status:'awaiting-listening',packagePath:build.packagePath,timing:build.timing,durationAcceptance:{status:'unconfirmed',requestedSeconds:brief.durationSeconds,estimatedSeconds:build.timing.totalSeconds,shortfallSeconds:Math.max(0,brief.durationSeconds-build.timing.totalSeconds),note:'Within the maximum budget is not acceptance of the requested experience length. Walking is estimated; a substantially shorter draft remains a partial result.'},independentReviews:true,freshContentOnly:true,chapterCount:prepared.chapterIds.length,limitations:['Requested experience duration is unconfirmed; inspect actual estimate and shortfall','AI desktop review; no human listening or outdoor visit','Public routing is a candidate path, not guaranteed present access','Two walking chapters are included only if supported by simple path windows'],requiredOwnerActions:['Listen to the new recordings; report pronunciation or confusing directions','Use the map/manual fallback on the first ordinary walk; report any unclear standing point']};
 writeJSON(join(runtime.directory,'handoff.json'),handoff);finish(runtime.job,'awaiting-decision','Offline review draft built; requested duration, human listening and ordinary-use observations remain pending',runtime.now());runtime.save();return handoff;
}

async function main(){
 const [briefPath,directory,retryFlag,retryId,retryEvidence]=process.argv.slice(2);if(!briefPath||!directory||(retryFlag!==undefined&&!(((retryFlag==='--retry-known'||retryFlag==='--finalize-retained'||retryFlag==='--recover-output'||retryFlag==='--complete-tools')&&retryId&&retryEvidence)||(retryFlag==='--resume-checked'&&retryId))))throw Error('Usage: factory <brief.json> <ignored run directory> [--retry-known operation-id checked-evidence | --resume-checked checked-local-fix | --finalize-retained phase checked-evidence]');
 const root=process.cwd(),output=resolve(directory);assert.ok(output.startsWith(resolve(root,'local-data')+'/'),'Factory raw research/output must remain in ignored local-data');
 const brief=briefSchema.parse(JSON.parse(readFileSync(briefPath,'utf8')));
 await withJobLock(join(output,'job.json'),async()=>{
  const runtime=new FactoryRuntime(output,brief,async()=>new SubscriptionProvider({credentials:await renewCredentials(root,{minimumValidityMs:240000}),overflowEvidence:await loadOverflowEvidence(root),timeoutMs:180000}));
  if(retryFlag==='--retry-known')runtime.recoverKnownFailure(retryId,retryEvidence);
  else if(retryFlag==='--resume-checked')resumeAfterLocalFix(runtime,retryId);
  else if(retryFlag==='--finalize-retained')runtime.resumeToolFinalization(retryId,retryEvidence);
  else if(retryFlag==='--complete-tools')runtime.resumeToolCompletion(retryId,retryEvidence);
  else if(retryFlag==='--recover-output')runtime.recoverRetainedOutput(retryId,retryEvidence);
  if(runtime.job.status==='awaiting-decision'&&existsSync(join(output,'handoff.json'))){process.stdout.write(readFileSync(join(output,'handoff.json'),'utf8'));return;}
  try{const result=await runFactory(runtime,new PublicTools({directory:join(output,'public-tools')}));process.stdout.write(JSON.stringify(result,null,2)+'\n');}
  catch(error){finish(runtime.job,'blocked',error instanceof Error?error.message:'Factory failed',runtime.now());runtime.save();process.stderr.write(JSON.stringify({status:'blocked',reason:runtime.job.reason,directory:output})+'\n');process.exitCode=1;}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{process.stderr.write(String(error)+'\n');process.exitCode=1;});
