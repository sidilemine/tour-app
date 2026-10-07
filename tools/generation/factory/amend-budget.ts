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
/** A separately approved continuation starts now; owner waiting cannot consume it before dispatch. */
export function amendRemainingTimeAllowance(job:Job,minutes:number,ownerDecision:string,now:string){
 assert.ok(Number.isInteger(minutes)&&minutes>0&&minutes<=60,'Bounded continuation of at most 60 minutes required');
 assert.ok(ownerDecision.trim().length>=20,'Record explicit approval for time from resumption');
 assert.ok(!['ready','cancelled','awaiting-decision'].includes(job.status),'Completed jobs cannot be extended');
 assert.ok(job.costLedger.operations.every(o=>o.state==='settled'),'Reconcile all pending outcomes before an amendment');
 const deadline=new Date(Date.parse(now)+minutes*60000).toISOString();
 assert.ok(Date.parse(deadline)>Date.parse(job.deadline),'Continuation must add time, not silently shorten existing allowance');
 event(job,now,'owner-time-allowance-amendment',JSON.stringify({basis:'from-explicit-resumption',previousDeadline:job.deadline,deadline,additionalMinutesFromNow:minutes,ownerDecision:ownerDecision.trim(),countersPreserved:true,directPaidCeilingUsd:job.costLedger.ceilingUsd}));
 job.deadline=deadline;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [directory,value,third,fourth]=process.argv.slice(2),fromNow=value==='--from-now',minutes=fromNow?third:value,evidence=fromNow?fourth:third;
 if(!directory||!minutes||!evidence)throw Error('Usage: amend-budget <job directory> [--from-now] <minutes> <explicit owner approval>');
 const path=join(directory,'job.json');
 withJobLock(path,async()=>{const job=loadJob(path);(fromNow?amendRemainingTimeAllowance:amendTimeAllowance)(job,Number(minutes),evidence,new Date().toISOString());saveJob(path,job);process.stdout.write(JSON.stringify({deadline:job.deadline,status:job.status,counters:job.counters})+'\n');}).catch(error=>{process.stderr.write(String(error)+'\n');process.exitCode=1;});
}
