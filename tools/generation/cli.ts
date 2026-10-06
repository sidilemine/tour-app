import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { z } from 'zod';
import { accept, addReview, createJob, event, finish, putRecord, recover, reconcile, reserve, settle } from './engine';
import { audience, fixtureJob, fixtureReasoner } from './fixture';
import { loadJob, saveJob, withJobLock } from './store';
import { runTask, type Reasoner } from './coordinator';
import { nextStage, report } from './workflow';
import { SubscriptionProvider, runCapabilityPreflight, type CapabilityPreflight, type ReasoningProvider } from './provider';
import { beginSignIn, loadCredentials, loadOverflowEvidence, recordOverflowDisabled } from './signin';
import { refSchema, type Review } from './records';

const now=()=>new Date().toISOString();
const json=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const print=(value:unknown)=>console.log(JSON.stringify(value,null,2));
const write=(path:string,value:unknown)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(value,null,2)+'\n',{mode:0o600});};
async function provider(){return new SubscriptionProvider({credentials:await loadCredentials('.'),overflowEvidence:await loadOverflowEvidence('.'),timeoutMs:120_000});}
const outputSchema=z.object({records:z.array(z.unknown()),unresolvedQuestions:z.array(z.string()),failedAttempts:z.array(z.string()),recommendedNextAction:z.string().min(1)}).strict();
async function main(){
 const [command,path,arg]=process.argv.slice(2);
 if(command==='signin'){
   console.log('Continue with ChatGPT — opening the official browser sign-in for Tour app local generation.');
   await beginSignIn('.',url=>new Promise<void>((res,rej)=>{const child=spawn('open',[url],{stdio:'ignore'});child.on('error',()=>rej(Error('System browser failed to open')));child.on('exit',code=>code===0?res():rej(Error('System browser failed to open')));}));
   console.log('App-specific sign-in and plan permission validated. Check this app in ChatGPT Settings → Usage before preflight.');return;
 }
 if(command==='overflow-disabled'){
   if(path!=='--owner-observed')throw Error('Only record after the owner actually checked this app’s credit overflow is disabled in ChatGPT Settings → Usage.');
   await recordOverflowDisabled('.');console.log('Recorded the owner’s observation for this app/account.');return;
 }
 if(command==='preflight'){
   const p=await provider();
   // Known red PNG; no third-party image retained or transmitted.
   const red='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAF0lEQVR4nGP4z8BAEiJN9aiGUQ1DSgMAkPn/Afnh+ngAAAAASUVORK5CYII=';
   const resultPath=path??'local-data/generation/preflight.json';
   const ledgerPath=`${resultPath}.ledger.json`;
   await withJobLock(ledgerPath,async()=>{
   if(existsSync(ledgerPath)) {
     const old=loadJob(ledgerPath);
     if(old.costLedger.operations.some(o=>o.state!=='settled'))throw Error('Reconcile interrupted preflight ledger before another probe');
   }
   const ledger=existsSync(ledgerPath)?loadJob(ledgerPath):createJob('capability-preflight',now(),'subscription');
   const selectedModel=process.env.TOUR_GENERATION_MODEL??'gpt-6.1-sol';
   const selectedEffort=process.env.TOUR_GENERATION_EFFORT??'medium';
   if(existsSync(ledgerPath)&&(ledger.conditions.model!==selectedModel||ledger.conditions.effort!==selectedEffort))throw Error('Preflight model/effort changed; preserve this ledger and explicitly start a separately named calibration');
   ledger.conditions.model=selectedModel;ledger.conditions.effort=selectedEffort;
   if(ledger.status!=='running'||Date.now()>=Date.parse(ledger.deadline))throw Error('Preflight envelope ended; retain its ledger and start a separately named calibration after review');
   const credentials=await loadCredentials('.');
   const measured:ReasoningProvider={async request(request){
     const id=`probe-${ledger.tasks.length+1}`;
     ledger.tasks.push({taskId:id,role:'tester',purpose:request.contextId,scope:'Harmless T43 capability probe',inputRefs:[],audienceContext:audience,allowedDecisions:['Return actual capability result'],toolPermissions:[],limits:{seconds:120},expectedOutput:'Completed probe or explicit failure',completionCondition:'Terminal stream required',recipient:'planner-producer',contextId:request.contextId,execution:'queued'});
     const op=reserve(ledger,id,'preflight',0,now());saveJob(ledgerPath,ledger);
     const result=await p.request(request);
     settle(ledger,op,0,{inputTokens:result.usage.inputTokens,outputTokens:result.usage.outputTokens,subscription:result.status!=='blocked',apiEquivalentUsd:result.estimatedApiEquivalentUsd,priceDate:result.apiEquivalentEstimate?.priceDate??null,uncertainty:result.apiEquivalentEstimate?.reason??'Usage estimate unavailable'},now(),result.status==='completed'?undefined:result.diagnostic.code);
     ledger.tasks.at(-1)!.execution=result.status==='completed'?'returned':'blocked';saveJob(ledgerPath,ledger);return result;
   }};
   const result=await runCapabilityPreflight(measured,{imageDataUrl:red,model:process.env.TOUR_GENERATION_MODEL,effort:process.env.TOUR_GENERATION_EFFORT});
   write(resultPath,{...result,checkedAt:now(),accountBinding:credentials?{clientId:credentials.clientId,validatedAt:credentials.validatedAt}:null,conditions:{search:'No runtime search dispatch verified; retained source records only',imagery:'Synthetic color input only; scouting evidence must be independently supplied',voice:'local Kokoro George'}});
   print(result);});return;
 }
 if(!path)throw Error('Usage: npm run generation -- init|fixture|resume|next|run|put|review|accept|report|finish <job.json> [input.json|task-id|status] ; signin ; overflow-disabled --owner-observed ; preflight [report.json]');
 await withJobLock(path,async()=>{
   if(command==='init'||command==='fixture'){
     if(existsSync(path))throw Error('Job already exists; use resume (never reset allowances).');
     const j=command==='fixture'?fixtureJob():createJob(`job-${Date.now()}`,now(),'subscription');
     if(command==='fixture'){
       const start=now();j.createdAt=start;j.updatedAt=start;j.deadline=new Date(Date.parse(start)+20*60_000).toISOString();
     }else {if(!arg)throw Error('init needs a brief record JSON');putRecord(j,json(arg),now());j.conditions.model=process.env.TOUR_GENERATION_MODEL??j.conditions.model;j.conditions.effort=process.env.TOUR_GENERATION_EFFORT??j.conditions.effort;}
     saveJob(path,j);print(report(j,now()));return;
   }
   const j=loadJob(path);
   if(command==='resume'){recover(j,now());saveJob(path,j);print(report(j,now()));return;}
   if(command==='report'){print(report(j,now()));return;}
   if(command==='put'){if(!arg)throw Error('Record JSON required');const input=json(arg);for(const r of Array.isArray(input)?input:[input])putRecord(j,r,now());}
   else if(command==='review'){
     if(!arg)throw Error('Review JSON required');
     const value=z.object({id:z.string().min(1),scope:z.enum(['brief','route','editorial','verification','listening','package']),refs:z.array(refSchema).min(1),reviewer:z.string().min(1),decision:z.enum(['accepted','needs-revision']),evidence:z.array(z.string().min(1)).min(1),at:z.iso.datetime()}).strict().parse(json(arg));addReview(j,value);
   }else if(command==='accept'){
     if(!arg)throw Error('Decision JSON required');
     const value=z.object({scope:z.enum(['brief','route','editorial','verification','listening','package']),refs:z.array(refSchema).min(1),reviewIds:z.array(z.string()).min(1)}).strict().parse(json(arg));accept(j,value.scope as Review['scope'],value.refs,value.reviewIds,now());
   }else if(command==='reconcile'){
     if(!arg)throw Error('Reconciliation JSON with operationId, chargedUsd, evidence, retry and usage required');
     const value=z.object({operationId:z.string(),chargedUsd:z.number().nonnegative(),evidence:z.string().min(1),retry:z.boolean(),usage:z.object({inputTokens:z.number().nullable(),outputTokens:z.number().nullable(),subscription:z.boolean(),apiEquivalentUsd:z.number().nullable(),priceDate:z.string().nullable(),uncertainty:z.string().nullable()})}).strict().parse(json(arg));
     reconcile(j,value.operationId,value.chargedUsd,value.usage,value.evidence,value.retry,now());
   }else if(command==='next'){const next=nextStage(j,now());if(next.blockers.length){j.status='awaiting-decision';j.reason=next.blockers.join('; ');}else if(Date.parse(j.deadline)>Date.now()&&!j.costLedger.operations.some(o=>o.state!=='settled')){j.status='running';j.reason='Current prerequisites met; original envelope retained';}print(next);}
   else if(command==='run'){
     if(!arg)throw Error('run needs a task ID or --fixture');
     if(j.status!=='running')throw Error('Job is stopped; preserve checkpoint and inspect the reason. No automatic budget/deadline reset.');
     if(arg==='--fixture'){
       if(j.conditions.mode!=='fixture')throw Error('Fixture adapter cannot silently replace subscription reasoning');
       for(const t of j.tasks.filter(t=>t.execution==='queued'))await runTask(j,path,t.taskId,fixtureReasoner,now);
       finish(j,'blocked','Fixture completed; synthetic evidence and unknown encounter are not a real tour.',now());
     }else {
       if(j.conditions.mode!=='subscription')throw Error('Live reasoning requires an explicitly subscription-mode job');
       const preflightPath=resolve(process.env.TOUR_GENERATION_PREFLIGHT_FILE??'local-data/generation/preflight.json');
       const preflight=existsSync(preflightPath)?json(preflightPath) as CapabilityPreflight&{checkedAt:string;accountBinding?:{clientId:string;validatedAt:number}}:null;
       if(!preflight?.faithfulWorkflowReady||preflight.model!==j.conditions.model||preflight.effort!==j.conditions.effort||!preflight.checkedAt||Date.now()-Date.parse(preflight.checkedAt)>24*3600_000)throw Error('Fresh live T43 capability preflight is required; fixtures do not establish account access');
       const credentials=await loadCredentials('.');
       if(!credentials||preflight.accountBinding?.clientId!==credentials.clientId||preflight.accountBinding?.validatedAt!==credentials.validatedAt)throw Error('Account grant changed; repeat T43 for this sign-in');
       const p=await provider();
       const reasoner:Reasoner={billing:'zero-direct',async run(context){
         const response=await p.request({contextId:context.task.contextId,model:j.conditions.model,effort:j.conditions.effort,
           instructions:context.instructions+'\nReturn only JSON: {records: [], unresolvedQuestions: [], failedAttempts: [], recommendedNextAction: "..."}. Records must follow the supplied authoring schema. Do not emit acceptance decisions.',
           input:[{role:'user',content:JSON.stringify({task:context.task,records:context.records,recordSchema:JSON.parse(readFileSync('fixtures/generation/record-schema.json','utf8'))})}],signal:AbortSignal.timeout(Math.min(context.task.limits.seconds*1000,Math.max(1,Date.parse(j.deadline)-Date.now())))});
         // Save partial output and exact safe diagnostics independently; never treat it as accepted content.
         write(`${path}.returns/${context.task.taskId}.json`,response);
         if(response.status!=='completed')throw Error(`Provider stopped: ${response.diagnostic.code}`);
         const output=outputSchema.parse(JSON.parse(response.text));
         return {...output,usage:{inputTokens:response.usage.inputTokens,outputTokens:response.usage.outputTokens,subscription:true,apiEquivalentUsd:response.estimatedApiEquivalentUsd,priceDate:response.apiEquivalentEstimate?.priceDate??null,uncertainty:(response.apiEquivalentEstimate?.reason??'Estimate unavailable')+' Range USD '+response.apiEquivalentEstimate?.lowerUsd+'–'+response.apiEquivalentEstimate?.upperUsd}};
       }};
       await runTask(j,path,arg,reasoner,now);
     }
   }else if(command==='finish'){
     if(!['blocked','awaiting-decision','cancelled','ready'].includes(arg??''))throw Error('Explicit terminal status required');
     finish(j,arg as 'blocked'|'awaiting-decision'|'cancelled'|'ready','Explicit Producer terminal assessment; inspect current report and reviews',now());
   }else throw Error('Unknown generation command');
   event(j,now(),'cli',command);saveJob(path,j);print(report(j,now()));
 });
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Generation command failed');process.exitCode=1;});
