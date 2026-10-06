import type { Job, Usage } from './records';
import { ASTRA_API_PRICE_QUOTE, DEFAULT_API_PRICE_QUOTE, type ProviderResult } from './provider';

export function measuredUsage(result:ProviderResult):Usage {
 const u=result.usage,e=result.apiEquivalentEstimate;
 return {inputTokens:u.inputTokens,outputTokens:u.outputTokens,cachedInputTokens:u.cachedInputTokens??null,reasoningTokens:u.reasoningTokens??null,totalTokens:u.totalTokens,subscription:result.status!=='blocked',apiEquivalentUsd:result.estimatedApiEquivalentUsd,apiEquivalentRangeUsd:e?.lowerUsd!=null&&e.upperUsd!=null?{lower:e.lowerUsd,upper:e.upperUsd}:null,priceDate:e?.priceDate??null,uncertainty:e?.reason??'Usage unavailable'};
}

// Backfill estimates from previously observed counts, never backfill missing usage.
export function astraEstimate(usage:Usage) {
 const q=ASTRA_API_PRICE_QUOTE,i=usage.inputTokens,o=usage.outputTokens,c=usage.cachedInputTokens;
 if(i===null||o===null)return null;
 const long=i>q.longContextThreshold!,factor=long?2:1,output=o*q.outputPerMillionUsd*(long?1.5:1)/1e6;
 const cacheKnown=c!=null&&c<=i;
 const lower=output+(cacheKnown?((i-c)*q.inputPerMillionUsd+c*q.cachedInputPerMillionUsd):i*q.cachedInputPerMillionUsd)*factor/1e6;
 const upper=output+(cacheKnown?((i-c)*q.cacheWritePerMillionUsd!+c*q.cachedInputPerMillionUsd):i*q.cacheWritePerMillionUsd!)*factor/1e6;
 return {lower,upper};
}

export function roleUsage(j:Job) {
 const rows=j.costLedger.operations.map(o=>{
  const t=j.tasks.find(t=>t.taskId===o.taskId),u=o.usage;
  return {operationId:o.id,taskId:o.taskId,role:t?.role??o.stage,stage:o.stage,state:o.state,failure:o.failure??null,directChargedUsd:o.chargedUsd,activeSeconds:o.activeSeconds??null,inputTokens:u?.inputTokens??null,outputTokens:u?.outputTokens??null,cachedInputTokens:u?.cachedInputTokens??null,reasoningTokens:u?.reasoningTokens??null,totalTokens:u?.totalTokens??(u?.inputTokens!=null&&u?.outputTokens!=null?u.inputTokens+u.outputTokens:null),apiEquivalentRangeUsd:u?.apiEquivalentRangeUsd??(u&&j.conditions.model==='gpt-6-astra'?astraEstimate(u):null),usageUncertainty:u?.uncertainty??'Usage unavailable'};
 });
 const byRole=[...new Set(rows.map(r=>r.role))].map(role=>{
  const own=rows.filter(r=>r.role===role),known=own.filter(r=>r.inputTokens!==null&&r.outputTokens!==null);
  return {role,operations:own.length,operationsWithUnknownTokens:own.length-known.length,observedInputTokens:own.reduce((s,r)=>s+(r.inputTokens??0),0),operationsWithUnknownInput:own.filter(r=>r.inputTokens===null).length,observedOutputTokens:own.reduce((s,r)=>s+(r.outputTokens??0),0),operationsWithUnknownOutput:own.filter(r=>r.outputTokens===null).length,observedCachedInputTokens:own.reduce((s,r)=>s+(r.cachedInputTokens??0),0),operationsWithUnknownCache:own.filter(r=>r.cachedInputTokens===null).length,observedReasoningTokens:own.reduce((s,r)=>s+(r.reasoningTokens??0),0),operationsWithUnknownReasoning:own.filter(r=>r.reasoningTokens===null).length,operationsWithUnknownCharge:own.filter(r=>r.directChargedUsd===null).length,directChargedUsd:own.reduce((s,r)=>s+(r.directChargedUsd??0),0),observedApiEquivalentRangeUsd:{lower:own.reduce((s,r)=>s+(r.apiEquivalentRangeUsd?.lower??0),0),upper:own.reduce((s,r)=>s+(r.apiEquivalentRangeUsd?.upper??0),0)},operationsWithoutEstimate:own.filter(r=>!r.apiEquivalentRangeUsd).length};
 });
 return {model:j.conditions.model,effort:j.conditions.effort,rows,byRole,estimateBasis:j.conditions.model===ASTRA_API_PRICE_QUOTE.model?ASTRA_API_PRICE_QUOTE:j.conditions.model===DEFAULT_API_PRICE_QUOTE.model?DEFAULT_API_PRICE_QUOTE:null,limitations:'Reasoning tokens are included in output, never added again. Standard token-only API-equivalent range; cache writes, tools, taxes and subscription/API parity are uncertain. Unknown requests are excluded from observed subtotals, never treated as free or zero-token.'};
}
