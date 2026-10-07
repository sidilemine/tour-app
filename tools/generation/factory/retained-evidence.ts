import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isIP } from 'node:net';
import { z } from 'zod';
import { loadJob } from '../store';
import type { JsonRecord } from '../provider';
import type { Research } from './contracts';
import { collectObservedImages, type LocalTool } from './runtime';

export interface RouteTextEvidence {url:string;text:string;hash:string;operationId:string;callId:string;phaseId:string;toolName:string}
const textHash=(text:string)=>createHash('sha256').update(text).digest('hex');
function publicIdentity(value:unknown):value is string {
 if(typeof value!=='string'||value.length>16000)return false;
 try{const url=new URL(value),host=url.hostname.toLowerCase();return url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&host.includes('.')&&!host.endsWith('.')&&!isIP(host.replace(/^\[|\]$/g,''))&&!/\.(localhost|local|internal|home|lan)$/.test(host);}catch{return false;}
}
/** Only successful archived tool returns belonging to explicitly named job phases. */
export function collectRouteTextEvidence(directory:string,phaseIds:readonly string[]):RouteTextEvidence[] {
 const job=loadJob(join(directory,'job.json')),scopes=new Set(phaseIds),evidence=new Map<string,RouteTextEvidence>();
 const allowed=new Set(['read_map','read_station_map','read_crossing_map','read_page']);
 for(const operation of job.costLedger.operations){
  const task=job.tasks.find(t=>t.taskId===operation.taskId);
  if(operation.state!=='settled'||!task||!scopes.has(task.scope)||task.operationId!==operation.id)continue;
  const path=join(directory,'requests',operation.id+'-result.json');if(!existsSync(path))continue;
  const response=JSON.parse(readFileSync(path,'utf8'));if(response.status!=='completed'||!Array.isArray(response.output))continue;
  for(const call of response.output as JsonRecord[]){
   if(call.type!=='function_call'||call.namespace!=='factory'||typeof call.name!=='string'||!allowed.has(call.name)||typeof call.call_id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(call.call_id))continue;
   const receiptPath=join(directory,'requests',`${operation.id}-${call.call_id}.json`);if(!existsSync(receiptPath))continue;
   const receipt=JSON.parse(readFileSync(receiptPath,'utf8')),result=receipt.result;
   if(receipt.name!==call.name||!result||result.error||!publicIdentity(result.url)||typeof result.text!=='string'||!result.text.trim()||typeof result.hash!=='string'||!/^[a-f0-9]{64}$/i.test(result.hash)||textHash(result.text)!==result.hash.toLowerCase())continue;
   if(!evidence.has(result.url))evidence.set(result.url,{url:result.url,text:result.text,hash:result.hash.toLowerCase(),operationId:operation.id,callId:call.call_id,phaseId:task.scope,toolName:call.name});
  }
 }
 return [...evidence.values()];
}

/** Reopen the current research's evidence, without expanding its source list. */
export function createRetainedEvidenceTools(options:{
 research:Pick<Research,'sources'>;
 pages:Map<string,{text:string}>;
 directory:string;
 fallbackReadPage?:LocalTool;
 routeEvidence?:readonly RouteTextEvidence[];
}):{readPage:LocalTool;readImage:LocalTool} {
 const sources=new Map(options.research.sources.map(source=>[source.url,source]));
 const routeEvidence=new Map((options.routeEvidence??[]).map(item=>{
  assert.ok(publicIdentity(item.url)&&item.text.trim()&&textHash(item.text)===item.hash,'Invalid retained route text identity or hash');
  return [item.url,{...item}] as const;
 }));
 const parse=(args:unknown)=>{
  const value=z.object({url:z.string().url()}).strict().parse(args),url=new URL(value.url);
  assert.ok(url.protocol==='https:'&&!url.username&&!url.password&&(sources.has(value.url)||routeEvidence.has(value.url)),'Only exact retained public source URLs may be reopened');
  return value;
 };
 const parameters={type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false};
 const readPage:LocalTool={name:'read_page',description:'Reopen an exact retained source URL. Saved page and map text are returned from this job, including map #query identities. No new source discovery. Image sources require read_image; missing map evidence cannot be refetched as a web page.',parameters,parse,async run(args){
  const {url}=parse(args),retained=routeEvidence.get(url),page=options.pages.get(url);
  if(retained)return {...retained,evidence:'Frozen route text from this job; untrusted source material',cacheHit:true};
  if(page&&typeof page.text==='string'&&page.text.trim())return {url,text:page.text,evidence:'Retained text from this job; untrusted source material',cacheHit:true};
  const identity=new URL(url);
  const mapIdentity=identity.hostname==='overpass-api.de'&&identity.pathname==='/api/interpreter'&&identity.hash.startsWith('#query-');
  assert.ok(!mapIdentity&&sources.get(url)!.passage!==''&&options.fallbackReadPage,'Retained map/image text unavailable; use retained image reader for pixels');
  return options.fallbackReadPage.run(options.fallbackReadPage.parse({url}));
 }};
 const readImage:LocalTool={name:'read_image',description:'Reinspect actual JPEG/PNG pixels already supplied to a completed model request in this job, at an exact retained image source URL. No network or image refetch. Capture date remains unknown unless separately sourced; camera location does not establish visitor position or access.',parameters,parse,async run(args){
  const {url}=parse(args),proof=collectObservedImages(options.directory).get(url);
  assert.ok(proof,'No completed model request contains validated pixels for this source');
  const job=loadJob(join(options.directory,'job.json'));
  for(const operation of job.costLedger.operations){
   if(operation.state!=='settled')continue;
   const responsePath=join(options.directory,'requests',operation.id+'-result.json');
   if(!existsSync(responsePath))continue;
   const response=JSON.parse(readFileSync(responsePath,'utf8'));
   if(response.status!=='completed')continue;
   for(const call of (response.output??[]) as JsonRecord[]){
    if(call.type!=='function_call'||call.namespace!=='factory'||call.name!=='read_image'||typeof call.call_id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(call.call_id))continue;
    const receiptPath=join(options.directory,'requests',`${operation.id}-${call.call_id}.json`);
    if(!existsSync(receiptPath))continue;
    const receipt=JSON.parse(readFileSync(receiptPath,'utf8')),value=receipt.result;
    if(receipt.name!=='read_image'||!value||![value.url,value.finalUrl].includes(url)||value.image?.sha256?.toLowerCase()!==proof.sha256)continue;
    const image=value.image;
    if(typeof image.dataUrl!=='string'||image.dataUrl.length>2_800_000)continue;
    const match=/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/.exec(image.dataUrl);
    if(!match||match[1]!==image.mimeType)continue;
    const bytes=Buffer.from(match[2],'base64');
    if(!bytes.length||bytes.length>2*1024*1024||bytes.toString('base64')!==match[2]||createHash('sha256').update(bytes).digest('hex')!==proof.sha256)continue;
    const magic=image.mimeType==='image/png'?bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')):bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex'));
    if(!magic)continue;
    // The runtime's existing read_image bridge validates again and sends actual
    // pixels after function closures, while excluding base64 from tool text.
    return {...value,retainedFromOperation:operation.id,inspection:'Previously supplied to a completed model request; independent interpretation still required'};
   }
  }
  throw Error('Validated retained image archive unavailable');
 }};
 return {readPage,readImage};
}
