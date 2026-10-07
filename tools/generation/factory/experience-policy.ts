/** Authoring estimates, not promises about a particular visitor's walking speed. */
export function durationBudget(targetSeconds:number,walkingSeconds:number,allowanceSeconds:number,stopCount:number,conservative=false){
 const toleranceSeconds=Math.min(300,targetSeconds*0.1);
 const minimumSeconds=targetSeconds-toleranceSeconds,maximumSeconds=targetSeconds+toleranceSeconds;
 const baseSeconds=walkingSeconds+allowanceSeconds;
 const minimumNarrationSeconds=stopCount*80,maximumNarrationSeconds=stopCount*180;
 const targetNarrationSeconds=Math.max(minimumNarrationSeconds,Math.min(maximumNarrationSeconds,targetSeconds-baseSeconds));
 return {targetSeconds,toleranceSeconds,minimumSeconds,maximumSeconds,baseSeconds,minimumNarrationSeconds,maximumNarrationSeconds,targetNarrationSeconds,
  targetWordsPerStory:Math.round(targetNarrationSeconds*(conservative?2.3:1.8)/stopCount),
  ...(conservative?{routeNarrationReserveSeconds:minimumNarrationSeconds,estimatedWordsPerSecond:2.3}:{}),
  routeFeasible:baseSeconds+(conservative?minimumNarrationSeconds:maximumNarrationSeconds)>=minimumSeconds&&baseSeconds+minimumNarrationSeconds<=maximumSeconds};
}
export function durationFits(totalSeconds:number,budget:ReturnType<typeof durationBudget>){return Number.isFinite(totalSeconds)&&totalSeconds>=budget.minimumSeconds&&totalSeconds<=budget.maximumSeconds;}
export const PRACTICAL_ACCESS_POLICY=' Current owner policy supersedes any stricter geometry requirement above: a reliably identified relevant crossing, plausible public approaches and intelligible onward direction are sufficient to say cross here. Do not require metre-by-metre kerb/island geometry or full separately mapped sidewalk connectors. A road-centreline routing abstraction, missing sidewalk tag or partial crossing geometry alone is not a blocker. Use plain street/path directions; never instruct walking along a road centreline or invent a crossing. Do not force a crossing when the route can stay on the same side. Inspect imagery only to resolve a concrete consequential ambiguity, not as a mandatory certificate for each ordinary public exterior. Still block wrong crossing identity, a conflicting direction, genuinely unresolved public access, private/closed paths or a required unsupported viewpoint. Ordinary traffic checks, temporary obstructions and posted access conditions belong in concise on-the-day instructions. This is desk evidence, never a field safety guarantee.';

export const REVIEW_CONTRACT=' Review output contract: accepted means no unresolved required issue remains in the exact returned proposal. Put resolved historical findings in checks, not in issues with required:true. The producer retains original negative reviews separately. Returned legDirections are atomically compiled by the producer before use; their pending installation is not itself an unresolved route defect. Do not accept a real unresolved access, factual or direction contradiction. Future rendering/listening/field observations remain explicit later gates, not completed evidence.';
