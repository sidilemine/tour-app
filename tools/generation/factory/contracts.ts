import { z } from 'zod';
import { audienceSchema } from '../records';

const text=z.string().min(1), id=z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/);
export const pointSchema=z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180)}).strict();
export const briefSchema=z.object({schemaVersion:z.literal(1),id,area:text,start:text,end:text,durationSeconds:z.number().positive(),mapEvidence:z.object({path:text,sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict().optional(),generationMinutes:z.number().int().min(5).max(90).optional(),access:text,audience:audienceSchema,voice:z.literal('local Kokoro George'),model:z.enum(['gpt-6-astra','gpt-6-sol','gpt-6.1-sol']),effort:z.literal('medium'),directPaidCeilingUsd:z.literal(0),mapId:text,freshContentOnly:z.literal(true),requirements:z.array(text)}).strict();
export type FactoryBrief=z.infer<typeof briefSchema>;
export const surveySchema=z.object({publishedWalks:z.array(z.object({title:text,url:z.url(),stops:z.array(text),themes:z.array(text),stories:z.array(text)}).strict()).min(3).max(8),candidates:z.array(z.object({id,name:text,why:text,leadUrls:z.array(z.url()).min(1)}).strict()).min(5).max(16),gaps:z.array(text)}).strict();
export const researchSchema=z.object({
 sources:z.array(z.object({id,url:z.url(),title:text,origin:text,passage:text.max(650),locator:text}).strict()).min(5).max(24),
 claims:z.array(z.object({id,text,sourceIds:z.array(id).min(1),qualifications:z.array(text)}).strict()).min(8).max(36),
 places:z.array(z.object({candidateId:id,landmark:pointSchema,standing:pointSchema,approach:text,viewpoint:text,access:text,sourceIds:z.array(id).min(1),essentialUnknowns:z.array(text)}).strict()).min(4).max(10),
 rejected:z.array(z.object({candidateId:id,reason:text}).strict()),gaps:z.array(text),
}).strict();
export type Research=z.infer<typeof researchSchema>;
/** Images have observations, not textual quotations. Empty passages need runtime pixel proof. */
export const physicalResearchSchema=researchSchema.extend({sources:z.array(researchSchema.shape.sources.element.extend({passage:z.string().max(650)})).min(5).max(24)}).strict();
export const routePlanSchema=z.object({title:text,stopIds:z.array(id).min(4).max(6),start:pointSchema,end:pointSchema,selectionReason:text,rejectedAlternatives:z.array(text),allowanceSeconds:z.number().min(240).max(900),walkingMetresPerSecond:z.number().min(0.9).max(1.3)}).strict();
export const routingConstraintsSchema=z.object({preferMappedWalkways:z.boolean(),throughByLeg:z.array(z.object({legId:id,points:z.array(z.object({point:pointSchema,sourceUrl:z.url(),basis:text}).strict()).min(1).max(8)}).strict()).max(7)}).strict();
export const constrainedRoutePlanSchema=routePlanSchema.extend({routing:routingConstraintsSchema,walkingNarration:z.enum(['stationary-only','eligible-windows'])});
// New undispatched planning phases expose the router's ordinal contract to structured output.
const ordinalRoutingConstraintsSchema=routingConstraintsSchema.extend({throughByLeg:z.array(routingConstraintsSchema.shape.throughByLeg.element.extend({legId:z.enum(['leg-1','leg-2','leg-3','leg-4','leg-5','leg-6','leg-7']).describe('Ordinal tour leg: leg-1 is station to first stop; final leg is last stop to station. Use only legs present in this plan.')})).max(7)});
export const ordinalRoutePlanSchema=constrainedRoutePlanSchema.extend({routing:ordinalRoutingConstraintsSchema});
export type RoutePlan=z.infer<typeof routePlanSchema>&{routing?:z.infer<typeof routingConstraintsSchema>;walkingNarration?:'stationary-only'|'eligible-windows'};
const paragraph=z.object({text,kind:z.enum(['factual','supported_reconstruction','editorial']),claimIds:z.array(id),basis:text}).strict();
const story=z.object({id,title:text,paragraphs:z.array(paragraph).min(2).max(7),directions:z.array(text).min(1).max(8)}).strict();
export const draftSchema=z.object({description:text,introduction:text,finishInstructions:text,stories:z.array(story).min(4).max(6),chapters:z.array(story).max(2),editorialIntent:text}).strict();
export type Draft=z.infer<typeof draftSchema>;
export const reviewSchema=z.object({verdict:z.enum(['accepted','needs-revision','blocked']),summary:text,issues:z.array(z.object({id,scope:text,required:z.boolean(),problem:text,repair:text,evidence:text}).strict()),checks:z.array(text).min(1)}).strict();
export type FactoryReview=z.infer<typeof reviewSchema>;

export const normalise=(s:string)=>s.normalize('NFKC').replace(/\s+/g,' ').trim();
export function validateResearch(research:Research,survey:z.infer<typeof surveySchema>,pages:Map<string,{text:string}>,observedImages:Map<string,{sha256:string}>=new Map()) {
 const sourceIds=new Set<string>(),claimIds=new Set<string>(),candidateIds=new Set(survey.candidates.map(c=>c.id));
 const quotedWords=new Map<string,number>();
 for(const s of research.sources){
  if(sourceIds.has(s.id))throw Error(`Duplicate source: ${s.id}`); sourceIds.add(s.id);
  const page=pages.get(s.url);
  const passage=normalise(s.passage);
  if(s.passage===''&&/^[a-f0-9]{64}$/i.test(observedImages.get(s.url)?.sha256??''))continue;
  if(!passage||!page||!normalise(page.text).includes(passage))throw Error(`Supporting passage not present in retrieved page: ${s.id}`);
  const words=(quotedWords.get(s.url)??0)+passage.split(' ').length;quotedWords.set(s.url,words);
  if(words>25)throw Error(`Retain at most 25 quoted words per source URL: ${s.id}`);
 }
 for(const c of research.claims){
  if(claimIds.has(c.id)||c.sourceIds.some(id=>!sourceIds.has(id)))throw Error(`Invalid claim references: ${c.id}`);claimIds.add(c.id);
 }
 const places=new Set<string>();
 for(const p of research.places){
  if(places.has(p.candidateId)||!candidateIds.has(p.candidateId)||p.sourceIds.some(id=>!sourceIds.has(id)))throw Error(`Invalid place: ${p.candidateId}`);
  places.add(p.candidateId);
 }
}
/** Legacy fixtures may declare literal strings; factory research carries semantic review instructions. */
export function validateDraft(draft:Draft,research:Research,plan:RoutePlan,chapterIds:string[],qualificationMode:'literal'|'semantic-review'='literal') {
 if(JSON.stringify(draft.stories.map(s=>s.id))!==JSON.stringify(plan.stopIds))throw Error('Story order must match selected stops');
 if(JSON.stringify(draft.chapters.map(s=>s.id))!==JSON.stringify(chapterIds))throw Error('Chapter identities must match supplied safe windows');
 const claims=new Map(research.claims.map(c=>[c.id,c]));
 for(const s of [...draft.stories,...draft.chapters])for(const p of s.paragraphs){
  if(p.text.trim()!==p.text||/\n\s*\n/.test(p.text))throw Error('Each paragraph must be one clean paragraph');
  if(p.kind!=='editorial'&&!p.claimIds.length)throw Error(`Unlinked factual paragraph: ${s.id}`);
  for(const id of p.claimIds){const c=claims.get(id);if(!c)throw Error(`Missing claim ${id}`);if(qualificationMode==='literal')for(const q of c.qualifications)if(!p.text.includes(q))throw Error(`Dropped exact qualification: ${q}`);}
 }
}
/** Keep failed discovery leads outside successful evidence, without removing a depended-on source. */
export function excludeUnusedEmptySources(research:Research,observedImages:Map<string,{sha256:string}>) {
 const referenced=new Set([...research.claims.flatMap(c=>c.sourceIds),...research.places.flatMap(p=>p.sourceIds)]);
 const excludedSources=research.sources.filter(s=>s.passage===''&&!observedImages.has(s.url)&&!referenced.has(s.id));
 const excludedIds=new Set(excludedSources.map(s=>s.id));
 return {research:{...research,sources:research.sources.filter(s=>!excludedIds.has(s.id))},excludedSources};
}
export function reviewPasses(review:FactoryReview){return review.verdict==='accepted'&&!review.issues.some(i=>i.required);}
