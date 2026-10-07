/** Deliberately excludes provider output, credentials, full fetched pages and private paths. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJob } from '../store';
import { roleUsage } from '../usage';
import { writeJSON } from './runtime';

export function factoryReport(directory:string,destination:string){
 const job=loadJob(join(directory,'job.json')),usage=roleUsage(job);
 const read=(name:string)=>existsSync(join(directory,name))?JSON.parse(readFileSync(join(directory,name),'utf8')):null;
 const numberedBuilds=readdirSync(directory).filter(n=>/^build-result-\d+\.json$/.test(n)).sort((a,b)=>Number(a.match(/\d+/)![0])-Number(b.match(/\d+/)![0]));
 const buildEvidenceFile=existsSync(join(directory,'build-result.json'))?'build-result.json':numberedBuilds.at(-1);
 const starting=read('starting-inputs.json'),route=read('route-accepted.json'),research=read('research-validated.json'),build=buildEvidenceFile?read(buildEvidenceFile):null,handoff=read('handoff.json');
 const report={schemaVersion:1,recordedAt:new Date().toISOString(),job:{id:job.id,createdAt:job.createdAt,updatedAt:job.updatedAt,deadline:job.deadline,status:job.status,reason:job.reason,counters:job.counters,conditions:job.conditions,events:job.events},startingInputs:starting,
  observed:{survey:read('phases/survey.json'),sourceCount:research?.sources.length??0,claimCount:research?.claims.length??0,sourceReferences:research?.sources.map((s:{id:string;title:string;url:string})=>({id:s.id,title:s.title,url:s.url}))??[],route:route?{plan:route.plan,review:route.review,routeMetres:route.prepared.routeMetres,chapterCount:route.prepared.chapterIds.length}:null,build:build?{evidenceFile:buildEvidenceFile,promotedToFinalBuild:buildEvidenceFile==='build-result.json',timing:build.timing,validation:build.validation?{schemaVersion:build.validation.schemaVersion,checkedAt:build.validation.checkedAt,inputSha256:build.validation.inputSha256,packageSha256:build.validation.packageSha256,recordingCount:build.validation.recordingCount,audioCheckMode:build.validation.audioCheckMode,checks:build.validation.checks}:null,structuralValid:build.structuralValid,listening:build.listening,field:build.field,readyForOrdinaryUse:build.readyForOrdinaryUse}:null,durationAcceptance:handoff?.durationAcceptance??null,phaseOutcomes:['writing','correction-1','correction-2','editor-0','editor-1','editor-2','verification-0','verification-1','verification-2','production-review','navigation-layout-review-0','navigation-layout-review-1','navigation-layout-review-2','tester','package-check-review'].flatMap(id=>{const phase=read('phases/'+id+'.json');return phase?[{id,operationId:phase.operationId,completedAt:phase.completedAt,verdict:phase.result?.verdict??'artifact-produced',requiredIssues:phase.result?.issues?.filter((i:{required:boolean})=>i.required).length??null}]:[];})},usage,
  limitations:['Implementation assistant/helper tokens are unavailable and excluded from runtime totals.','Token-only API-equivalent estimates are not paid subscription charges. Hosted tool fees/parity are not measured.','No human listening or field visit is inferred from software checks.','This report excludes credentials, encrypted provider history and complete fetched page text.']};
 writeJSON(destination,report);return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [directory,destination]=process.argv.slice(2);if(!directory||!destination)throw Error('Usage: report <private-run-directory> <report.json>');factoryReport(directory,destination);
}
