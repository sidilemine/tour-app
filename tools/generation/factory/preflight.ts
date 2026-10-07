/** One separately budgeted calibration; never imports tour inputs or changes the five T43 checks. */
import { createHash } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createJob, reserve, settle } from '../engine';
import { SubscriptionProvider, type ProviderResult } from '../provider';
import { CredentialRenewalError, loadOverflowEvidence, renewCredentials } from '../signin';
import { saveJob, withJobLock } from '../store';
import { measuredUsage } from '../usage';

export const SEARCH_CALIBRATION = {
 model: 'gpt-6-astra', effort: 'medium', contextId: 'factory-hosted-search-calibration-v1',
 instructions: 'This is a capability calibration, not tour research. Use hosted web search to find the official Valhalla pedestrian routing API documentation. Return its title, URL, and one short sentence describing the source, with a citation. Keep the answer under 80 words. Do not invent a tool result or claim access without actually searching.',
 input: [{role:'user',content:'Search the official Valhalla documentation for pedestrian routing.'}],
 webSearch: {allowedDomains:['valhalla.github.io'],searchContextSize:'low' as const},
};
function privateArtifact(filename:string,value:unknown) {
 const fd=openSync(filename,'wx',0o600);
 try {writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fsyncSync(fd);}finally{closeSync(fd);}
}
export interface SearchCalibrationSummary {
 schemaVersion:1;
 startedAt:string;
 completedAt:string;
 model:string;
 effort:string;
 contextId:string;
 promptHash:string;
 status:'passed'|'fixture-passed'|'blocked'|'failed'|'interrupted';
 evidenceKind:'live'|'fixture'|'not-dispatched';
 hostedSearchObserved:boolean;
 completedSearchCalls:number;
 observedSources:number;
 diagnosticCode:string;
 directChargeUsd:0;
 usage:ProviderResult['usage']|null;
 apiEquivalentEstimate:ProviderResult['apiEquivalentEstimate']|null;
 operationId:string|null;
 accountBinding?:{clientId:string;validatedAt:number};
 limits:{requests:1;directPaidCeilingUsd:0;requestTimeoutMs:120000};
 limitations:string;
}
/** Injected fetch always produces fixture evidence. The CLI does not expose injection. */
export async function runFactoryPreflight(directory:string,options:{root?:string;fetch?:typeof fetch;now?:()=>number;model?:'gpt-6-astra'|'gpt-6-sol'|'gpt-6.1-sol'}={}):Promise<SearchCalibrationSummary> {
 if(options.model!==undefined&&!['gpt-6-astra','gpt-6-sol','gpt-6.1-sol'].includes(options.model))throw Error('Unsupported calibration model');
 const calibration={...SEARCH_CALIBRATION,model:options.model??SEARCH_CALIBRATION.model};
 const promptHash=createHash('sha256').update(JSON.stringify(calibration)).digest('hex');
 const output=resolve(directory),root=resolve(options.root??'.'),clock=options.now??Date.now;
 mkdirSync(output,{recursive:true,mode:0o700});
 const ledgerPath=resolve(output,'calibration-ledger.json');
 return withJobLock(ledgerPath,async()=>{
  if(existsSync(ledgerPath)||existsSync(resolve(output,'summary.json'))||existsSync(resolve(output,'provider-return.json')))throw Error('Calibration directory already used; retain this attempt and choose an explicitly separate calibration directory.');
  const iso=()=>new Date(clock()).toISOString(),startedAt=iso();
  const j=createJob('factory-hosted-search-calibration',startedAt,options.fetch?'fixture':'subscription');
  j.conditions.model=calibration.model;j.conditions.effort=SEARCH_CALIBRATION.effort;
  j.conditions.promptHashes.calibration=promptHash;j.conditions.tools=['web_search'];
  j.deadline=new Date(clock()+240_000).toISOString();
  j.tasks.push({taskId:'hosted-search-probe',role:'tester',purpose:'Observe hosted search policy support',scope:'One generic official-documentation search, no tour inputs',inputRefs:[],audienceContext:{reason:'Calibrate hosted search',assumedKnowledge:'No tour facts supplied',intendedDiscovery:'An actual official documentation search result',presentAnchor:'None; technical calibration'},allowedDecisions:['Return observed capability only'],toolPermissions:['web_search'],limits:{seconds:120},expectedOutput:'Completed hosted search call and explicit sources, or actual failure',completionCondition:'Terminal completed SSE and completed search action',recipient:'planner-producer',contextId:SEARCH_CALIBRATION.contextId,execution:'queued'});
  saveJob(ledgerPath,j);
  const summary:SearchCalibrationSummary={schemaVersion:1,startedAt,completedAt:startedAt,model:calibration.model,effort:SEARCH_CALIBRATION.effort,contextId:SEARCH_CALIBRATION.contextId,promptHash,status:'blocked',evidenceKind:'not-dispatched',hostedSearchObserved:false,completedSearchCalls:0,observedSources:0,diagnosticCode:'not_dispatched',directChargeUsd:0,usage:null,apiEquivalentEstimate:null,operationId:null,limits:{requests:1,directPaidCeilingUsd:0,requestTimeoutMs:120_000},limitations:'Separate calibration only. Does not establish T43, source passage entailment, tour quality, physical access, or a completed factory. API-equivalent estimates are token-only and exclude uncertain hosted-tool charges; direct usage stays on the overflow-disabled plan route.'};
  try {
   const credentials=await renewCredentials(root,{fetch:options.fetch,now:clock});
   const overflowEvidence=await loadOverflowEvidence(root);
   if(credentials)summary.accountBinding={clientId:credentials.clientId,validatedAt:credentials.validatedAt};
   const provider=new SubscriptionProvider({credentials,overflowEvidence,fetch:options.fetch,now:clock,timeoutMs:120_000});
   const operationId=reserve(j,'hosted-search-probe','hosted-search-calibration',0,iso());
   summary.operationId=operationId;saveJob(ledgerPath,j);
   const result=await provider.request({...calibration,signal:AbortSignal.timeout(120_000)});
   // Settle observed usage before any artifact processing; malformed evidence cannot erase it.
   settle(j,operationId,0,measuredUsage(result),iso(),result.status==='completed'?undefined:result.diagnostic.code);
   saveJob(ledgerPath,j);
   summary.evidenceKind=result.evidenceKind;summary.usage=result.usage;summary.apiEquivalentEstimate=result.apiEquivalentEstimate??null;
   summary.completedSearchCalls=(result.webSearchCalls??[]).filter(call=>call.status==='completed'&&call.action.type==='search').length;
   summary.observedSources=(result.sources??[]).length;
   summary.hostedSearchObserved=result.status==='completed'&&summary.completedSearchCalls>0&&summary.observedSources>0;
   summary.status=summary.hostedSearchObserved?(result.evidenceKind==='live'?'passed':'fixture-passed'):result.status==='blocked'?'blocked':result.status==='interrupted'?'interrupted':'failed';
   summary.diagnosticCode=summary.hostedSearchObserved?'completed_hosted_search_observed':result.status==='completed'?'completed_without_observed_search_and_sources':result.diagnostic.code;
   privateArtifact(resolve(output,'provider-return.json'),result);
   j.tasks[0].execution=summary.hostedSearchObserved?'returned':'blocked';
  }catch(error){
   const operation=j.costLedger.operations.find(o=>o.id===summary.operationId);
   if(operation?.state==='pending')operation.state='unknown';
   summary.status=operation?.state==='unknown'?'interrupted':'blocked';
   summary.diagnosticCode=error instanceof CredentialRenewalError?error.code:'calibration_local_or_transport_failure';
   j.tasks[0].execution='blocked';
  }
  summary.completedAt=iso();j.status='blocked';j.reason=`Calibration terminal outcome: ${summary.status}; no tour or factory acceptance implied.`;
  saveJob(ledgerPath,j);privateArtifact(resolve(output,'summary.json'),summary);
  return summary;
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const directory=process.argv[2];
 if(!directory){console.error('Usage: npx tsx tools/generation/factory/preflight.ts <private-calibration-output-dir>');process.exitCode=1;}
 else void runFactoryPreflight(directory,{model:process.argv[3] as 'gpt-6-astra'|'gpt-6-sol'|'gpt-6.1-sol'|undefined}).then(summary=>{console.log(JSON.stringify(summary,null,2));if(summary.status!=='passed')process.exitCode=1;}).catch(()=>{console.error('Calibration could not start or persist safely. Preserve existing artifacts; inspect the selected local output directory.');process.exitCode=1;});
}
