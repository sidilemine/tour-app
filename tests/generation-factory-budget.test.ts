import test from 'node:test';
import assert from 'node:assert/strict';
import { createJob } from '../tools/generation/engine';
import { amendRemainingTimeAllowance, amendTimeAllowance } from '../tools/generation/factory/amend-budget';

test('explicit time amendment preserves original start, counters, blocked state and accounting',()=>{
 const job=createJob('fixture','2026-10-07T10:00:00.000Z');job.status='blocked';job.reason='Retained fixture failure';job.counters.route=2;job.counters.research=1;
 const before=structuredClone(job);
 amendTimeAllowance(job,45,'Owner explicitly approved 45 minutes total in this fixture.','2026-10-07T10:25:00.000Z');
 assert.equal(job.deadline,'2026-10-07T10:45:00.000Z');assert.equal(job.createdAt,before.createdAt);assert.equal(job.status,'blocked');assert.equal(job.reason,before.reason);assert.deepEqual(job.counters,before.counters);assert.deepEqual(job.costLedger,before.costLedger);assert.equal(job.events.at(-1)?.type,'owner-time-allowance-amendment');
});
test('amendment refuses missing evidence, exhausted replacement, completed work and uncertain operations',()=>{
 const fresh=()=>createJob('fixture','2026-10-07T10:00:00.000Z'),decision='Explicit owner decision recorded for this fixture.',now='2026-10-07T10:25:00.000Z';
 assert.throws(()=>amendTimeAllowance(fresh(),45,'',now));assert.throws(()=>amendTimeAllowance(fresh(),20,decision,now));
 const done=fresh();done.status='ready';assert.throws(()=>amendTimeAllowance(done,45,decision,now));
 const unknown=fresh();unknown.costLedger.operations.push({id:'unknown',taskId:'task',stage:'research',state:'unknown',reservedUsd:0,chargedUsd:null,startedAt:unknown.createdAt});assert.throws(()=>amendTimeAllowance(unknown,45,decision,now));
});
test('explicit continuation starts at resumption after owner waiting and preserves earlier history and all counters',()=>{
 const job=createJob('fixture','2026-10-07T10:00:00.000Z');job.status='blocked';job.reason='Retained timed out synthesis';job.counters.research=2;job.counters.route=2;
 const before=structuredClone(job);
 amendRemainingTimeAllowance(job,30,'Owner explicitly approved 30 minutes from resumption.','2026-10-07T14:00:00.000Z');
 assert.equal(job.deadline,'2026-10-07T14:30:00.000Z');assert.equal(job.createdAt,before.createdAt);assert.equal(job.status,before.status);assert.equal(job.reason,before.reason);assert.deepEqual(job.counters,before.counters);assert.deepEqual(job.costLedger,before.costLedger);assert.deepEqual(job.events.slice(0,-1),before.events);
 assert.equal(JSON.parse(job.events.at(-1)!.detail).basis,'from-explicit-resumption');
});
test('continuation refuses assumed approval, unbounded time, completed jobs, uncertain dispatches and shorter deadlines',()=>{
 const fresh=()=>createJob('fixture','2026-10-07T10:00:00.000Z'),approval='Explicit approval of continuation from resumption.',now='2026-10-07T10:25:00.000Z';
 assert.throws(()=>amendRemainingTimeAllowance(fresh(),30,'',now));assert.throws(()=>amendRemainingTimeAllowance(fresh(),61,approval,now));
 assert.throws(()=>amendRemainingTimeAllowance(fresh(),1,approval,'2026-10-07T10:01:00.000Z'));
 const done=fresh();done.status='awaiting-decision';assert.throws(()=>amendRemainingTimeAllowance(done,30,approval,now));
 const unknown=fresh();unknown.costLedger.operations.push({id:'unknown',taskId:'task',stage:'research',state:'unknown',reservedUsd:0,chargedUsd:null,startedAt:unknown.createdAt});assert.throws(()=>amendRemainingTimeAllowance(unknown,30,approval,now));
});
