import test from 'node:test';
import assert from 'node:assert/strict';
import { createJob } from '../tools/generation/engine';
import { amendTimeAllowance } from '../tools/generation/factory/amend-budget';

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
