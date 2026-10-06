import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {taskOutputSchema,MeasuredTaskError,runTask} from '../tools/generation/coordinator';
import {fixtureJob,fixtureTime} from '../tools/generation/fixture';
import {loadJob} from '../tools/generation/store';
import {astraEstimate,roleUsage} from '../tools/generation/usage';
const usage={inputTokens:1000,outputTokens:200,cachedInputTokens:400,reasoningTokens:150,totalTokens:1200,subscription:true,apiEquivalentUsd:null,priceDate:'2026-10-06',uncertainty:'Cache writes unknown'};

test('structured findings normalize losslessly without accepting arbitrary output envelopes',()=>{
 const finding={refs:[{id:'claim',revision:1}],question:'Missing passage?',finding:'Related snippet is insufficient'};
 const parsed=taskOutputSchema.parse({records:[],unresolvedQuestions:[finding],failedAttempts:[],recommendedNextAction:'Read the source'});
 assert.deepEqual(JSON.parse(parsed.unresolvedQuestions[0]),finding);
 assert.throws(()=>taskOutputSchema.parse({records:[],unresolvedQuestions:[true],failedAttempts:[],recommendedNextAction:'x'}));
});

test('completed provider usage remains settled when payload validation fails, without accepting output',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tour-usage-'));try {
 const j=fixtureJob(),path=join(dir,'job.json');
 await assert.rejects(runTask(j,path,'research-initial',{billing:'zero-direct',async run(){throw new MeasuredTaskError('Invalid envelope',usage);}},()=>fixtureTime),/Invalid envelope/);
 const saved=loadJob(path);assert.equal(saved.tasks[0].execution,'blocked');assert.equal(saved.costLedger.operations[0].state,'settled');assert.deepEqual(saved.costLedger.operations[0].usage,usage);assert.equal(saved.decisions.length,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('per-role cost estimate counts reasoning within output once and separates unknown requests',()=>{
 assert.deepEqual(astraEstimate(usage),{lower:0.0164,upper:0.0179});
 const j=fixtureJob();j.conditions.model='gpt-6-astra';j.costLedger.operations.push({id:'known',taskId:'research-initial',stage:'research',state:'settled',reservedUsd:0,chargedUsd:0,startedAt:fixtureTime,usage},{id:'unknown',taskId:'research-initial',stage:'research',state:'unknown',reservedUsd:0,chargedUsd:null,startedAt:fixtureTime});
 const result=roleUsage(j);assert.equal(result.byRole[0].observedOutputTokens,200);assert.equal(result.byRole[0].operationsWithUnknownTokens,1);assert.equal(result.byRole[0].operationsWithoutEstimate,1);assert.equal(result.rows[0].reasoningTokens,150);
});

test('concurrent task failure updates current task after another return replaces the job snapshot',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tour-concurrent-'));try {
 const j=fixtureJob(),path=join(dir,'job.json');let release!:()=>void;const wait=new Promise<void>(resolve=>{release=resolve;});
 const bad=runTask(j,path,'scout-initial',{billing:'zero-direct',async run(){await wait;throw Error('transport');}},()=>fixtureTime);
 await runTask(j,path,'research-initial',{billing:'zero-direct',async run(){return {records:[],unresolvedQuestions:[],failedAttempts:[],recommendedNextAction:'Review',usage};}},()=>fixtureTime);release();await assert.rejects(bad,/transport/);
 assert.equal(loadJob(path).tasks.find(t=>t.taskId==='scout-initial')!.execution,'blocked');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('a rejected multi-record batch retains candidate allowance and does not promote partial records',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tour-batch-'));try {
 const j=fixtureJob(),path=join(dir,'job.json'),candidate=structuredClone(j.records.find(r=>r.kind==='candidate')!);candidate.id='attempted-candidate';
 await assert.rejects(runTask(j,path,'research-initial',{billing:'zero-direct',async run(){return {records:[candidate,{...candidate,id:'bad',revision:99}],unresolvedQuestions:[],failedAttempts:[],recommendedNextAction:'Review',usage};}},()=>fixtureTime),/revision conflict/);
 const saved=loadJob(path);assert.ok(saved.counters.candidates.includes(candidate.id));assert.equal(saved.records.some(r=>r.id===candidate.id),false);assert.equal(saved.costLedger.operations[0].state,'settled');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('first malformed proposal and partial observed usage remain counted',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tour-malformed-'));try {
 const j=fixtureJob(),path=join(dir,'job.json'),candidate=structuredClone(j.records.find(r=>r.kind==='candidate')!);candidate.id='malformed-attempt';candidate.revision=99;
 await assert.rejects(runTask(j,path,'research-initial',{billing:'zero-direct',async run(){return {records:[candidate],unresolvedQuestions:[],failedAttempts:[],recommendedNextAction:'Review',usage:{...usage,outputTokens:null}};}},()=>fixtureTime),/revision conflict/);
 assert.ok(loadJob(path).counters.candidates.includes(candidate.id));
 const report=roleUsage(j);assert.equal(report.byRole[0].observedInputTokens,1000);assert.equal(report.byRole[0].operationsWithUnknownOutput,1);assert.equal(report.byRole[0].observedOutputTokens,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
