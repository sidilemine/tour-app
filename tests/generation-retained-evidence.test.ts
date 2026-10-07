import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';
import { z } from 'zod';
import { briefSchema } from '../tools/generation/factory/contracts';
import { collectRouteTextEvidence, createRetainedEvidenceTools } from '../tools/generation/factory/retained-evidence';
import { FactoryRuntime, type LocalTool } from '../tools/generation/factory/runtime';
import type { InferenceRequest, ProviderResult } from '../tools/generation/provider';

const imageUrl='https://example.org/image.png',mapUrl='https://overpass-api.de/api/interpreter#query-fixture',pageUrl='https://example.org/page';
const source=(url:string,passage='')=>({id:'source',url,title:'Fixture',origin:'Fixture evidence',passage,locator:'Fixture'});
const bytes=Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489','hex');
const image={dataUrl:'data:image/png;base64,'+bytes.toString('base64'),mimeType:'image/png',sha256:createHash('sha256').update(bytes).digest('hex')};
const brief=briefSchema.parse({schemaVersion:1,id:'retained-fixture',area:'Synthetic',start:'Start',end:'Start',durationSeconds:3600,access:'Public',audience:{reason:'Fixture',assumedKnowledge:'None',intendedDiscovery:'Fixture',presentAnchor:'Fixture'},voice:'local Kokoro George',model:'gpt-6-astra',effort:'medium',directPaidCeilingUsd:0,mapId:'hampstead',freshContentOnly:true,requirements:['Fixture']});
const schema=z.object({answer:z.string()}).strict();
function sandbox(t:TestContext){const path=mkdtempSync(join(tmpdir(),'tour-retained-evidence-'));t.after(()=>rmSync(path,{recursive:true,force:true}));return path;}
function response(output:ProviderResult['output']=[]):ProviderResult{return {status:'completed',contextId:'fixture',model:'gpt-6-astra',effort:'medium',text:output.length?'':'{"answer":"done"}',output,usage:{inputTokens:30,outputTokens:5,totalTokens:35,source:'response.completed'},elapsedMs:1,evidenceKind:'fixture',diagnostic:{code:'fixture',retryable:false,automaticRetries:0},directChargeUsd:0,estimatedApiEquivalentUsd:null};}
function imageCall(id:string){return {type:'function_call',namespace:'factory',name:'read_image',call_id:id,arguments:JSON.stringify({url:imageUrl})};}
async function archive(t:TestContext,failed=false){
 const directory=sandbox(t),requests:InferenceRequest[]=[];
 const runtime=new FactoryRuntime(directory,brief,async()=>({async request(request){requests.push(structuredClone({...request,signal:undefined}));if(requests.length%2===1)return response([imageCall(`image_${requests.length}`)]);return failed?{...response(),status:'failed',diagnostic:{code:'fixture-failure',retryable:false,automaticRetries:0}}:response();}}),()=> '2026-10-07T10:00:00.000Z');
 const original:LocalTool={name:'read_image',description:'Fixture',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false},parse:args=>z.object({url:z.string()}).parse(args),async run(){return {url:imageUrl,finalUrl:imageUrl,image,captureDate:null};}};
 const phase=runtime.phase('original','scout','Fixture image',{},schema,{tools:[original],maxRequests:2});
 if(failed)await assert.rejects(phase);else await phase;
 return {directory,runtime,requests};
}

test('retained text reader preserves exact map identity and restricts ordinary fallback to allowed sources',async t=>{
 const directory=sandbox(t);let calls=0;
 const fallback:LocalTool={name:'read_page',description:'Fixture',parameters:{},parse:args=>z.object({url:z.string()}).parse(args),async run(args){calls++;return {url:args.url,text:'Fetched retained page'};}};
 const {readPage}=createRetainedEvidenceTools({directory,research:{sources:[source(mapUrl,'footway'),source(pageUrl,'Text'),source(imageUrl)]},pages:new Map([[mapUrl,{text:'Exact saved OSM footway geometry'}]]),fallbackReadPage:fallback});
 assert.deepEqual(await readPage.run({url:mapUrl}),{url:mapUrl,text:'Exact saved OSM footway geometry',evidence:'Retained text from this job; untrusted source material',cacheHit:true});assert.equal(calls,0);
 assert.deepEqual(await readPage.run({url:pageUrl}),{url:pageUrl,text:'Fetched retained page'});assert.equal(calls,1);
 for(const url of ['https://example.org/new',mapUrl+'-changed','http://example.org/page','https://user:password@example.org/page'])assert.throws(()=>readPage.parse({url}));
 await assert.rejects(readPage.run({url:'https://example.org/new'}));await assert.rejects(readPage.run({url:imageUrl}));assert.equal(calls,1);
 const missing=createRetainedEvidenceTools({directory,research:{sources:[source(mapUrl,'footway')]},pages:new Map(),fallbackReadPage:fallback});
 await assert.rejects(missing.readPage.run({url:mapUrl}),/unavailable/);assert.equal(calls,1);
});

test('retained image reader sends archived pixels through the runtime bridge with observed reviewer usage',async t=>{
 const {directory,runtime,requests}=await archive(t);
 const tools=createRetainedEvidenceTools({directory,research:{sources:[source(imageUrl)]},pages:new Map()});
 await runtime.phase('verification','verification','Inspect the retained pixels independently',{},schema,{tools:[tools.readPage,tools.readImage],maxRequests:2});
 assert.equal(requests.length,4);
 const input=requests[3].input;
 assert.ok(input.some(item=>Array.isArray(item.content)&&item.content.some(part=>part.type==='input_image'&&part.image_url===image.dataUrl)));
 const closure=input.find(item=>item.type==='function_call_output');assert.ok(closure);assert.ok(!String(closure.output).includes('base64'));assert.match(String(closure.output),/operation-1/);
 assert.equal(runtime.job.costLedger.operations.at(-1)?.usage?.inputTokens,30);
 assert.equal(runtime.job.tasks.at(-1)?.role,'verification');
 await assert.rejects(tools.readImage.run({url:'https://example.org/unlisted.png'}));
});

test('downloaded image with no completed observing request cannot be reopened as observed evidence',async t=>{
 const {directory}=await archive(t,true);
 const {readImage}=createRetainedEvidenceTools({directory,research:{sources:[source(imageUrl)]},pages:new Map()});
 await assert.rejects(readImage.run({url:imageUrl}),/No completed model request/);
});

test('tampered archive pixels never reach the reviewer even when metadata retains the original hash',async t=>{
 const {directory}=await archive(t);
 const path=join(directory,'requests','operation-1-image_1.json'),saved=JSON.parse(readFileSync(path,'utf8'));
 saved.result.image.dataUrl='data:image/png;base64,'+Buffer.from('not a PNG').toString('base64');writeFileSync(path,JSON.stringify(saved));
 const {readImage}=createRetainedEvidenceTools({directory,research:{sources:[source(imageUrl)]},pages:new Map()});
 await assert.rejects(readImage.run({url:imageUrl}),/No completed model request/);
});

test('route text collection requires exact phase, completed settled operation, matching tool and valid public text hash',async t=>{
 const {directory}=await archive(t);
 const jobPath=join(directory,'job.json'),responsePath=join(directory,'requests','operation-1-result.json'),receiptPath=join(directory,'requests','operation-1-image_1.json');
 const originalJob=JSON.parse(readFileSync(jobPath,'utf8')),text='Mapped zebra crossing; current conditions unverified.',hash=createHash('sha256').update(text).digest('hex');
 for(const name of ['read_map','read_station_map','read_crossing_map','read_page']){
  const job=structuredClone(originalJob);job.tasks[0].scope='route-disposition';writeFileSync(jobPath,JSON.stringify(job));
  const result=response([{...imageCall('image_1'),name}]),receipt={name,result:{url:mapUrl,text,hash}};
  writeFileSync(responsePath,JSON.stringify(result));writeFileSync(receiptPath,JSON.stringify(receipt));
  assert.deepEqual(collectRouteTextEvidence(directory,['route-disposition']),[{url:mapUrl,text,hash,operationId:'operation-1',callId:'image_1',phaseId:'route-disposition',toolName:name}]);
  assert.deepEqual(collectRouteTextEvidence(directory,['other-phase']),[]);
 }
 const goodJob=JSON.parse(readFileSync(jobPath,'utf8')),goodResult=JSON.parse(readFileSync(responsePath,'utf8')),goodReceipt=JSON.parse(readFileSync(receiptPath,'utf8'));
 const duplicate=structuredClone(goodResult);duplicate.output.push({...duplicate.output[0],call_id:'duplicate_map'});
 writeFileSync(responsePath,JSON.stringify(duplicate));writeFileSync(join(directory,'requests','operation-1-duplicate_map.json'),JSON.stringify(goodReceipt));
 assert.equal(collectRouteTextEvidence(directory,['route-disposition']).length,1,'URL identities are deduplicated with their first provenance preserved');
 for(const defect of ['pending','failed','wrong-scope','wrong-tool','wrong-namespace','tool-error','bad-hash','private-url','invalid-port']){
  const job=structuredClone(goodJob),result=structuredClone(goodResult),receipt=structuredClone(goodReceipt);
  if(defect==='pending')job.costLedger.operations[0].state='pending';
  if(defect==='failed')result.status='failed';
  if(defect==='wrong-scope')job.tasks[0].scope='research';
  if(defect==='wrong-tool')receipt.name='read_image';
  if(defect==='wrong-namespace')result.output[0].namespace='other';
  if(defect==='tool-error')receipt.result.error='HTTP 504';
  if(defect==='bad-hash')receipt.result.text='Altered';
  if(defect==='private-url')receipt.result.url='https://127.0.0.1/private';
  if(defect==='invalid-port')receipt.result.url='https://example.org:8443/private';
  writeFileSync(jobPath,JSON.stringify(job));writeFileSync(responsePath,JSON.stringify(result));writeFileSync(receiptPath,JSON.stringify(receipt));
  assert.deepEqual(collectRouteTextEvidence(directory,['route-disposition']),[],defect);
 }
});

test('explicit route manifest expands only exact retained identities and takes precedence over mutable fetched pages',async t=>{
 const directory=sandbox(t),text='Retained crossing geometry',hash=createHash('sha256').update(text).digest('hex');
 const item={url:mapUrl,text,hash,operationId:'operation-1',callId:'map_1',phaseId:'route-disposition',toolName:'read_crossing_map'};
 const {readPage}=createRetainedEvidenceTools({directory,research:{sources:[]},routeEvidence:[item],pages:new Map([[mapUrl,{text:'Different mutable text'}],[pageUrl,{text:'Unrelated fetched page'}]])});
 assert.equal((await readPage.run({url:mapUrl}) as {text:string}).text,text);
 await assert.rejects(readPage.run({url:pageUrl}),/Only exact retained/);
 assert.throws(()=>createRetainedEvidenceTools({directory,research:{sources:[]},routeEvidence:[{...item,text:'Tampered'}],pages:new Map()}),/identity or hash/);
});
