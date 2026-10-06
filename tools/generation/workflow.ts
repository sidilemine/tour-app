import { Job, RecordItem, Role, ref } from './records';
import { accepted, addTask, current, fresh, usable } from './engine';
import { task } from './fixture';

// A small responsibility graph, not a general scheduler. Each stage has a fresh context.
const stages: { id: string; role: Role; kinds: RecordItem['kind'][]; requires?: { kind:RecordItem['kind']; scope:'brief'|'route'|'editorial'|'verification' }[]; purpose:string }[] = [
 {id:'research',role:'research',kinds:['brief','source','claim','candidate'],requires:[{kind:'brief',scope:'brief'}],purpose:'Develop bounded candidate evidence and questions for this visitor; use actual retained passages.'},
 {id:'route',role:'route',kinds:['brief','candidate','claim','encounter','route'],requires:[{kind:'brief',scope:'brief'}],purpose:'Develop the full loop from actual router outputs, endpoint and visitor evidence; count the whole timeline once.'},
 {id:'scout',role:'scout',kinds:['brief','candidate','encounter','route','source'],requires:[{kind:'brief',scope:'brief'}],purpose:'Inspect the actual selected route, visitor positions and available imagery; return physical gaps without inventing a visit.'},
 {id:'writer',role:'writer',kinds:['brief','candidate','claim','encounter','route'],requires:[{kind:'route',scope:'route'}],purpose:'Draft the accepted outline with audience discovery, exact qualifications, physical evidence and windows.'},
 {id:'editor',role:'editor',kinds:['brief','candidate','route','script'],purpose:'Fresh whole-tour assessment of the frozen text; return actionable issues and actual revision references.'},
 {id:'verification',role:'verification',kinds:['brief','script','claim','source','encounter','route'],requires:[{kind:'script',scope:'editorial'}],purpose:'Review the final edited wording against actual evidence; return exact current coverage and missing support.'},
 {id:'tester',role:'tester',kinds:['brief','route','script','asset','package'],requires:[{kind:'script',scope:'verification'}],purpose:'Assess actual assembly/media/import results and journey checks; retain listening, phone and outdoor unknowns.'},
];
export function nextStage(j:Job,now:string):{taskId?:string;blockers:string[]} {
 const latest=j.records.filter(r=>current(j,r.id)===r&&fresh(j,ref(r)));
 for(const stage of stages) {
   const runs=j.tasks.filter(t=>t.taskId.startsWith(`stage-${stage.id}-`));
   const already=runs.at(-1);
   if(already) {
     if(already.execution==='returned') {
       const outputs=already.result?.usableOutputRefs??[];
       const replaced=new Set(outputs.map(r=>r.id));
       if(outputs.every(r=>fresh(j,r))&&already.inputRefs.filter(r=>!replaced.has(r.id)).every(r=>fresh(j,r)))continue;
     }
     if(already.execution==='queued')return {taskId:already.taskId,blockers:[]};
     if(already.execution!=='returned')return {blockers:[`${already.taskId} is ${already.execution}; inspect/reconcile its output before another attempt`]};
   }
   const blockers:string[]=[];
   for(const requirement of stage.requires??[]) {
     const inputs=latest.filter(r=>r.kind===requirement.kind);
     if(!inputs.length||inputs.some(r=>!accepted(j,requirement.scope,ref(r))))blockers.push(`Current ${requirement.kind} requires ${requirement.scope} acceptance`);
   }
   if(stage.id==='editor'&&!latest.some(r=>r.kind==='script'))blockers.push('No script to edit');
   if(stage.id==='tester'&&!latest.some(r=>r.kind==='package'))blockers.push('Assemble candidate package with deterministic tools first');
   if(stage.id==='route'&&!latest.some(r=>r.kind==='candidate'))blockers.push('Research has not returned candidates');
   if(stage.id==='scout'&&!latest.some(r=>r.kind==='route'))blockers.push('Route proposal required');
   if(blockers.length)return {blockers};
   const inputs=latest.filter(r=>stage.kinds.includes(r.kind));
   const t=task(`stage-${stage.id}-${runs.length+1}`,stage.role,inputs,stage.purpose);
   const brief=inputs.find(r=>r.kind==='brief');if(brief?.kind==='brief')t.audienceContext=brief.data.audience;
   t.limits.seconds=120;t.scope='Frozen current records, with transitive actual evidence. No other role history.';
   addTask(j,t,now);return {taskId:t.taskId,blockers:[]};
 }
 return {blockers:['Responsibility stages returned; Producer must assess current package and listening before ready.']};
}
export function report(j:Job,now:string) {
 const latest=j.records.filter(r=>current(j,r.id)===r);
 const operations=j.costLedger.operations;
 return {job:j.id,status:j.status,reason:j.reason,mode:j.conditions.mode,conditions:j.conditions,
 contentDrafted:latest.filter(r=>r.kind==='script').map(r=>({ref:ref(r),structuralEvidenceGaps:usable(j,ref(r)),contentAccepted:accepted(j,'verification',ref(r))})),
 packages:latest.filter(r=>r.kind==='package').map(r=>({ref:ref(r),accepted:accepted(j,'package',ref(r)),gaps:usable(j,ref(r))})),
 tasks:j.tasks.map(t=>({taskId:t.taskId,role:t.role,execution:t.execution,result:t.result})),openIssues:j.issues.filter(i=>i.state==='open'),counters:j.counters,
 costs:{directChargedUsd:operations.reduce((n,o)=>n+(o.chargedUsd??0),0),pendingReservedUsd:operations.filter(o=>o.state!=='settled').reduce((n,o)=>n+o.reservedUsd,0),pendingOutcomes:operations.filter(o=>o.state!=='settled').length,completionReserveUsd:j.costLedger.completionReserveUsd,subscriptionRequests:operations.filter(o=>o.usage?.subscription).length,inputTokens:operations.every(o=>o.usage?.inputTokens!==null&&o.usage?.inputTokens!==undefined)?operations.reduce((n,o)=>n+o.usage!.inputTokens!,0):null,estimatedApiEquivalentUsd:operations.every(o=>o.usage?.apiEquivalentUsd!==null&&o.usage?.apiEquivalentUsd!==undefined)?operations.reduce((n,o)=>n+o.usage!.apiEquivalentUsd!,0):null,uncertainties:operations.map(o=>o.usage?.uncertainty).filter(Boolean)},
 timing:{totalElapsedSeconds:Math.max(0,(Date.parse(now)-Date.parse(j.createdAt))/1000),activeTaskSeconds:operations.reduce((n,o)=>n+(o.activeSeconds??0),0),...j.waiting},
 physicalEvidence:'No new device/outdoor result inferred from generation, automated checks, or retained records.'};
}
