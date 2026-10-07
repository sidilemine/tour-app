/** Explicit owner-authorized time amendment; never resets counters or resumes work. */
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { event } from '../engine';
import type { Job } from '../records';
import { loadJob, saveJob, withJobLock } from '../store';

export function amendTimeAllowance(job:Job,totalMinutes:number,ownerDecision:string,now:string){
 assert.ok(Number.isInteger(totalMinutes)&&totalMinutes>0&&totalMinutes<=120,'Bounded total time allowance required');
 assert.ok(ownerDecision.trim().length>=20,'Record the explicit owner decision, not assumed consent');
 assert.ok(!['ready','cancelled','awaiting-decision'].includes(job.status),'Completed jobs cannot be extended');
 assert.ok(job.costLedger.operations.every(o=>o.state==='settled'),'Reconcile all pending outcomes before an amendment');
 const deadline=new Date(Date.parse(job.createdAt)+totalMinutes*60000).toISOString();
 assert.ok(Date.parse(deadline)>Date.parse(job.deadline)&&Date.parse(deadline)>Date.parse(now),'Amendment must add remaining time from the original start');
 event(job,now,'owner-time-allowance-amendment',JSON.stringify({previousDeadline:job.deadline,deadline,totalMinutes,ownerDecision:ownerDecision.trim(),countersPreserved:true,directPaidCeilingUsd:job.costLedger.ceilingUsd}));
 job.deadline=deadline;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [directory,minutes,evidence]=process.argv.slice(2);if(!directory||!minutes||!evidence)throw Error('Usage: amend-budget <job directory> <TOTAL minutes> <explicit owner approval>');
 const path=join(directory,'job.json');
 withJobLock(path,async()=>{const job=loadJob(path);amendTimeAllowance(job,Number(minutes),evidence,new Date().toISOString());saveJob(path,job);process.stdout.write(JSON.stringify({deadline:job.deadline,status:job.status,counters:job.counters})+'\n');}).catch(error=>{process.stderr.write(String(error)+'\n');process.exitCode=1;});
}
