import assert from 'node:assert/strict';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { count, event, finish } from '../engine';
import { buildTour, type BuilderInput, type BuildResult } from '../builder';
import { validateDraft, reviewPasses, type FactoryBrief, type Research, type RoutePlan, type Draft, type FactoryReview } from './contracts';
import { betaDraftSchema, betaDirectionsSchema, betaReviewSchema, betaReviewDisposition, betaDurationNote, formatBetaNarration, BETA_REVIEW_POLICY, type BetaReview } from './beta-policy';
import { FactoryRuntime, digest, writeJSON, type LocalTool } from './runtime';
import { checkPackageForHandoff } from './package-checks';
import { collectRouteTextEvidence, createRetainedEvidenceTools } from './retained-evidence';
import type { PreparedRoute } from './pipeline';

interface ProductionOptions {
  runtime: FactoryRuntime; brief: FactoryBrief; research: Research; plan: RoutePlan; prepared: PreparedRoute; routeReview: FactoryReview;
  pages: Map<string, { text: string }>; readTool: LocalTool;
  compile: (draft: Draft, prepared: PreparedRoute, version: number) => BuilderInput;
  build?: typeof buildTour;
}

/** One combined review and at most one content repair, with local package checks. */
export async function produceBetaTour(options: ProductionOptions) {
  const { runtime, brief, research, plan, pages, readTool, compile } = options;
  let prepared = options.prepared;
  const consume = (kind: 'correction', key: string) => {
    if (runtime.job.events.some(e => e.type === 'factory-allowance' && e.detail === key)) return;
    count(runtime.job, kind, runtime.now()); event(runtime.job, runtime.now(), 'factory-allowance', key); runtime.save();
  };
  const selected = new Set(plan.stopIds);
  const format = (value: Draft, revision: number) => {
    const formatted = formatBetaNarration(value);
    if (digest(formatted) !== digest(value)) writeJSON(join(runtime.directory, 'narration-formatting-' + revision + '.json'), {
      originalDraftSha256: digest(value), formattedDraftSha256: digest(formatted), note: 'Only paragraph boundaries changed; wording, order and claim links retained.' });
    return formatted;
  };
  const selectedResearch = { ...research, places: research.places.filter(p => selected.has(p.candidateId)) };
  const context = () => ({ brief, plan, research: selectedResearch,
    prepared: { stops: prepared.stops, legs: prepared.legs, chapterIds: prepared.chapterIds, chapterWindows: prepared.chapterWindows,
      routeMetres: prepared.routeMetres, walkingSeconds: prepared.walkingSeconds },
    narrationGuidance: 'Typically100–240words per stop, shorter for thin material. Spend time where there is a worthwhile story. The requested duration is approximate; do not pad speech or invent facts to meet it.',
    packageContract: 'Only story/chapter paragraphs become audio. Canonical onward directions, first approach and complete return are compiled separately; writer directions and production notes are not exported as navigation.',
  });
  let draft = await runtime.phase('writing', 'writer',
    'Write the complete original personal-beta tour from the retained claims and frozen route. Make it warm, clear and worth visiting. Explain unfamiliar names and relationships, preserve material qualifications in meaning, and connect to the present place. Factual and supported-reconstruction paragraphs link actual claimIds. Do not narrate research audits, irrelevant caveats or rejected anecdotes. Use the exact stop/chapter order. Walking chapters are optional: if none is worthwhile return an empty chapters array. Keep each paragraph below512characters and without embedded blank lines for the local renderer. No new research or facts. Duration is a preference, not a word quota.' + BETA_REVIEW_POLICY,
    context(), betaDraftSchema, { maxRequests: 1 });
  // Optional chapters can be omitted without losing the planned route or directions.
  draft = format(draft, 0);
  if (!draft.chapters.length) prepared = { ...prepared, chapterIds: [], chapterWindows: [] };
  const routeEvidence = collectRouteTextEvidence(runtime.directory, [...new Set(runtime.job.tasks.filter(t => t.role === 'route' || t.role === 'scout').map(t => t.scope))]);
  const evidenceTools = createRetainedEvidenceTools({ research, pages, directory: runtime.directory, fallbackReadPage: readTool, routeEvidence });
  let review: BetaReview | undefined;
  for (let revision = 0; revision <= 1; revision++) {
    let validationError: string | null = null;
    try { validateDraft(draft, research, plan, prepared.chapterIds, 'semantic-review'); compile(draft, prepared, revision + 1); }
    catch (error) { validationError = String(error); }
    review = await runtime.phase('beta-review-' + revision, 'verification',
      'Review this exact complete draft once for practical directions, material factual accuracy and listening clarity. Check central historical assertions and qualifications against supplied passages; reopen a retained source only for a specific consequential doubt. A claim ID is not proof. Check the actual canonical directions, not redundant writer fields. Suggest a few useful editorial changes; they cannot veto the tour. No new source discovery, field visit or future audio prerequisite. Return a consolidated list of concrete issues. Scope factual issues to the story/paragraph, and direction issues to the leg.' + BETA_REVIEW_POLICY,
      { ...context(), draft, validationError, draftSha256: digest(draft) }, betaReviewSchema,
      { tools: [evidenceTools.readPage, evidenceTools.readImage], maxRequests: 2 });
    const disposition = betaReviewDisposition(review);
    writeJSON(join(runtime.directory, 'review-batch-' + revision + '.json'), { draftSha256: digest(draft), validationError, reviews: [review], disposition });
    if (!validationError && reviewPasses(disposition)) break;
    if (revision === 1) throw Error('Concrete beta content/navigation defect remains after focused correction: ' + (validationError ?? disposition.issues.filter(i => i.required).map(i => i.problem).join('; ')));
    consume('correction', 'correction-1');
    const correctionSchema = betaDraftSchema.extend({ legDirections: betaDirectionsSchema.shape.legDirections });
    const corrected = await runtime.phase('correction-1', 'writer',
      'Repair only the named concrete defects using the existing research and route. Omit unsupported incidental details instead of inventing evidence. Return the complete revised draft plus every canonical leg direction in unchanged order; correct an affected direction without new routing. Preserve vivid supported material. Editorial suggestions are optional and duration never requires padding. Keep paragraph sizes below512characters.' + BETA_REVIEW_POLICY,
      { ...context(), draft, validationError, review }, correctionSchema, { maxRequests: 1 });
    assert.deepEqual(corrected.legDirections.map(l => l.legId), prepared.legs.map(l => l.id), 'Correction must retain every leg in order');
    prepared = { ...prepared, legs: prepared.legs.map((l, i) => ({ ...l, directions: corrected.legDirections[i].directions })) };
    const { legDirections: _directions, ...revised } = corrected; draft = format(revised, 1);
    if (!draft.chapters.length) prepared = { ...prepared, chapterIds: [], chapterWindows: [] };
  }
  assert.ok(review);
  writeJSON(join(runtime.directory, 'accepted-draft.json'), { draft, draftSha256: digest(draft), listening: 'unobserved' });
  let build: BuildResult;
  const buildOptions = { cacheDirectory: join(runtime.directory, 'audio-cache'), previousPackages: [] as string[] };
  try {
    build = await (options.build ?? buildTour)(compile(draft, prepared, 1), { ...buildOptions, outputDirectory: join(runtime.directory, 'package-v1') });
  } catch (error) {
    // An optional walking chapter that overruns a navigation boundary can be dropped.
    // Other media/parser failures remain concrete failures, never swallowed.
    if (!draft.chapters.length || !/audio exceeds (chapter cap|navigation budget)/.test(String(error))) throw error;
    writeJSON(join(runtime.directory, 'optional-chapter-omission.json'), { reason: String(error), omittedIds: draft.chapters.map(c => c.id) });
    draft = { ...draft, chapters: [] }; prepared = { ...prepared, chapterIds: [], chapterWindows: [] };
    build = await (options.build ?? buildTour)(compile(draft, prepared, 2), { ...buildOptions, outputDirectory: join(runtime.directory, 'package-v2') });
    writeJSON(join(runtime.directory, 'accepted-draft.json'), { draft, draftSha256: digest(draft), listening: 'unobserved', optionalChaptersOmitted: true });
  }
  const packageChecks = checkPackageForHandoff(build.packagePath);
  assert.equal(packageChecks.packageSha256, build.validation.packageSha256, 'Checked and rendered package must match');
  assert.equal(packageChecks.inputSha256, build.validation.inputSha256, 'Checked and rendered input must match');
  const packaged = JSON.parse(readFileSync(build.packagePath, 'utf8'));
  const durationAcceptance = betaDurationNote(brief.durationSeconds, build.timing.totalSeconds);
  const limitations = ['Personal beta: human listening and ordinary walking use are unobserved.', durationAcceptance.note,
    ...options.routeReview.issues.filter(i => !i.required).map(i => i.problem),
    ...betaReviewDisposition(review).issues.filter(i => !i.required).map(i => i.problem)];
  writeJSON(join(runtime.directory, 'build-result.json'), build);
  writeJSON(join(runtime.directory, 'route-final.json'), { plan, prepared, review: betaReviewDisposition(review) });
  writeJSON(join(runtime.directory, 'package-checks.json'), packageChecks);
  writeJSON(join(runtime.directory, 'beta-notes.json'), { policy: 'personal-beta', durationAcceptance, limitations, researchGaps: research.gaps,
    review, reviewDisposition: betaReviewDisposition(review), packageSha256: build.validation.packageSha256 });
  writeJSON(join(runtime.directory, 'production-manifest.json'), { draftSha256: digest(draft), packageSha256: build.validation.packageSha256,
    inputSha256: build.validation.inputSha256, validation: build.validation, packageChecks, durationStatus: 'reported-estimate', ordinaryUseObserved: false });
  const handoff = { status: 'beta-draft', packagePath: build.packagePath, timing: build.timing, durationAcceptance,
    independentReviews: true, reviewMode: 'one combined content/route review', freshContentOnly: true, chapterCount: packaged.fixture.narration.chapters.length,
    limitations, requiredOwnerActions: [] as string[], suggestedFeedback: ['Report confusing directions, pronunciation or dull material during ordinary use.'] };
  writeJSON(join(runtime.directory, 'handoff.json'), handoff);
  finish(runtime.job, 'awaiting-decision', 'Beta generation complete; package checks passed, optional listening/use feedback remains', runtime.now()); runtime.save();
  return handoff;
}
