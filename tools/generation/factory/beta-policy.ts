import { z } from 'zod';
import { surveySchema, physicalResearchSchema, ordinalRoutePlanSchema, draftSchema, reviewSchema, type FactoryReview, type Draft } from './contracts';

// Counts guide authoring, rather than forcing extra discoveries or thin stops.
export const betaSurveySchema = surveySchema.extend({
  publishedWalks: z.array(surveySchema.shape.publishedWalks.element).max(4),
  candidates: z.array(surveySchema.shape.candidates.element).min(3).max(10),
});
export const betaResearchSchema = physicalResearchSchema.extend({
  sources: z.array(physicalResearchSchema.shape.sources.element).min(1).max(24),
  claims: z.array(physicalResearchSchema.shape.claims.element).min(1).max(36),
  places: z.array(physicalResearchSchema.shape.places.element).min(3).max(10),
});
export const betaRoutePlanSchema = ordinalRoutePlanSchema.extend({ stopIds: z.array(ordinalRoutePlanSchema.shape.stopIds.element).min(3).max(6) });
const betaStory = draftSchema.shape.stories.element.extend({
  paragraphs: z.array(draftSchema.shape.stories.element.shape.paragraphs.element).min(1).max(10),
  directions: z.array(z.string().min(1)).min(1).max(20),
});
export const betaDraftSchema = draftSchema.extend({ stories: z.array(betaStory).min(3).max(6), chapters: z.array(betaStory).max(2) });
export const betaReviewSchema = reviewSchema.extend({
  issues: z.array(reviewSchema.shape.issues.element.extend({
    category: z.enum(['access', 'directions', 'factual', 'package', 'editorial', 'duration']),
  })),
});
export type BetaReview = z.infer<typeof betaReviewSchema>;
export const betaDirectionsSchema = z.object({
  review: betaReviewSchema,
  legDirections: z.array(z.object({ legId: z.string(), directions: z.array(z.string().min(1).max(1500)).min(1).max(20) }).strict()).max(7),
}).strict();

export const BETA_REVIEW_POLICY = ' Personal beta policy: preserve a usable tour. Duration, stop/story/source counts, stylistic preferences, imperfect imagery and ordinary on-the-day conditions are advisory, never whole-tour vetoes. Use category editorial or duration for those issues even if suggesting a change. Required issues are concrete unavailable/private access, wrong or contradictory operational directions, materially unsupported/misleading historical assertions, or broken required package data. Name the exact affected element and smallest repair. An incidental unsupported detail should be omitted or qualified, not provoke new general research. Normal crossing checks and posted conditions are sufficient; no field certification or exact kerb geometry is required. Human listening and ordinary use are later feedback, not prerequisites for completing generation. A negative verdict without a concrete required issue is advice, not a veto.';

/** Keep the original review in its phase artifact; only consequential issues veto use. */
export function betaReviewDisposition(review: BetaReview): FactoryReview {
  const issues = review.issues.map(issue => ({ ...issue,
    required: issue.required && issue.category !== 'editorial' && issue.category !== 'duration',
  }));
  return { ...review, issues, verdict: issues.some(issue => issue.required) ? 'needs-revision' : 'accepted' };
}

/** Avoid duplicating the same map geometry as both text and structured elements. */
export function compactMapResult<T extends { text: string; elements?: unknown; query?: unknown; cachePath?: unknown }>(result: T) {
  const { elements: _elements, query: _query, cachePath: _cachePath, ...compact } = result;
  return compact;
}

export function betaDurationNote(requestedSeconds: number, estimatedSeconds: number) {
  return { status: 'reported-estimate', requestedSeconds, estimatedSeconds,
    differenceSeconds: estimatedSeconds - requestedSeconds,
    note: 'Estimated ' + Math.round(estimatedSeconds / 60) + ' minutes against requested ' + Math.round(requestedSeconds / 60) + ' minutes, using actual rendered audio plus estimated walking and looking/crossing allowance. Duration is advisory; no visitor walking time was measured.' };
}

/** Renderer paragraph layout is a local formatting concern, not a writing rejection. */
export function formatBetaNarration(draft: Draft): Draft {
  const story = (value: Draft['stories'][number]) => ({ ...value, paragraphs: value.paragraphs.flatMap(paragraph => {
    const chunks: string[] = []; let remaining = paragraph.text;
    while (remaining.length > 512) {
      const prefix = remaining.slice(0, 512);
      let boundary = prefix.lastIndexOf('. ') + 1;
      if (boundary < 128) boundary = prefix.lastIndexOf(' ');
      if (boundary <= 0) throw Error('Narration contains a word exceeding the renderer paragraph limit');
      chunks.push(remaining.slice(0, boundary).trimEnd()); remaining = remaining.slice(boundary).trimStart();
    }
    chunks.push(remaining);
    if (chunks.join(' ').replace(/\s+/g, ' ') !== paragraph.text.replace(/\s+/g, ' ')) throw Error('Narration formatting changed words');
    return chunks.map(text => ({ ...paragraph, text }));
  }) });
  return { ...draft, stories: draft.stories.map(story), chapters: draft.chapters.map(story) };
}
