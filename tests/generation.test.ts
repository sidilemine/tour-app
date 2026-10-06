import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { accept, accepted, addReview, addTask, attempt, closeIssue, contextRecords, count, current, finish, fresh, issue, putRecord, recover, reserve, returnTask, settle, usable } from '../tools/generation/engine';
import { audience, fixtureJob, fixtureReasoner, fixtureTime as now, record, task } from '../tools/generation/fixture';
import { ref } from '../tools/generation/records';
import { loadJob, saveJob, withJobLock } from '../tools/generation/store';
import { runTask, taskContext } from '../tools/generation/coordinator';
const usage={inputTokens:10,outputTokens:3,subscription:true,apiEquivalentUsd:0.00005,priceDate:'2026-10-06',uncertainty:null};

test('qualified handoff round-trips; physical unknown blocks only dependent content',()=>{
 const j=fixtureJob();assert.deepEqual(JSON.parse(JSON.stringify(j)),j);
 assert.deepEqual(usable(j,ref(current(j,'script')!)),[]);
 assert.match(usable(j,ref(current(j,'encounter')!)).join(),/Unresolved/);
 const ctx=taskContext(j,j.tasks[2]);assert.equal(ctx.task.audienceContext.intendedDiscovery,audience.intendedDiscovery);
 assert(ctx.records.some(r=>r.kind==='source'&&r.data.passage.includes('some workers')));
 assert(!ctx.records.some(r=>r.id==='encounter'));assert(!('reviews' in ctx));
});
test('returned execution does not accept output; changed script invalidates old review while historical evidence survives',()=>{
 const j=fixtureJob(),s=current(j,'script')!;
 reserve(j,j.tasks[2].taskId,'editor',0,now);settle(j,'operation-1',0,usage,now);
 returnTask(j,j.tasks[2].taskId,{usableOutputRefs:[ref(s)],unresolvedQuestions:[],failedAttempts:[],usage,recommendedNextAction:'Review'},now);
 assert(!accepted(j,'editorial',ref(s)));
 addReview(j,{id:'review-v1',scope:'editorial',refs:[ref(s)],reviewer:'fresh-editor',decision:'accepted',evidence:['Read exact passage and source'],at:now});
 accept(j,'editorial',[ref(s)],['review-v1'],now);assert(accepted(j,'editorial',ref(s)));
 const changed=putRecord(j,{...s,revision:2},now);
 assert(!accepted(j,'editorial',ref(changed)));assert.throws(()=>accept(j,'editorial',[ref(changed)],['review-v1'],now),/Missing current/);
 assert(fresh(j,ref(current(j,'claim')!)));assert(!fresh(j,ref(s)));
});
test('changed route only invalidates dependent text and review; missing evidence and dropped qualifications fail',()=>{
 const j=fixtureJob(),s=current(j,'script')!;
 const route=putRecord(j,record('route','route',{stops:[ref(current(j,'candidate')!)],encounterRefs:[ref(current(j,'encounter')!)],legs:[],walkingSeconds:0,speechSeconds:60,overlapSeconds:0,lookingSeconds:20,practicalSeconds:0,allowanceSeconds:3600,assumptions:['Fixture only']},[current(j,'candidate')!,current(j,'encounter')!]),now);
 const dependent=putRecord(j,{...s,id:'dependent-script',dependsOn:[...s.dependsOn,ref(route)]},now);
 putRecord(j,{...route,revision:2},now);assert(!fresh(j,ref(dependent)));assert(fresh(j,ref(s)));
 if(s.kind!=='script')throw Error();
 const missing=putRecord(j,{...s,id:'missing-evidence',data:{...s.data,assertions:[{...s.data.assertions[0],evidenceRefs:[]}]}},now);assert(usable(j,ref(missing)).includes('Missing assertion evidence'));
 const dropped=putRecord(j,{...s,id:'dropped',data:{...s.data,transcript:'All workers received support.',assertions:[{...s.data.assertions[0],text:'All workers received support.',qualifications:[]}]}},now);assert(usable(j,ref(dropped)).includes('Dropped qualification'));
 const added=putRecord(j,{...s,id:'unlinked',data:{...s.data,transcript:s.data.transcript+' An invented school scene.'}},now);assert(usable(j,ref(added)).includes('Uncovered script text'));
});
test('physical instructions require checked visitor evidence; restricted payload cannot become an authored source',()=>{
 const j=fixtureJob(),s=current(j,'script')!;if(s.kind!=='script')throw Error();
 const bad=putRecord(j,{...s,id:'bad-view',data:{...s.data,transcript:'Look left.',assertions:[{text:'Look left.',kind:'physical',evidenceRefs:[ref(current(j,'claim')!)],qualifications:[]}]}},now);
 assert(usable(j,ref(bad)).includes('Physical instruction needs encounter evidence'));
 const src=current(j,'source')!;if(src.kind!=='source')throw Error();
 assert.throws(()=>putRecord(j,{...src,id:'restricted',data:{...src.data,retention:'reference-only'}},now),/restricted/);
 assert.throws(()=>putRecord(j,{...src,id:'missing',data:{...src.data,passage:''}},now));
});
test('duplicate issues share ownership and attempts; no-progress and oscillation require arbitration; closure does not reopen for opinion',()=>{
 const j=fixtureJob(),s=current(j,'script')!;
 const input={itemId:s.id,category:'unsupported-implication',owner:'writer',required:true,description:'Unsupported school scene',resolution:'Remove or support',refs:[ref(s)]};
 const i=issue(j,input,now);assert.equal(issue(j,{...input,owner:'other',description:'Paraphrased'},now),i);
 attempt(j,i.id,'Read primary passage','A',false,'No supporting difference',now);
 attempt(j,i.id,'Check period source','B',false,'No usable evidence',now);assert(i.arbitration);
 assert.throws(()=>reserve(j,j.tasks[0].taskId,'research',0,now),/arbitration/);
 closeIssue(j,i.id,[ref(s)],'Removed unsupported proposal; retained current qualified text',now);
 assert.equal(issue(j,{...input,description:'Another opinion'},now).state,'closed');
 putRecord(j,{...s,revision:2},now);assert.equal(i.state,'open');assert.equal(i.attempts.length,2);
 const k=issue(j,{...input,category:'oscillation'},now);
 attempt(j,k.id,'First treatment','A',true,'Initial',now);attempt(j,k.id,'Second treatment','B',true,'Alternative',now);attempt(j,k.id,'Restore without new evidence','A',false,'No external change',now);assert(k.arbitration);
});
test('global caps survive task aliases and stage return; zero ceiling prohibits chargeable dispatch',()=>{
 const j=fixtureJob();for(let n=0;n<15;n++)count(j,'candidates',now,`candidate-${n}`);count(j,'candidates',now,'candidate-0');assert.throws(()=>count(j,'candidates',now,'new'),/cap/);
 count(j,'correction',now);count(j,'correction',now);assert.throws(()=>count(j,'correction',now),/cap/);
 assert.throws(()=>reserve(j,j.tasks[0].taskId,'research',0.01,now),/Budget/);
 assert.throws(()=>reserve(j,j.tasks[0].taskId,'research',NaN,now),/invalid/);
 count(j,'render',now,'logical-clip');assert.throws(()=>count(j,'render',now,'logical-clip'),/cap/);
});
test('pending operations plus completion reserves are cumulative; failed charges remain; interrupted resume never repeats',()=>{
 const j=fixtureJob();j.costLedger.ceilingUsd=1;j.costLedger.completionReserveUsd=0.4;
 reserve(j,j.tasks[0].taskId,'research',0.4,now);assert.throws(()=>reserve(j,j.tasks[1].taskId,'scout',0.3,now),/Budget/);
 reserve(j,j.tasks[1].taskId,'scout',0.1,now);assert.throws(()=>reserve(j,j.tasks[2].taskId,'editor',0,now),/Concurrency/);
 settle(j,'operation-1',0.3,usage,now,'failed upstream');recover(j,now);assert.equal(j.status,'blocked');assert.equal(j.costLedger.operations[0].chargedUsd,0.3);assert.equal(j.costLedger.operations[1].state,'unknown');
 j.status='running';j.tasks[1].execution='queued';assert.throws(()=>reserve(j,j.tasks[1].taskId,'scout',0,now),/Reconcile/);
});
test('atomic store and coordinator resume preserve returned work, reject concurrent writer and invalid proposals',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'generation-'));const path=join(dir,'job.json');try{
 const j=fixtureJob();saveJob(path,j);
 await withJobLock(path,async()=>{await assert.rejects(withJobLock(path,async()=>{}),/already running/);await runTask(j,path,j.tasks[0].taskId,fixtureReasoner,()=>now);});
 const loaded=loadJob(path);recover(loaded,now);assert.equal(loaded.tasks[0].execution,'returned');assert.equal(loaded.costLedger.operations.length,1);
 await assert.rejects(runTask(loaded,path,loaded.tasks[0].taskId,fixtureReasoner,()=>now),/not queued/);
 const broken={billing:'zero-direct' as const,async run(){return {...await fixtureReasoner.run({task:j.tasks[1]}),records:[{not:'a record'}]};}};
 await assert.rejects(runTask(loaded,path,loaded.tasks[1].taskId,broken,()=>now));assert.equal(loadJob(path).tasks[1].execution,'blocked');assert.equal(loadJob(path).records.length,j.records.length);
 assert(!readFileSync(path,'utf8').includes('access_token'));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('stale task cannot dispatch; ready cannot bypass unresolved requirements or job deadline',()=>{
 const j=fixtureJob(),b=current(j,'brief')!;putRecord(j,{...b,revision:2},now);
 assert.throws(()=>reserve(j,j.tasks[0].taskId,'research',0,now),/stale/);
 assert.throws(()=>finish(j,'ready','Pretend done',now),/incomplete/);
 recover(j,'2026-10-06T12:21:00.000Z');assert.equal(j.status,'blocked');assert.match(j.reason,/deadline/);
});
test('scoped context rejects undeclared source dependencies and fresh roles have unique contexts',()=>{
 const j=fixtureJob(),s=current(j,'script')!;assert.throws(()=>putRecord(j,{...s,id:'bad-dependencies',dependsOn:[]},now),/Undeclared/);
 assert.throws(()=>addTask(j,{...j.tasks[0],taskId:'renamed'},now),/identity/);
 addTask(j,task('writer-new','writer',[s],'Scoped writer'),now);assert(contextRecords(j,j.tasks.at(-1)!.inputRefs).some(r=>r.kind==='source'));
});

test('a subsequent negative verdict and newly found defect revoke acceptance without a content edit',()=>{
 const j=fixtureJob(),s=current(j,'script')!;
 addReview(j,{id:'positive',scope:'editorial',refs:[ref(s)],reviewer:'editor',decision:'accepted',evidence:['Full reading'],at:now});accept(j,'editorial',[ref(s)],['positive'],now);
 addReview(j,{id:'negative',scope:'editorial',refs:[ref(s)],reviewer:'editor',decision:'needs-revision',evidence:['New evidence identifies a defect'],at:now});
 assert(!accepted(j,'editorial',ref(s)));assert.throws(()=>accept(j,'editorial',[ref(s)],['positive'],now),/Missing current/);
 assert.throws(()=>accept(j,'brief',[ref(s)],['positive'],now),/scope/);
});

test('stage coordinator reopens affected work after an input change and keeps fresh reviews separate',async()=>{
 const {nextStage}=await import('../tools/generation/workflow');
 const j=fixtureJob(),b=current(j,'brief')!;
 addReview(j,{id:'brief-review',scope:'brief',refs:[ref(b)],reviewer:'producer',decision:'accepted',evidence:['Explicit fixture requirements'],at:now});accept(j,'brief',[ref(b)],['brief-review'],now);
 const first=nextStage(j,now);assert.equal(first.taskId,'stage-research-1');
 const t=j.tasks.find(x=>x.taskId===first.taskId)!;t.execution='returned';t.result={usableOutputRefs:[],unresolvedQuestions:[],failedAttempts:[],usage,recommendedNextAction:'Route'};
 assert.equal(nextStage(j,now).taskId,'stage-route-1');
 const src=current(j,'source')!;putRecord(j,{...src,revision:2},now);
 const reopened=nextStage(j,now);assert.equal(reopened.taskId,'stage-research-2');
 assert.notEqual(j.tasks.find(x=>x.taskId===reopened.taskId)!.contextId,t.contextId);
});

test('interrupted execution has one evidence-based retry without resetting paid usage or deadline',async()=>{
 const {reconcile}=await import('../tools/generation/engine');
 const j=fixtureJob();const deadline=j.deadline;
 const op=reserve(j,j.tasks[0].taskId,'research',0,now);recover(j,now);
 assert.throws(()=>reconcile(j,op,0,usage,'',true,now),/evidence/);
 reconcile(j,op,0,usage,'Provider returned terminal failure; zero-direct adapter and return file inspected',true,now);
 assert.equal(j.deadline,deadline);assert.equal(j.tasks[0].execution,'queued');assert.equal(j.costLedger.operations.length,1);
 const retry=reserve(j,j.tasks[0].taskId,'research',0,now);recover(j,now);
 assert.throws(()=>reconcile(j,retry,0,usage,'Second failed request checked',true,now),/retry/);
 assert.equal(j.costLedger.operations.length,2);assert.equal(j.counters.research,1);
});

test('package readiness requires route/content/listening acceptance, not just media and JSON',()=>{
 const j=fixtureJob();const s=current(j,'script')!,c=current(j,'candidate')!,old=current(j,'encounter')!;
 if(old.kind!=='encounter')throw Error();
 const e=putRecord(j,{...old,revision:2,dependsOn:[ref(current(j,'source')!)],data:{...old.data,visitor:{value:{latitude:51.52,longitude:-0.1},reason:null},state:'desk-checked',unknowns:[],evidenceRefs:[ref(current(j,'source')!)]}},now);
 const r=putRecord(j,record('ready-route','route',{stops:[ref(c)],encounterRefs:[ref(e)],legs:[],walkingSeconds:0,speechSeconds:60,overlapSeconds:0,lookingSeconds:20,practicalSeconds:0,allowanceSeconds:3600,assumptions:['Synthetic ready route']},[c,e]),now);
 const assets=[0,1,2].map(i=>putRecord(j,record(`asset-${i}`,'asset',{clipId:`clip-${i}`,path:`fixture-${i}.m4a`,sha256:'0'.repeat(64),bytes:100,measuredSeconds:20,voice:'fixture',settings:{},rights:'Synthetic owned fixture',exportAllowed:true,listening:'passed'},[s]),now));
 const p=putRecord(j,record('pkg','package',{path:'fixture-package.json',sha256:'0'.repeat(64),importer:'walking-tour-package-v1',structuralChecks:['Synthetic test only; no physical evidence'],assetRefs:assets.map(ref),device:'pending',outdoors:'pending'},[r,s,...assets]),now);
 addReview(j,{id:'package-review',scope:'package',refs:[ref(p)],reviewer:'tester',decision:'accepted',evidence:['Synthetic fixture checks'],at:now});
 assert.throws(()=>accept(j,'package',[ref(p)],['package-review'],now),/acceptance missing/);
 for(const [scope,item] of [['route',r],['editorial',s],['verification',s],...assets.map(a=>['listening',a] as const)] as const){
   const id=`${scope}-${item.id}`;addReview(j,{id,scope:scope as 'route'|'editorial'|'verification'|'listening',refs:[ref(item)],reviewer:`fresh-${scope}`,decision:'accepted',evidence:['Fixture obligations checked'],at:now});
   accept(j,scope as 'route'|'editorial'|'verification'|'listening',[ref(item)],scope==='verification'?[id,`editorial-${s.id}`]:[id],now);
 }
 accept(j,'package',[ref(p)],['package-review'],now);finish(j,'ready','Synthetic lifecycle only',now);assert.equal(j.status,'ready');
 addReview(j,{id:'later-script-defect',scope:'verification',refs:[ref(s)],reviewer:'verifier',decision:'needs-revision',evidence:['Later defect in the same frozen script'],at:now});
 assert.equal(accepted(j,'package',ref(p)),false);
 assert.throws(()=>finish(j,'ready','Old package decision cannot cover a later rejection',now),/incomplete/);
 addReview(j,{id:'later-positive-review',scope:'verification',refs:[ref(s)],reviewer:'verifier',decision:'accepted',evidence:['Checked the reported concern'],at:now});
 assert.equal(accepted(j,'verification',ref(s)),false,'a new review is not a new Producer decision');

});


test('downstream editing preserves completed writer work, but an upstream rewrite reopens the editor',async()=>{
 const {nextStage}=await import('../tools/generation/workflow');
 const j=fixtureJob(),b=current(j,'brief')!,c=current(j,'candidate')!,s=current(j,'script')!,old=current(j,'encounter')!,source=current(j,'source')!;
 if(old.kind!=='encounter')throw Error();
 const e=putRecord(j,{...old,revision:2,dependsOn:[ref(source)],data:{...old.data,visitor:{value:{latitude:51.52,longitude:-0.1},reason:null},state:'desk-checked',unknowns:[],evidenceRefs:[ref(source)]}},now);
 const r=putRecord(j,record('review-route','route',{stops:[ref(c)],encounterRefs:[ref(e)],legs:[],walkingSeconds:0,speechSeconds:60,overlapSeconds:0,lookingSeconds:20,practicalSeconds:0,allowanceSeconds:3600,assumptions:['Synthetic']},[c,e]),now);
 for(const [scope,item] of [['brief',b],['route',r]] as const){const id=`review-${scope}`;addReview(j,{id,scope,refs:[ref(item)],reviewer:'fixture',decision:'accepted',evidence:['Fixture'],at:now});accept(j,scope,[ref(item)],[id],now);}
 const returned=(id:string,role:typeof j.tasks[number]['role'],inputs:typeof j.records,outputs:typeof j.records)=>{
   const t=task(id,role,inputs,'Fixture handoff');
   addTask(j,t,now);t.execution='returned';t.result={usableOutputRefs:outputs.map(ref),unresolvedQuestions:[],failedAttempts:[],usage,recommendedNextAction:'Review'};
 };
 for(const role of ['research','route','scout'] as const)returned(`stage-${role}-1`,role,[b],[]);
 returned('stage-writer-1','writer',[b,r],[s]);
 const edited=putRecord(j,{...s,revision:2},now);returned('stage-editor-1','editor',[b,r,s],[edited]);
 addReview(j,{id:'edited-review',scope:'editorial',refs:[ref(edited)],reviewer:'fresh-editor',decision:'accepted',evidence:['Read edited version'],at:now});accept(j,'editorial',[ref(edited)],['edited-review'],now);
 assert.equal(nextStage(j,now).taskId,'stage-verification-1','normal editing must not restart the writer');
 const rewritten=putRecord(j,{...edited,revision:3},now);returned('stage-writer-2','writer',[b,r],[rewritten]);
 assert.equal(nextStage(j,now).taskId,'stage-editor-2','writer supersession must reopen an earlier editorial review');
});


test('stale queued task is retained as cancelled and replaced only after current prerequisite acceptance',async()=>{
 const {nextStage}=await import('../tools/generation/workflow');
 const j=fixtureJob(),b=current(j,'brief')!;
 const reviewBrief=(item:typeof b,id:string)=>{addReview(j,{id,scope:'brief',refs:[ref(item)],reviewer:'producer',decision:'accepted',evidence:['Current brief inspected'],at:now});accept(j,'brief',[ref(item)],[id],now);};
 reviewBrief(b,'brief-original');
 const first=nextStage(j,now);assert.equal(first.taskId,'stage-research-1');
 const original=j.tasks.find(t=>t.taskId===first.taskId)!;
 const revised=putRecord(j,{...b,revision:2},now);
 const blocked=nextStage(j,now);
 assert.equal(blocked.taskId,undefined);assert.match(blocked.blockers.join(),/brief acceptance/);
 assert.equal(original.execution,'cancelled');assert.equal(j.costLedger.operations.length,0);
 assert(j.events.some(e=>e.type==='stale-queued-task-cancelled'&&e.detail===original.taskId));
 reviewBrief(revised,'brief-revised');
 const replacement=nextStage(j,now);assert.equal(replacement.taskId,'stage-research-2');
 const next=j.tasks.find(t=>t.taskId===replacement.taskId)!;
 assert.notEqual(next.contextId,original.contextId);assert(next.inputRefs.some(r=>r.id===b.id&&r.revision===2));
 assert.equal(nextStage(j,now).taskId,replacement.taskId,'fresh queued task is reused without duplicating work');
 addReview(j,{id:'brief-rejected',scope:'brief',refs:[ref(revised)],reviewer:'producer',decision:'needs-revision',evidence:['Newly identified omission'],at:now});
 assert.match(nextStage(j,now).blockers.join(),/brief acceptance/,'even a fresh queued task must recheck its stage prerequisite');
});


test('managed dispatch prerequisites reject same-revision brief and route acceptance revocation',async()=>{
 const {stageDispatchBlockers}=await import('../tools/generation/workflow');
 const j=fixtureJob(),b=current(j,'brief')!,c=current(j,'candidate')!,old=current(j,'encounter')!,source=current(j,'source')!;
 if(old.kind!=='encounter')throw Error();
 const e=putRecord(j,{...old,revision:2,dependsOn:[ref(source)],data:{...old.data,visitor:{value:{latitude:51.52,longitude:-0.1},reason:null},state:'desk-checked',unknowns:[],evidenceRefs:[ref(source)]}},now);
 const r=putRecord(j,record('dispatch-route','route',{stops:[ref(c)],encounterRefs:[ref(e)],legs:[],walkingSeconds:0,speechSeconds:60,overlapSeconds:0,lookingSeconds:20,practicalSeconds:0,allowanceSeconds:3600,assumptions:['Synthetic']},[c,e]),now);
 for(const [scope,item,role] of [['brief',b,'research'],['route',r,'writer']] as const){
   const id=`initial-${scope}`;addReview(j,{id,scope,refs:[ref(item)],reviewer:'producer',decision:'accepted',evidence:['Checked'],at:now});accept(j,scope,[ref(item)],[id],now);
   const t=task(`stage-${role}-1`,role,[item],'Managed stage');
   assert.deepEqual(stageDispatchBlockers(j,t),[]);
   addReview(j,{id:`negative-${scope}`,scope,refs:[ref(item)],reviewer:'producer',decision:'needs-revision',evidence:['Required correction'],at:now});
   assert.match(stageDispatchBlockers(j,t).join(),new RegExp(`${scope} acceptance`));
 }
 const calibration=task('supervised-draft-review','editor',[b],'Explicit draft review; cannot grant acceptance');
 assert.deepEqual(stageDispatchBlockers(j,calibration),[]);
});


test('route acceptance uses the declared brief envelope and actual leg duration sum',()=>{
 const j=fixtureJob(),b=current(j,'brief')!,c=current(j,'candidate')!,old=current(j,'encounter')!,source=current(j,'source')!;
 if(old.kind!=='encounter')throw Error();
 const e=putRecord(j,{...old,revision:2,dependsOn:[ref(source)],data:{...old.data,visitor:{value:{latitude:51.52,longitude:-0.1},reason:null},state:'desk-checked',unknowns:[],evidenceRefs:[ref(source)]}},now);
 const other=putRecord(j,{...c,id:'second-candidate'},now);
 const data={stops:[ref(c),ref(other)],encounterRefs:[ref(e)],legs:[{from:c.id,to:other.id,geometry:[{latitude:51.52,longitude:-0.1},{latitude:51.521,longitude:-0.1}],distanceMetres:111,durationSeconds:120,maneuvers:['Fixture only'],provider:'Fixture',retrievedAt:now,evidenceRefs:[ref(source)]}],walkingSeconds:120,speechSeconds:60,overlapSeconds:30,lookingSeconds:20,practicalSeconds:0,allowanceSeconds:3600,assumptions:['Synthetic arithmetic test']};
 const put=(id:string,changes:Partial<typeof data>)=>putRecord(j,record(id,'route',{...data,...changes},[b,c,other,e,source]),now);
 const tooLong=put('overlong',{speechSeconds:4200,allowanceSeconds:7200});
 assert(usable(j,ref(tooLong)).includes('Duration exceeds brief'));
 addReview(j,{id:'overlong-positive',scope:'route',refs:[ref(tooLong)],reviewer:'fixture',decision:'accepted',evidence:['A positive opinion cannot expand the brief'],at:now});
 assert.throws(()=>accept(j,'route',[ref(tooLong)],['overlong-positive'],now),/exceeds brief/);
 const wrongWalking=put('understated-walking',{walkingSeconds:0,overlapSeconds:0});
 assert(usable(j,ref(wrongWalking)).includes('Walking duration does not match route legs'));
 const rounded=put('rounded-walking',{walkingSeconds:120.5});
 assert.deepEqual(usable(j,ref(rounded)),[],'subsecond rounding and separate speech overlap remain valid');
 const unbriefedJob=fixtureJob();putRecord(unbriefedJob,e,now);
 const noBriefCandidate=putRecord(unbriefedJob,{...c,id:'unbriefed-candidate',dependsOn:[]},now);
 const missingBrief=putRecord(unbriefedJob,record('unbriefed-route','route',{...data,stops:[ref(noBriefCandidate)],legs:[],walkingSeconds:0,overlapSeconds:0},[noBriefCandidate,e,source]),now);
 assert(usable(unbriefedJob,ref(missingBrief)).includes('Route needs a declared brief dependency'));
});

test('known settled failure can explicitly retry once without changing prior usage, context, deadline or acceptance',async()=>{
 const {retrySettledTask}=await import('../tools/generation/engine');
 const j=fixtureJob(),t=j.tasks[0],deadline=j.deadline,contextId=t.contextId;
 const op=reserve(j,t.taskId,'research',0,now);settle(j,op,0,usage,now,'Provider completed but local output validation failed');t.execution='blocked';
 const before=structuredClone(j.costLedger.operations[0]),counters=structuredClone(j.counters),decisions=structuredClone(j.decisions);
 assert.throws(()=>retrySettledTask(j,op,'',now),/evidence/);
 retrySettledTask(j,op,'Saved completed return and parser repair checked; no inference replay yet',now);
 assert.equal(t.execution,'queued');assert.equal(t.operationId,undefined);assert.equal(t.contextId,contextId);assert.equal(j.deadline,deadline);
 assert.deepEqual(j.costLedger.operations,[before]);assert.deepEqual(j.counters,counters);assert.deepEqual(j.decisions,decisions);
 assert(j.events.some(e=>e.type==='technical-retry-queued'&&e.detail.startsWith(op)));
 assert.throws(()=>retrySettledTask(j,op,'Duplicate command',now),/blocked/);
 const second=reserve(j,t.taskId,'research',0,now);settle(j,second,0,usage,now,'Second technical failure');t.execution='blocked';
 const final=JSON.stringify(j);
 assert.throws(()=>retrySettledTask(j,second,'Cannot repeat indefinitely',now),/retry already consumed/);assert.equal(JSON.stringify(j),final);
});

test('settled retry rejects stale, expired, unresolved, cancelled, accepted and overspent states without mutation',async()=>{
 const {retrySettledTask}=await import('../tools/generation/engine');
 const failed=()=>{const j=fixtureJob(),t=j.tasks[0];const op=reserve(j,t.taskId,'research',0,now);settle(j,op,0,usage,now,'Known failure');t.execution='blocked';return {j,t,op};};
 for(const scenario of ['stale','deadline','pending','cancelled','returned','overspent','arbitration'] as const){
   const {j,t,op}=failed();let timestamp=now;
   if(scenario==='stale'){const b=current(j,'brief')!;putRecord(j,{...b,revision:2},now);}
   if(scenario==='deadline')timestamp=j.deadline;
   if(scenario==='pending')reserve(j,j.tasks[1].taskId,'scout',0,now);
   if(scenario==='cancelled')j.status='cancelled';
   if(scenario==='returned'){t.execution='returned';t.result={usableOutputRefs:[],unresolvedQuestions:[],failedAttempts:[],usage,recommendedNextAction:'Review'};}
   if(scenario==='overspent'){j.costLedger.operations[0].chargedUsd=0.01;j.status='blocked';}
   if(scenario==='arbitration'){const i=issue(j,{itemId:'script',category:'no-progress',owner:'writer',required:true,description:'Must arbitrate',resolution:'Producer decision',refs:[ref(current(j,'script')!)]},now);i.arbitration=true;}
   const before=JSON.stringify(j);
   assert.throws(()=>retrySettledTask(j,op,'Outcome reviewed',timestamp));assert.equal(JSON.stringify(j),before,scenario);
 }
 const {j,t,op}=failed();j.costLedger.operations[0].state='unknown';
 assert.throws(()=>retrySettledTask(j,op,'Unknown charge cannot be guessed',now),/Settled/);assert.equal(t.execution,'blocked');
});
