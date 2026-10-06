import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Job, RecordItem, Task, Usage, ref } from './records';
import { contextRecords, count, event, fresh, putRecord, reserve, returnTask, settle } from './engine';
import { saveJob } from './store';

/** This slice admits only fixtures and consented included-plan requests: no paid implementations. */
export interface Reasoner {
  readonly billing: 'zero-direct';
  run(context:{ task:Task; instructions:string; records:RecordItem[] }):Promise<{ records:unknown[]; unresolvedQuestions:string[]; failedAttempts:string[]; recommendedNextAction:string; usage:Usage }>;
}
export function roleInstructions(role:Task['role']) {
  return readFileSync(new URL(`./roles/${role}.txt`,import.meta.url),'utf8');
}
export function taskContext(j:Job,t:Task) {
  const instructions=roleInstructions(t.role);
  const hash=createHash('sha256').update(instructions).digest('hex');
  if(j.conditions.promptHashes[t.role]&&j.conditions.promptHashes[t.role]!==hash)throw Error('Prompt changed: record new conditions before comparison/resume');
  j.conditions.promptHashes[t.role]=hash;
  // No other task conversation, hidden provider state, or reviewer verdict is supplied.
  return {task:t,instructions,records:contextRecords(j,t.inputRefs)};
}
export async function runTask(j:Job,path:string,taskId:string,provider:Reasoner,now:()=>string) {
  const task=j.tasks.find(t=>t.taskId===taskId);if(!task)throw Error('Unknown task');
  if(provider.billing!=='zero-direct')throw Error('Provider lacks the zero-direct-charge contract');
  const context=taskContext(j,task);
  const op=reserve(j,taskId,task.role,0,now()); saveJob(path,j);
  try {
    const result=await provider.run(context);
    // Resolve billing before attempting to promote potentially invalid/stale output.
    settle(j,op,0,result.usage,now());saveJob(path,j);
    if(task.inputRefs.some(r=>!fresh(j,r))) {
      task.execution='blocked';event(j,now(),'stale-return',taskId);saveJob(path,j);throw Error('Stale return; current records retained');
    }
    // All proposed writes validate in an isolated copy before a single serialized promotion.
    const proposed=structuredClone(j);
    if(result.records.some(r=>typeof r==='object'&&r!==null&&(r as RecordItem).kind==='script'&&(r as RecordItem).revision>1))count(proposed,'correction',now());
    const permitted:Record<Task['role'],RecordItem['kind'][]>={'planner-producer':['brief','source','claim','candidate','encounter','route','script','asset','package'],research:['source','claim','candidate'],route:['route','candidate'],scout:['source','encounter'],writer:['script'],editor:['script'],verification:['claim'],tester:[]};
    for(const r of result.records)if(!r||typeof r!=='object'||!permitted[task.role].includes((r as RecordItem).kind))throw Error('Role attempted an out-of-scope record write');
    const outputs=result.records.map(r=>ref(putRecord(proposed,r,now())));
    returnTask(proposed,taskId,{...result,usableOutputRefs:outputs},now());
    Object.assign(j,proposed);saveJob(path,j);
  } catch(error) {
    task.execution='blocked';
    const operation=j.costLedger.operations.find(o=>o.id===op)!;
    if(operation.state==='pending')operation.state='unknown';
    event(j,now(),'task-failed',`${taskId}: output not accepted; inspect provider diagnostic`);saveJob(path,j);throw error;
  }
}
