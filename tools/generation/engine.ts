import { Job, RecordItem, Ref, Review, Task, Usage, recordSchema, ref } from './records';

export function createJob(id: string, now: string, mode: Job['conditions']['mode'] = 'fixture'): Job {
  return { schemaVersion: 1, id, revision: 1, createdAt: now, updatedAt: now, deadline: new Date(Date.parse(now) + 20*60_000).toISOString(), status: 'running', reason: 'Work in progress; no output accepted by execution alone.', profile: 'Balanced', records: [], tasks: [], reviews: [], decisions: [], issues: [], counters: { candidates: [], research: 0, route: 0, correction: 0, render: {} }, costLedger: { currency: 'USD', ceilingUsd: 0, completionReserveUsd: 0, quoteDate: now.slice(0,10), operations: [] }, events: [], waiting: { quotaSeconds: 0, ownerSeconds: 0 }, conditions: { model: 'gpt-6.1-sol', effort: 'medium', promptHashes: {}, tools: [], startingEvidence: 'explicit records only', voice: 'local Kokoro George', qualityFloor: 'Current evidence, essential physical access, worthwhile interpretation, listening and actual offline package checks', mode } };
}
export const current = (j: Job, id: string) => j.records.filter(r => r.id === id).sort((a,b) => b.revision-a.revision)[0];
export function exact(j: Job, r: Ref): RecordItem {
  const found = j.records.find(x => x.id === r.id && x.revision === r.revision);
  if (!found) throw Error(`Missing record ${r.id}@${r.revision}`);
  return found;
}
export function fresh(j: Job, r: Ref, seen = new Set<string>()): boolean {
  const key = `${r.id}@${r.revision}`;
  if (seen.has(key)) return false;
  const record = exact(j,r);
  if (current(j,r.id)?.revision !== r.revision) return false;
  return record.dependsOn.every(d => fresh(j,d,new Set([...seen,key])));
}
export function event(j: Job, now: string, type: string, detail: string) {
  j.updatedAt = now; j.revision++; j.events.push({ at: now, type, detail });
}
function refsIn(r: RecordItem): Ref[] {
  switch(r.kind) {
    case 'claim': return r.data.sourceRefs;
    case 'encounter': return r.data.evidenceRefs;
    case 'route': return [...r.data.stops,...r.data.encounterRefs,...r.data.legs.flatMap(l=>l.evidenceRefs)];
    case 'script': return r.data.assertions.flatMap(a=>a.evidenceRefs);
    case 'package': return r.data.assetRefs;
    default: return [];
  }
}
export function putRecord(j: Job, value: unknown, now: string): RecordItem {
  const r = recordSchema.parse(value);
  const prior = current(j,r.id);
  if (r.revision !== (prior?.revision ?? 0)+1 || (prior && (r.kind!==prior.kind || r.createdAt!==prior.createdAt))) throw Error('Record identity/revision conflict');
  for (const d of r.dependsOn) { if(d.id===r.id) throw Error('Self dependency'); exact(j,d); }
  for (const d of refsIn(r)) if (!r.dependsOn.some(x=>x.id===d.id && x.revision===d.revision)) throw Error(`Undeclared input ${d.id}`);
  if(r.kind==='source' && r.data.retention!=='minimal-passage') throw Error('Cannot persist restricted or unknown source payload; keep a permitted reference outside evidence records');
  if(r.kind==='candidate'&&!prior)count(j,'candidates',now,r.id);
  if(r.kind==='route')count(j,'route',now);
  j.records.push(r);
  for(const issue of j.issues) if(issue.state==='closed' && issue.closure?.refs.some(d=>!fresh(j,d))) {
    issue.state='open'; event(j,now,'issue-reopened',issue.id);
  }
  // Decisions remain in history; validity is computed from their exact transitive inputs.
  event(j,now,'record',`${r.id}@${r.revision}`); return r;
}
export function usable(j: Job, r: Ref): string[] {
  const x = exact(j,r); const errors: string[] = [];
  if(!fresh(j,r)) errors.push(`Stale ${r.id}`);
  if(x.kind==='claim') {
    if(!['reviewed-supported','supported-with-qualification'].includes(x.data.status)) errors.push(`Unreviewed claim ${x.id}`);
    for(const s of x.data.sourceRefs) if(exact(j,s).kind!=='source') errors.push(`Missing supporting passage ${x.id}`);
    if(x.data.status==='supported-with-qualification' && !x.data.qualifications.length) errors.push(`Missing qualification ${x.id}`);
  }
  if(x.kind==='encounter' && (!['desk-checked','field-checked'].includes(x.data.state) || !x.data.visitor.value || !x.data.evidenceRefs.length || x.data.unknowns.length)) errors.push(`Unresolved encounter ${x.id}`);
  if(x.kind==='route') {
    if(x.data.overlapSeconds>Math.min(x.data.walkingSeconds,x.data.speechSeconds)) errors.push('Impossible overlap');
    if(x.data.walkingSeconds+x.data.speechSeconds-x.data.overlapSeconds+x.data.lookingSeconds+x.data.practicalSeconds>x.data.allowanceSeconds) errors.push('Duration exceeds brief');
    if(x.data.legs.length!==x.data.stops.length-1) errors.push('Route leg coverage');
    x.data.legs.forEach((l,i)=> { if(l.from!==x.data.stops[i]?.id || l.to!==x.data.stops[i+1]?.id) errors.push('Route sequence mismatch'); });
  }
  if(x.kind==='script') {
    // Exact partition prevents unlinked prose being silently appended. Semantic entailment still requires a fresh reviewer.
    if(x.data.assertions.map(a=>a.text).join('\n\n')!==x.data.transcript) errors.push('Uncovered script text');
    for(const a of x.data.assertions) {
      if(a.kind!=='editorial' && !a.evidenceRefs.length) errors.push('Missing assertion evidence');
      for(const d of a.evidenceRefs) {
        const e = exact(j,d);
        if(a.kind==='physical' && e.kind!=='encounter') errors.push('Physical instruction needs encounter evidence');
        if(a.kind==='factual' && e.kind!=='claim') errors.push('Factual assertion needs claim evidence');
        if(e.kind==='claim') for(const q of e.data.qualifications) if(!a.qualifications.includes(q) || !a.text.includes(q)) errors.push('Dropped qualification');
      }
    }
  }
  if(x.kind==='asset' && (!x.data.exportAllowed || x.data.listening!=='passed')) errors.push('Asset rights/listening pending');
  if(x.kind==='package' && !x.data.structuralChecks.length) errors.push('Package checks missing');
  for(const d of x.dependsOn) errors.push(...usable(j,d));
  return [...new Set(errors)];
}
export function addReview(j: Job, review: Review) {
  if(j.reviews.some(r=>r.id===review.id) || !review.refs.length || !review.evidence.length) throw Error('Review needs unique ID, scope and actual evidence');
  review.refs.forEach(r=>exact(j,r)); j.reviews.push(review); event(j,review.at,'review',review.id);
}
export function accept(j: Job, scope: Review['scope'], refs: Ref[], reviewIds: string[], now: string) {
  if(!refs.length) throw Error('Empty commitment');
  const expectedKind={brief:'brief',route:'route',editorial:'script',verification:'script',listening:'asset',package:'package'}[scope];
  if(refs.some(r=>exact(j,r).kind!==expectedKind))throw Error('Review scope does not match record kind');
  if(scope==='package') for(const p of refs.map(r=>exact(j,r))) {
    if(p.kind!=='package')throw Error('Package commitment needs a package record');
    const dependencies=contextRecords(j,p.dependsOn);
    if(!dependencies.some(r=>r.kind==='route')||!dependencies.some(r=>r.kind==='script'))throw Error('Package needs route and script dependencies');
    for(const r of dependencies) {
      if(r.kind==='route'&&!accepted(j,'route',ref(r)))throw Error('Route acceptance missing');
      if(r.kind==='script'&&!accepted(j,'verification',ref(r)))throw Error('Content acceptance missing');
      if(r.kind==='asset'&&!accepted(j,'listening',ref(r)))throw Error('Listening review missing');
    }
  }
  const reviews = reviewIds.map(id=>j.reviews.find(r=>r.id===id));
  const requiredScopes: Review['scope'][] = scope==='verification'?['editorial','verification']:[scope];
  for(const r of refs) {
    const failures = usable(j,r); if(failures.length) throw Error(failures.join('; '));
    for(const s of requiredScopes) if(!reviews.some(v=>v?.id===latestReview(j,s,r)?.id && v?.scope===s && v.decision==='accepted' && v.refs.some(d=>d.id===r.id&&d.revision===r.revision) && v.refs.every(d=>fresh(j,d)))) throw Error(`Missing current ${s} review`);
  }
  const ids = new Set(contextRecords(j,refs).map(r=>r.id));
  if(j.issues.some(i=>i.required&&i.state==='open'&&ids.has(i.itemId))) throw Error('Required issue is open');
  j.decisions.push({scope,refs,reviewIds,at:now}); event(j,now,'accepted',scope);
}
function latestReview(j:Job,scope:Review['scope'],r:Ref){return j.reviews.filter(v=>v.scope===scope&&v.refs.some(x=>x.id===r.id&&x.revision===r.revision)).at(-1);}
export function accepted(j: Job, scope: Review['scope'], r: Ref) {
  const ids=new Set(contextRecords(j,[r]).map(x=>x.id));
  if(j.issues.some(i=>i.required&&i.state==='open'&&ids.has(i.itemId)))return false;
  const scopes:Review['scope'][]=scope==='verification'?['editorial','verification']:[scope];
  if(scopes.some(s=>latestReview(j,s,r)?.decision!=='accepted'))return false;
  if(scope==='package') {
    for(const dependency of contextRecords(j,exact(j,r).dependsOn)) {
      const required=dependency.kind==='route'?'route':dependency.kind==='script'?'verification':dependency.kind==='asset'?'listening':null;
      if(required&&!accepted(j,required,ref(dependency)))return false;
    }
  }
  return j.decisions.some(d=>d.scope===scope && d.refs.some(x=>x.id===r.id&&x.revision===r.revision) && d.refs.every(x=>fresh(j,x)) && scopes.every(s=> {
    const review=latestReview(j,s,r);
    return review&&d.reviewIds.includes(review.id)&&review.refs.every(x=>fresh(j,x));
  })); }

export function contextRecords(j: Job, refs: Ref[]): RecordItem[] {
  const result = new Map<string,RecordItem>();
  const visit=(r:Ref)=>{ const key=`${r.id}@${r.revision}`; if(result.has(key))return; const x=exact(j,r); result.set(key,x); x.dependsOn.forEach(visit); }; refs.forEach(visit); return [...result.values()];
}
export function addTask(j: Job, t: Task, now: string) {
  if(j.tasks.some(x=>x.taskId===t.taskId || x.contextId===t.contextId)) throw Error('Task/context identity already used');
  if(t.execution!=='queued' || t.operationId || t.result || !t.inputRefs.length || !(t.limits.seconds>0)) throw Error('Invalid new task');
  t.inputRefs.forEach(r=>exact(j,r)); j.tasks.push(t); event(j,now,'task-queued',t.taskId);
}
export function count(j: Job, kind: 'candidates'|'research'|'route'|'correction'|'render', now: string, logicalId?: string) {
  if(kind==='candidates') {
    if(!logicalId) throw Error('Stable candidate ID required');
    if(j.counters.candidates.includes(logicalId)) return;
    if(j.decisions.some(d=>d.scope==='route'&&d.refs.every(r=>fresh(j,r)))) throw Error('Ordinary discovery frozen');
    if(j.counters.candidates.length>=16) throw Error('Candidate cap'); j.counters.candidates.push(logicalId);
  } else if(kind==='render') {
    if(!logicalId) throw Error('Stable clip ID required');
    if((j.counters.render[logicalId]??0)>=1) throw Error('Corrective render cap'); j.counters.render[logicalId]=(j.counters.render[logicalId]??0)+1;
  } else { const cap={ research:2, route:3, correction:2 }[kind]; if(j.counters[kind]>=cap) throw Error(`${kind} cap`); j.counters[kind]++; }
  event(j,now,'counter',`${kind}:${logicalId??''}`);
}
export function reserve(j: Job, taskId: string, stage: string, amount: number, now: string) {
  if(j.status!=='running' || Date.parse(now)>=Date.parse(j.deadline)) throw Error('Job stopped or deadline reached');
  if(j.issues.some(i=>i.arbitration&&i.state==='open')) throw Error('Producer arbitration required');
  if(!Number.isFinite(amount)||amount<0) throw Error('Unknown/invalid charge');
  const task=j.tasks.find(t=>t.taskId===taskId); if(!task||task.execution!=='queued') throw Error('Task is not queued');
  if(task.inputRefs.some(r=>!fresh(j,r))) throw Error('Task inputs stale');
  if(j.costLedger.operations.some(o=>o.taskId===taskId&&o.state!=='settled')) throw Error('Reconcile pending outcome before retry');
  if(j.tasks.filter(t=>t.execution==='working').length>=2) throw Error('Concurrency limit');
  const committed=j.costLedger.operations.reduce((n,o)=>n+(o.state==='settled'?o.chargedUsd!:o.reservedUsd),0);
  const reserve=Math.max(j.costLedger.completionReserveUsd,j.costLedger.ceilingUsd*0.25);
  if(committed+amount+reserve>j.costLedger.ceilingUsd) throw Error('Budget including pending charges/completion reserve');
  if(task.role==='research'&&j.costLedger.operations.some(o=>o.stage==='research'))count(j,'research',now);
  const id=`operation-${j.costLedger.operations.length+1}`;
  j.costLedger.operations.push({id,taskId,stage,state:'pending',reservedUsd:amount,chargedUsd:null,startedAt:now}); task.operationId=id;task.execution='working'; event(j,now,'dispatch',id);return id;
}
export function settle(j:Job, operationId:string, charge:number, usage:Usage, now:string, failure?:string) {
  const o=j.costLedger.operations.find(x=>x.id===operationId);if(!o||o.state==='settled')throw Error('Unknown/already settled operation');
  if(!Number.isFinite(charge)||charge<0)throw Error('Unknown charge remains pending');
  o.state='settled';o.chargedUsd=charge;o.usage=usage;o.endedAt=now;o.activeSeconds=Math.max(0,(Date.parse(now)-Date.parse(o.startedAt))/1000);o.failure=failure;
  if(charge>o.reservedUsd){j.status='blocked';j.reason='Actual charge exceeded reservation; no further dispatch';}
  event(j,now,'settled',operationId);
}
export function returnTask(j:Job,taskId:string,result:NonNullable<Task['result']>,now:string) {
  const task=j.tasks.find(t=>t.taskId===taskId);if(!task||task.execution!=='working')throw Error('Task not working');
  result.usableOutputRefs.forEach(r=>exact(j,r));task.result=result;task.execution='returned';event(j,now,'returned',taskId);
}
export function recover(j:Job,now:string) {
  for(const t of j.tasks)if(t.execution==='working') {t.execution='blocked';const o=j.costLedger.operations.find(x=>x.id===t.operationId);if(o&&o.state==='pending')o.state='unknown';event(j,now,'interrupted',t.taskId);}
  if(j.costLedger.operations.some(o=>o.state==='unknown')) {j.status='blocked';j.reason='Interrupted operations need reconciliation; no automatic replay';}
  if(Date.parse(now)>=Date.parse(j.deadline)&&j.status==='running'){j.status='blocked';j.reason='Generation job deadline reached; drafts retained';}
}
export function issue(j:Job, input:Pick<Job['issues'][number],'itemId'|'category'|'owner'|'required'|'description'|'resolution'|'refs'>, now:string) {
  const key=`${input.itemId}:${input.category}`;const existing=j.issues.find(i=>i.key===key);
  if(existing)return existing;
  input.refs.forEach(r=>exact(j,r));const result={...input,id:`issue-${j.issues.length+1}`,key,state:'open' as const,attempts:[],arbitration:false};j.issues.push(result);event(j,now,'issue-opened',result.id);return result;
}
export function attempt(j:Job,id:string,tactic:string,fingerprint:string,progress:boolean,evidence:string,now:string) {
  const i=j.issues.find(x=>x.id===id);if(!i||i.state!=='open'||i.arbitration)throw Error('Issue not available for correction');
  if(!tactic||!evidence||i.attempts.at(-1)?.tactic===tactic)throw Error('Follow-up needs changed tactic and evidence');
  i.attempts.push({tactic,fingerprint,progress,evidence});const n=i.attempts.length;
  if((n>=2&&i.attempts.slice(-2).every(a=>!a.progress)) || (n>=3&&i.attempts[n-3].fingerprint===fingerprint&&!progress))i.arbitration=true;
  event(j,now,'issue-attempt',id);
}
export function closeIssue(j:Job,id:string,refs:Ref[],evidence:string,now:string) {
  const i=j.issues.find(x=>x.id===id);if(!i||!refs.length||!evidence||refs.some(r=>!fresh(j,r)))throw Error('Current closure evidence required');
  if(!refs.some(r=>r.id===i.itemId))throw Error('Closure must cover affected item');
  i.state='closed';i.closure={refs,evidence};event(j,now,'issue-closed',id);
}
export function finish(j:Job,status:Job['status'],reason:string,now:string) {
  if(status==='running'||!reason)throw Error('Terminal outcome required');
  if(status==='ready') {
    if(Date.parse(now)>=Date.parse(j.deadline))throw Error('Readiness deadline exhausted; retain incomplete job');
    const packages=j.records.filter(r=>r.kind==='package'&&current(j,r.id)===r);
    if(!packages.length||packages.some(p=>!accepted(j,'package',ref(p))||usable(j,ref(p)).length)||j.issues.some(i=>i.required&&i.state==='open')||j.costLedger.operations.some(o=>o.state!=='settled'))throw Error('Readiness obligations incomplete');
  }
  j.status=status;j.reason=reason;event(j,now,'terminal',status);
}

export function reconcile(j:Job,operationId:string,charge:number,usage:Usage,evidence:string,retry:boolean,now:string) {
 const o=j.costLedger.operations.find(x=>x.id===operationId);if(!o||o.state==='settled'||!evidence.trim())throw Error('Unsettled operation and checked outcome evidence required');
 settle(j,operationId,charge,usage,now);event(j,now,'reconciled',`${operationId}: ${evidence}`);
 const t=j.tasks.find(x=>x.taskId===o.taskId);if(!t)throw Error('Missing operation task');
 if(retry){
   if(Date.parse(now)>=Date.parse(j.deadline))throw Error('Deadline exhausted; retain draft rather than resetting job');
   if(j.costLedger.operations.filter(x=>x.taskId===t.taskId).length>=2)throw Error('One technical retry already consumed');
   if(t.inputRefs.some(r=>!fresh(j,r)))throw Error('Reconciled task inputs are stale');
   t.execution='queued';delete t.operationId;
   if(!j.costLedger.operations.some(x=>x.state!=='settled')){j.status='running';j.reason='Checked failed operation may retry once within original envelope';}
 }
}
