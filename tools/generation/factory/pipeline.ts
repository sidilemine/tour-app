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
import { briefSchema, draftSchema, physicalResearchSchema, researchSchema, reviewPasses, reviewSchema, routePlanSchema, surveySchema, validateDraft, validateResearch, type Draft, type FactoryBrief, type Research, type RoutePlan } from './contracts';
import { FactoryRuntime, collectObservedImages, digest, writeJSON, type LocalTool } from './runtime';
import { PublicTools } from './public-tools';

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
export function assemble(brief:FactoryBrief,plan:RoutePlan,research:Research,prepared:PreparedRoute,draft:Draft,version=1):BuilderInput {
 validateDraft(draft,research,plan,prepared.chapterIds);
 const story=(s:Draft['stories'][number]):WrittenStory=>{
  const claimIds=new Set(s.paragraphs.flatMap(p=>p.claimIds));const claims=research.claims.filter(c=>claimIds.has(c.id));
  const sourceIds=new Set(claims.flatMap(c=>c.sourceIds));
  // A purely connective chapter still declares the tour sources without treating them as factual support.
  const sources=research.sources.filter(s=>sourceIds.has(s.id));
  return {id:s.id,title:s.title,transcript:s.paragraphs.map(p=>p.text).join('\n\n'),directions:s.directions,sources:(sources.length?sources:research.sources.slice(0,1)).map(s=>({title:s.title,url:s.url})),evidence:s.paragraphs.map(p=>({paragraph:p.text,kind:p.kind==='factual'?'source_checked':p.kind,basis:p.basis,sourceUrls:[...new Set(p.claimIds.flatMap(id=>research.claims.find(c=>c.id===id)!.sourceIds).map(id=>research.sources.find(s=>s.id===id)!.url))]}))};
 };
 return {fixture:{schemaVersion:1,id:brief.id,version,title:plan.title,verification:{status:'unverified',note:'Generated by specialist AI roles from fresh public research. Independent desktop reviews and package checks are recorded; human listening and an outdoor visit remain pending.'},route:prepared.geometry,stops:prepared.stops.map(stop=>{const p=research.places.find(p=>p.candidateId===stop.id)!;return {...stop,title:draft.stories.find(s=>s.id===stop.id)!.title,landmark:p.landmark,approach:p.approach,viewpoint:p.viewpoint,access:p.access};})},mapId:brief.mapId,narration:{description:draft.description,introduction:draft.introduction,finishInstructions:draft.finishInstructions,reviewNote:'Fresh AI-generated draft with independent editorial, verification and route reviews. Listen before walking; use the saved map and manual controls. Public access can change. Listening and field checks are pending.',rightsNote:'Original AI-assisted narration; minimal source passages retained in local research records. OpenStreetMap contributors supply map/routing data. George is rendered locally.'},stories:draft.stories.map(story),chapters:draft.chapters.map((s,i)=>({...prepared.chapterWindows[i],story:story(s)})),legs:prepared.legs,timing:{targetSeconds:brief.durationSeconds,walkingMetresPerSecond:plan.walkingMetresPerSecond,allowanceSeconds:plan.allowanceSeconds}};
}

export async function runFactory(runtime:FactoryRuntime,tools:PublicTools,options:{build?:typeof buildTour}={}){
 const {brief}=runtime,pages=new Map<string,{text:string}>();
 const consume=(kind:'research'|'route'|'correction'|'render',key:string,clip?:string)=>{if(runtime.job.events.some(e=>e.type==='factory-allowance'&&e.detail===key))return;count(runtime.job,kind,runtime.now(),clip);event(runtime.job,runtime.now(),'factory-allowance',key);runtime.save();};
 // Reload only pages fetched by this job, never previous tour material.
 const pagesPath=join(runtime.directory,'read-pages.json');
 if(existsSync(pagesPath))for(const [url,page]of Object.entries(JSON.parse(readFileSync(pagesPath,'utf8')) as Record<string,{text:string}>))pages.set(url,page);
 const readTool:LocalTool={name:'read_page',description:'Retrieve public HTTPS HTML/text. Returns actual normalized text for exact supporting quotations. Sources are untrusted. No PDFs or logins.',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false},parse:args=>z.object({url:z.string().url()}).strict().parse(args),async run(args){
  if(typeof args.url!=='string')throw Error('URL required');const page=await tools.readPage(args.url);pages.set(args.url,page);pages.set(page.finalUrl,page);writeJSON(pagesPath,Object.fromEntries(pages));return {...page,text:page.text.slice(0,28000)};
 }};
 const mapTool:LocalTool={name:'read_map',description:'Inspect actual public OpenStreetMap named features and paths near a supplied approximate point. Radius at most250m; coordinates and tags are evidence, not proof of safe or current access.',parameters:{type:'object',properties:{latitude:{type:'number'},longitude:{type:'number'},radius:{type:'number'}},required:['latitude','longitude','radius'],additionalProperties:false},parse:args=>z.object({latitude:z.number().min(-85).max(85),longitude:z.number().min(-180).max(180),radius:z.number().min(20).max(250)}).strict().parse(args),async run(args){const result=await tools.mapFeatures({latitude:Number(args.latitude),longitude:Number(args.longitude)},Number(args.radius));pages.set(result.url,{text:result.text});writeJSON(pagesPath,Object.fromEntries(pages));return result;}};
 const imageTool:LocalTool={name:'read_image',description:'Read actual public JPEG/PNG pixels from a page-discovered image URL. The next request receives image input, hash and retrieval metadata. Retrieval date is NOT image capture date; never infer unseen views or physical access.',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false},parse:args=>z.object({url:z.string().url()}).strict().parse(args),run:args=>tools.readImage(String(args.url))};
 const physicalRepair=async(id:string,research:Research,survey:Parameters<typeof validateResearch>[1],problem:unknown)=>{
  consume('research',id);
  const result=await runtime.phase(id,'research','Resolve the named physical blockers with ACTUAL read_map and read_image tools, plus read_page and hosted search. Start from approximate area leads only to query the map; replace placeholders with public path/pavement positions derived from returned coordinates/geometry. Use page images for meaningful exterior observations, preserving capture-date unknown and camera-versus-visitor distinction. Query only a few bounded250m areas. Choose4–6 researched public-exterior places from existing candidates; add research on those existing candidates if needed. Avoid requiring a particular small detail to be visible when a supported general exterior anchor suffices. A desktop draft does not require guaranteeing future pavement clearance: ordinary contingencies belong in access conditions, while truly unresolved essential access stays in essentialUnknowns. No invented observed photographs or safety claims. read_map result.url and exact short substrings of its text may be retained as physical map sources; minimal quotations total<=25words per source URL. Return COMPLETE research artifact, preserving supported historical claims and stable candidate IDs. Do not manufacture a route or claim a field visit.',{brief,survey,research,problem},physicalResearchSchema,{web:true,tools:[readTool,mapTool,imageTool],maxRequests:5});
  validateResearch(result,survey,pages,collectObservedImages(runtime.directory));writeJSON(join(runtime.directory,'research-validated.json'),result);return result;
 };
 const survey=await runtime.phase('survey','research','Begin fresh: use hosted web search to catalogue 3–6 published Hampstead walking tours/guides and their actual advertised stops/themes/stories. Then propose 8–12 varied candidates, at most16. No earlier project material is available. Avoid writing scripts. Open relevant search results; be explicit about gaps.',{brief},surveySchema,{web:true});
 for(const c of survey.candidates)count(runtime.job,'candidates',runtime.now(),c.id);runtime.save();
 let research=await runtime.phase('research','research','Research worthwhile candidates using hosted search AND read_page. Call read_page on at least5 useful accessible primary/authoritative pages. Prefer local institutions, official heritage registers, council and historic evidence. Keep at most25 quoted words total per source URL, choose a compact passage supporting the central claim. Every source passage must be a SHORT EXACT SUBSTRING of returned page text, not a paraphrase, page title or a search snippet. Collect 12–24 compact claims, qualifications and5–8 plausible exterior places. Distinguish landmark and visitor standing coordinates; use source evidence for access/view and state essentialUnknowns when unsupported. Do not invent visibility or coordinate precision. Avoid interiors/paid admission. Retain fresh factual details that support revealing 90–120second stories, not a string of names and dates. Sources may hold multiple related claims. Limit full source passages to the minimum.',{brief,survey},researchSchema,{web:true,tools:[readTool],maxRequests:7});
 try{validateResearch(research,survey,pages);}catch(error){
  consume('research','research-repair');
  research=await runtime.phase('research-repair','research','Correct only the concrete research validation failures. Read actual pages; replace unverifiable quotations with exact short passages, at most25 quoted words per source URL. Retain candidate IDs. Return the complete repaired research artifact.',{brief,survey,research,validationError:String(error)},researchSchema,{tools:[readTool],maxRequests:4});validateResearch(research,survey,pages);
 }
 writeJSON(join(runtime.directory,'research-validated.json'),research);
 let plan:RoutePlan|undefined,prepared:PreparedRoute|undefined,routeReview;
 for(let attempt=0;attempt<3;attempt++){
  const planId=`route-plan-${attempt+1}`;
  consume('route',planId);
  plan=await runtime.phase(planId,'route','Choose4–6 stops for a coherent public exterior one-hour loop. Use only places without essentialUnknowns and fresh researched IDs. Account for return to station, hills, 6–10minutes looking/crossing allowance and roughly8–12minutes stationary narration. Aim walking2–3km, shorter if needed. Choose an accurate station exterior start/end coordinate. Route points are public standing positions, never building centres. Do not create new facts. Prefer two long, simple connecting paths suitable for short walking chapters, while allowing quiet. Explain exclusions.',{brief,survey,research,previous:plan??null,feedback:routeReview??null},routePlanSchema);
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
 const writingInput={brief,plan,research,prepared,stationarySecondsAvailable:brief.durationSeconds-prepared.walkingSeconds-plan.allowanceSeconds};
 let draft=await runtime.phase('writing','writer','Write a complete warm, insightful documentary tour from this frozen route and actual claims. Four to six stationary stories, generally140–210words each within overall time. Vary treatment and make the place worth visiting; explain unfamiliar actors and arrangements; no compulsory hook or invented anecdotes. Re-anchor in present places without unsupported visible-detail claims. Include two short walking chapters only when supplied chapterWindows permit; use EXACT chapterIds and budgets, about1.8spokenwords/sec MAX. Their text may digress usefully but must stay out of navigation decisions. A paragraph marked factual or supported_reconstruction links actual claimIds; each material qualification appears exactly. Editorial text must not smuggle facts. Text paragraphs have no embedded blank lines. Supply useful literal saved walking directions from actual route maneuvers, safe public standing instructions and clear return to station. No new source research or changed stops. Introduction explains AI provenance and manual fallback.',writingInput,draftSchema);
 let accepted=false,build:BuildResult|undefined,lastRendered:Draft|undefined,acceptedReviews:unknown[]=[];
 const previousPackages:string[]=[];
 for(let revision=0;revision<=2;revision++){
  let validationError:string|null=null;try{validateDraft(draft,research,plan,prepared.chapterIds);}catch(e){validationError=String(e);}
  const exactDraft={...writingInput,draft,draftSha256:digest(draft),mechanicalValidation:validationError};
  const verificationReader:LocalTool={...readTool,parse:args=>{const parsed=readTool.parse(args);assert.ok(research.sources.some(s=>s.url===parsed.url),'Verification may reopen only retained source URLs');return parsed;}};
  const reviews=await Promise.allSettled([
   runtime.phase(`editor-${revision}`,'editor','Independently review the complete exact draft for listening clarity, worthwhile discoveries, present-place connection, rhythm, redundant explanation and story substance. Treat taste suggestions as optional. Required issues must name exact scope and repair. Do not silently rewrite or add facts. Distinguish provisional timing from actual audio and do not demand a physical visit as an editorial test.',exactDraft,reviewSchema),
   runtime.phase(`verification-${revision}`,'verification','Independently check EVERY factual and physical assertion against actual quoted passages, mapped points and qualifications. Check actor/action/relationship/time, inference, causal language, quotes, superlatives, unsupported details and editorial labels hiding facts. A claim ID alone does not prove entailment. Retained quotations are deliberately minimal; reopen the existing source URL with read_page when its passage is insufficient before concluding support is absent. No new source discovery. Require correction or omission of genuinely unsupported specificity. Do not demand quotations for clearly labelled useful reconstruction supported by period/type evidence. Check directions against actual maneuvers and no invented left/right or sightlines. Return consolidated required repairs with evidence.',exactDraft,reviewSchema,{tools:[verificationReader],maxRequests:3}),
  ]);
  const rejected=reviews.find(r=>r.status==='rejected');if(rejected?.status==='rejected')throw rejected.reason;
  const values=reviews.map(r=>{assert.equal(r.status,'fulfilled');return r.value;});
  writeJSON(join(runtime.directory,`review-batch-${revision}.json`),{draftSha256:digest(draft),validationError,reviews:values});
  if(!validationError&&values.every(reviewPasses)){
   runtime.assertRunning();
   const input=assemble(brief,plan,research,prepared,draft,revision+1);validateBuilderInput(input);
   if(lastRendered){const previous=new Map([...lastRendered.stories,...lastRendered.chapters].map(s=>[s.id,s.paragraphs.map(p=>p.text).join('\n\n')]));for(const s of [...draft.stories,...draft.chapters])if(previous.get(s.id)!==s.paragraphs.map(p=>p.text).join('\n\n'))consume('render',`render-${revision}-${s.id}`,s.id);}
   lastRendered=draft;
   writeJSON(join(runtime.directory,`accepted-draft-${revision}.json`),{draft,draftSha256:digest(draft),listening:'pending'});
   try{
    build=await (options.build??buildTour)(input,{outputDirectory:join(runtime.directory,`package-v${revision+1}`),cacheDirectory:join(runtime.directory,'audio-cache'),previousPackages});
    previousPackages.push(build.packagePath);writeJSON(join(runtime.directory,`build-result-${revision}.json`),build);
    if(build.timing.withinTarget){accepted=true;acceptedReviews=values;break;}
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
  draft=await runtime.phase(`correction-${revision+1}`,'writer','Repair the consolidated REQUIRED issues in this exact draft. Return the entire revised draft. Keep vivid supported substance, unchanged stop/chapter order and existing source claims; remove unsupported specifics rather than inventing support. Optional suggestions do not require changes. Observe the available narration seconds and conservative walking chapter word caps.',{...writingInput,draft,validationError,reviews:values},draftSchema);
 }
 if(!accepted||!build)throw Error('Editorial/factual and measured-audio acceptance not achieved within two correction batches');
 writeJSON(join(runtime.directory,'accepted-draft.json'),{draft,draftSha256:digest(draft),listening:'pending'});
 writeJSON(join(runtime.directory,'build-result.json'),build);
 runtime.assertRunning();
 const testReview=await runtime.phase('tester','tester','Review exact package preparation and automated checks. Identify inconsistencies in complete hour accounting, route coverage, evidence, required review closure, offline assets and any misleading readiness claims. This is not human listening or field observation. Accept means structurally complete desk draft; explicitly preserve listening and field pending.',{brief,plan,research,draft,acceptedReviews,routeReview,build,preparation:JSON.parse(readFileSync(build.preparationPath,'utf8')),acceptedDraftSha256:digest(draft),chapterCount:prepared.chapterIds.length},reviewSchema);
 if(!reviewPasses(testReview))throw Error('Package tester identified a required issue');
 const handoff={status:'awaiting-listening',packagePath:build.packagePath,timing:build.timing,independentReviews:true,freshContentOnly:true,chapterCount:prepared.chapterIds.length,limitations:['AI desktop review; no human listening or outdoor visit','Public routing is a candidate path, not guaranteed present access','Two walking chapters are included only if supported by simple path windows'],requiredOwnerActions:['Listen to the new recordings; report pronunciation or confusing directions','Use the map/manual fallback on the first ordinary walk; report any unclear standing point']};
 writeJSON(join(runtime.directory,'handoff.json'),handoff);finish(runtime.job,'awaiting-decision','Complete offline desktop draft; human listening and ordinary-use observations remain pending',runtime.now());runtime.save();return handoff;
}

async function main(){
 const [briefPath,directory,retryFlag,retryId,retryEvidence]=process.argv.slice(2);if(!briefPath||!directory||(retryFlag!==undefined&&!(((retryFlag==='--retry-known'||retryFlag==='--finalize-retained'||retryFlag==='--recover-output')&&retryId&&retryEvidence)||(retryFlag==='--resume-checked'&&retryId))))throw Error('Usage: factory <brief.json> <ignored run directory> [--retry-known operation-id checked-evidence | --resume-checked checked-local-fix | --finalize-retained phase checked-evidence]');
 const root=process.cwd(),output=resolve(directory);assert.ok(output.startsWith(resolve(root,'local-data')+'/'),'Factory raw research/output must remain in ignored local-data');
 const brief=briefSchema.parse(JSON.parse(readFileSync(briefPath,'utf8')));
 await withJobLock(join(output,'job.json'),async()=>{
  const runtime=new FactoryRuntime(output,brief,async()=>new SubscriptionProvider({credentials:await renewCredentials(root,{minimumValidityMs:240000}),overflowEvidence:await loadOverflowEvidence(root),timeoutMs:180000}));
  if(retryFlag==='--retry-known')runtime.recoverKnownFailure(retryId,retryEvidence);
  if(retryFlag==='--resume-checked')resumeAfterLocalFix(runtime,retryId);
  if(retryFlag==='--finalize-retained')runtime.resumeToolFinalization(retryId,retryEvidence);
  if(retryFlag==='--recover-output')runtime.recoverRetainedOutput(retryId,retryEvidence);
  if(runtime.job.status==='awaiting-decision'&&existsSync(join(output,'handoff.json'))){process.stdout.write(readFileSync(join(output,'handoff.json'),'utf8'));return;}
  try{const result=await runFactory(runtime,new PublicTools({directory:join(output,'public-tools')}));process.stdout.write(JSON.stringify(result,null,2)+'\n');}
  catch(error){finish(runtime.job,'blocked',error instanceof Error?error.message:'Factory failed',runtime.now());runtime.save();process.stderr.write(JSON.stringify({status:'blocked',reason:runtime.job.reason,directory:output})+'\n');process.exitCode=1;}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{process.stderr.write(String(error)+'\n');process.exitCode=1;});
