import { Job, RecordItem, Role, Task, ref } from './records';
import { addTask, createJob, putRecord } from './engine';
export const fixtureTime='2026-10-06T12:00:00.000Z';
export const audience={reason:'An ordinary livelihood behind an overlooked exterior',assumedKnowledge:'Little neighbourhood knowledge; familiar with buying flowers',intendedDiscovery:'Charitable sales had a documented qualification',presentAnchor:'Public exterior; interior not promised'};
export function record(id:string,kind:RecordItem['kind'],data:unknown,dependsOn:RecordItem[]=[]):RecordItem {
  return {id,kind,revision:1,owner:'fixture',createdAt:fixtureTime,updatedAt:fixtureTime,dependsOn:dependsOn.map(ref),data} as RecordItem;
}
export function fixtureJob():Job {
  const j=createJob('minimal-handoff',fixtureTime);
  const b=putRecord(j,record('brief','brief',{originalRequest:'Synthetic handoff only, not actual school facts',requirements:['Keep endpoints and qualified evidence'],preferences:['Ordinary lives'],assumptions:['Daytime'],delegation:['Routine selection'],endpoints:['Farringdon Cowcross entrance','Farringdon Cowcross entrance'],area:'Clerkenwell',researchExtent:'Clerkenwell and bordering evidence',routeExtent:'Clerkenwell public streets',durationSeconds:3600,audience,access:'Public exterior only',date:'Daytime; date unspecified'}),fixtureTime);
  const s=putRecord(j,record('source','source',{url:'https://example.org/fixture',title:'Synthetic qualified evidence',origin:'Fixture, not historical evidence',publishedOn:null,retrievedAt:fixtureTime,passage:'The account says some workers received support.',locator:'Fixture sentence 1',retention:'minimal-passage',attribution:'Synthetic fixture',exportAllowed:true}),fixtureTime);
  const c=putRecord(j,record('claim','claim',{proposition:'Some workers received support, according to the account.',qualifications:['according to the account'],sourceRefs:[ref(s)],status:'supported-with-qualification',scope:'Synthetic account, not universal provision'},[s]),fixtureTime);
  const e=putRecord(j,record('encounter','encounter',{landmark:{value:{latitude:51.52,longitude:-0.1},reason:null},visitor:{value:null,reason:'Pavement view has not been established'},camera:{value:null,reason:'No imagery supplied'},approach:'Unverified',intendedView:'Exterior only',captureDate:null,checkedAt:fixtureTime,state:'unverified',observations:[],interpretations:[],conditions:[],unknowns:['Visitor position'],evidenceRefs:[]}),fixtureTime);
  const candidate=putRecord(j,record('candidate','candidate',{name:'Synthetic stop',landmark:e.data && (e.kind==='encounter'?e.data.landmark:null),audience,disposition:'proposed',rationale:'Tests rationale continuity',alternatives:[]},[b,c]),fixtureTime);
  const script=putRecord(j,record('script','script',{audience,transcript:'Some workers received support, according to the account.',narrationWindowSeconds:90,assertions:[{text:'Some workers received support, according to the account.',kind:'factual',evidenceRefs:[ref(c)],qualifications:['according to the account']}],pronunciation:[],delivery:'Warm documentary; no fictitious memory'},[b,c,candidate]),fixtureTime);
  // History remains usable while the physical encounter is unresolved.
  addTask(j,task('research-initial','research',[b,s,c], 'Return the existing qualified claim with its evidence; do not invent the missing scene.'),fixtureTime);
  addTask(j,task('scout-initial','scout',[b,e], 'Return the missing visitor-position question; do not replace it with the landmark.'),fixtureTime);
  addTask(j,task('editor-initial','editor',[b,script], 'Assess this frozen synthetic passage; retain its qualifier.'),fixtureTime);
  return j;
}
export function task(id:string,role:Role,records:RecordItem[],purpose:string):Task {
 return {taskId:id,role,purpose,scope:'Only named records',inputRefs:records.map(ref),audienceContext:audience,allowedDecisions:['Propose scoped output'],toolPermissions:[],limits:{seconds:60},expectedOutput:'Typed records, unresolved questions and next action',completionCondition:'Return evidence-supported findings or explicit gap',recipient:'planner-producer',contextId:`context-${id}`,execution:'queued'};
}
export const fixtureReasoner={billing:'zero-direct' as const,async run({task:t}:{task:Task}) {return {records:[],unresolvedQuestions:t.role==='scout'?['Visitor position remains unknown']:[],failedAttempts:[],recommendedNextAction:t.role==='scout'?'Obtain physical evidence before directions':'Producer reviews returned work separately',usage:{inputTokens:null,outputTokens:null,subscription:false,apiEquivalentUsd:null,priceDate:null,uncertainty:'Deterministic fixture; no model dispatched'}};}};
