# Review and repair record — 6 October 2026

The parent relayed an independent provider-audit agent's **fresh wording/source-metadata review of the retained artifacts**. It was not independent rediscovery of every primary source, audio listening or a field visit.

## Returned review: needs revision

1. Six physical transition groups remained labelled editorial in the pilot evidence artifact, allowing route instructions to appear exempt from physical evidence. Examples: `pilot-farringdon-claim-3`, `pilot-stjohn-gate-claim-7` and `pilot-flowers-claim-7`.
2. The retained flower-making snippet “Every petal was shaped.” was too narrow to substantiate all the process details, despite the source locator and inherited research.

No factual script rewrite was requested. All voices and transcript/audio hashes remain the same after the metadata repair.

## Applied repairs and exact scope

All former editorial evidence groups, including mixed introduction/instruction text, are conservatively classified **physical draft** in `evidence.json`. Each has explicit current/next encounter IDs and `pilot-route@1`. `import-pilot.ts` maps them into physical assertions with both encounter dependencies; scripts also depend on the exact complete route, which carries its underlying encounters. The actual player transport has a fixed `editorial` evidence enum for navigation; that legacy label is not used as an authoring acceptance exemption. The new authoring Job retains unresolved physical blockers.

The flower source now retains **25 quoted words in noncontiguous fragments** from the actually reopened museum process paragraphs: cutting tools; fabric dyeing; moulds; heating over a spirit lamp; shaping around a ball; wire; covering; arranging. The locator names the question/section and speakers. Each supports the relevant operation without representing the general trade account as an inventory of the chapel workroom. The narration already says “through the trade”; the two-year estimate remains attributed to a mission assistant. Original September claims, temporal scope and qualitative limitations remain in each claim's scope.

Code checks verify exact script partitions, encounter links, dependency freshness, current input hashes, actual parser acceptance and all six audio identities. **These are repair checks, not an independent final editorial acceptance.** The integrator's returned artifacts stay blocked with zero acceptance decisions. The parent can add a fresh current-version desk review after inspecting this repair; current exterior access, source entailment where minimal snippets are insufficient, and actual listening remain separate.

The two initial imported snapshots are retained locally under ignored `artifacts/generation-pilot-checkpoints/`. They had no reviews or acceptance decisions; current artifact hashes identify the final import. This readable record preserves the meaningful before/after defects without treating tool return as acceptance.

## Tooling corrections

The existing `tools/check-package.ts` expects an authoring manifest, not the actual mobile transport; trying it on this transport produced the expected schema mismatch. Reproduction now uses `pilot.ts --check`, calling the real `parseTourPackage` and verifying media hashes. A cached rerun initially compared a parsed old fixture to raw new JSON property ordering; comparing both through the parser fixed the false version conflict. The existing version guard remains enforced. Check-only/cache reruns preserve input identity and initial render history; they neither duplicate paid operations nor change installed tours.
