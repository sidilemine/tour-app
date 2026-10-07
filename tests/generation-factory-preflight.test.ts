import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {runFactoryPreflight} from '../tools/generation/factory/preflight';
const now=1_800_000_000_000;
async function setup(){
 const root=await mkdtemp(path.join(os.tmpdir(),'tour-calibration-')),auth=path.join(root,'local-data/generation-auth'),output=path.join(root,'calibration');
 await mkdir(auth,{recursive:true,mode:0o700});
 await writeFile(path.join(auth,'credentials.json'),JSON.stringify({version:1,provider:'chatgpt-plan',clientId:'oaiapp_fixture',accountSubject:'fixture-account',hostId:'fixture-host',accessToken:'fixture-secret',idToken:'fixture-id',grantedScopes:['openid','resource.invoke','chatgpt.tokens.use.direct'],expiresAt:now+3_600_000,validatedAt:now}),{mode:0o600});
 await writeFile(path.join(auth,'overflow-evidence.json'),JSON.stringify({disabled:true,source:'owner-observed-chatgpt-usage',clientId:'oaiapp_fixture',accountSubject:'fixture-account',verifiedAt:now}),{mode:0o600});
 return {root,output,cleanup:()=>rm(root,{recursive:true,force:true})};
}
function fetcher(hasSearch:boolean,onRequest:()=>Promise<void>):typeof fetch{return async(url,init)=>{
 if(String(url).endsWith('/models'))return Response.json({models:[{slug:'gpt-6-astra',visibility:'list'}]});
 await onRequest();const body=JSON.parse(String(init?.body));assert.equal(body.model,'gpt-6-astra');assert.equal(body.reasoning.effort,'medium');assert.equal(body.tools[0].type,'web_search');
 const output=[...(hasSearch?[{type:'web_search_call',id:'ws_fixture',status:'completed',action:{type:'search',query:'Valhalla pedestrian routing',sources:[{url:'https://valhalla.github.io/valhalla/api/turn-by-turn/api-reference/'}]}}]:[]),{type:'message',content:[{type:'output_text',text:'I searched for official docs.'}]}];
 return new Response(`data: ${JSON.stringify({type:'response.completed',response:{status:'completed',output,usage:{input_tokens:40,output_tokens:10,total_tokens:50}}})}\n\n`,{headers:{'content-type':'text/event-stream'}});
};}

test('search calibration durably reserves once, retains tokens and distinguishes fixture capability from live proof',async()=>{
 const {root,output,cleanup}=await setup();try{
 let calls=0;
 const summary=await runFactoryPreflight(output,{root,now:()=>now,fetch:fetcher(true,async()=>{
  calls++;const pending=JSON.parse(await readFile(path.join(output,'calibration-ledger.json'),'utf8'));assert.equal(pending.costLedger.operations[0].state,'pending');assert.equal(pending.costLedger.ceilingUsd,0);
 })});
 assert.equal(calls,1);assert.equal(summary.status,'fixture-passed');assert.equal(summary.hostedSearchObserved,true);assert.equal(summary.completedSearchCalls,1);assert.equal(summary.directChargeUsd,0);assert.equal(summary.usage?.totalTokens,50);assert.match(summary.promptHash,/^[a-f0-9]{64}$/);
 const saved=JSON.parse(await readFile(path.join(output,'calibration-ledger.json'),'utf8'));assert.equal(saved.costLedger.operations[0].state,'settled');assert.equal(saved.costLedger.operations[0].usage.inputTokens,40);
 assert.equal((await stat(path.join(output,'provider-return.json'))).mode&0o777,0o600);assert.ok(!JSON.stringify(summary).includes('fixture-secret'));
 await assert.rejects(runFactoryPreflight(output,{root,now:()=>now,fetch:fetcher(true,async()=>{calls++;})}),/already used/);assert.equal(calls,1);
 }finally{await cleanup();}
});

test('completed model prose without an observed hosted search cannot pass the calibration',async()=>{
 const {root,output,cleanup}=await setup();try{
 const summary=await runFactoryPreflight(output,{root,now:()=>now,fetch:fetcher(false,async()=>{})});
 assert.equal(summary.status,'failed');assert.equal(summary.hostedSearchObserved,false);assert.equal(summary.diagnosticCode,'completed_without_observed_search_and_sources');assert.equal(summary.usage?.totalTokens,50);
 }finally{await cleanup();}
});

test('calibration with no app credentials records a zero-dispatch blocked outcome',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'tour-no-credentials-'));try{
 let calls=0;const summary=await runFactoryPreflight(path.join(root,'calibration'),{root,now:()=>now,fetch:async()=>{calls++;throw Error('must not dispatch');}});
 assert.equal(summary.status,'blocked');assert.equal(summary.diagnosticCode,'app_sign_in_required');assert.equal(calls,0);assert.equal(summary.directChargeUsd,0);
 }finally{await rm(root,{recursive:true,force:true});}
});
