# Next implementation: one curated offline walk

Prepared 13 September; status updated 16 September 2026. **First map slice implemented and verified using combined desk/outdoor evidence. M1 passed its [acceptance gate](../test-results/M1-closure.md).** These are small ordered tasks for the next assigned milestone, not authorization to bypass the lifecycle gate. Existing research, provisional package validation and listening drafts are retained.

## Preparation available now

New editorial preparation, 16 September: [walking-tour design research](WALKING-TOUR-DESIGN-RESEARCH.md) brings together visitor studies, heritage conventions and audio-tour practice, with proposed guidelines for discussion. Agree the intended experience before selecting the final route or fixing narration lengths. These recommendations are not yet owner-approved guidelines and add no physical test gate.

Current owner direction: minimise walking time while preserving valid tests, beginning near North Finchley bus station and finishing nearby. The [short-walk evidence plan](M2-TEST-PLAN.md) replaces the earlier provisional area/duration target with a 20–30-minute design goal, subject to six useful verified stops. It distinguishes desk checks, route survey, the completed walk and targeted regressions. The first map slice is now authorized; neither the old Finchley sequence nor the new candidate pool is a verified itinerary.

The 16 September [personal-use testing policy](../../AGENTS.md#testing-policy-for-the-personal-prototype) governs each task below: reuse accepted evidence, automate relevant checks and request physical work only for a material unresolved question. Recorded rare recoverable issues need not block progression. “Done when” describes the useful outcome; it does not require a physical test for every listed failure mode.

- Review batches of M1 evidence using the [local intake tool](../TEST-EVIDENCE-REVIEW.md), then resolve actual failures without changing the test definition.
- Reuse the record structure in the [Finchley field worksheet](FINCHLEY-FIELD-WORKSHEET.md) for separately verified visitor positions, approaches and viewpoints; prepare candidate-specific prompts for North Finchley before a survey. Its named sites belong to the earlier area and are not the new itinerary.
- Retain the two [E1 briefs and predictions](E1-BRIEFS.md) as historical preparation; re-author them for the compact area once feasibility is known. Desk listening can reveal dull stories before routing, but does not establish enjoyable or usable walks. The current six audio drafts are reproducible with the existing local renderer; no new voice service is needed for desk drafts.

## Ordered implementation tasks after the M1 gate

### 1. Prove one small offline map

Current implementation: fixed North Finchley PMTiles, local style/fonts/credits and read-only session position. Both native builds and local checks pass. Offline cold drawing, coverage, short memory measurements, resource repair and remote/focus/recovery now have device evidence. Audio while opening/closing the map also passed with owner confirmation. Stationary live position/camera checks and the targeted outdoor regression have been reviewed. The [outdoor result](../test-results/M2-outdoor-map.md) records the skipped stationary minute and justified reuse of accepted M1 evidence; no repeat outing is requested. See [slice results](../test-results/M2-offline-map.md).

Use the existing [map/routing comparison](MAPS-AND-ROUTING.md) as the experiment proposal. First document a permitted small dataset and its attribution, offline storage/redistribution rights, expiry and cost. Ask Sidi only if the choice creates material cost or lock-in. Then isolate the renderer adapter and prove native compatibility before settling a package map format.

Done when: the entire candidate area pans/zooms after cold opening with networking off; map labels/styles/glyphs/sprites work; missing/corrupt resources and leaving coverage have explicit behavior. Record size, load time, peak memory, SDK/data versions and the rights decision. A drawn route on a blank canvas is not a pass. No backend or arbitrary rerouting is added.

### 2. Establish one usable route and content version

Complete visitor records first, obtain and preserve real pedestrian routing output between those points, then review crossings, gates and all legs. Keep the six-stop order provisional until spacing and access are known. Combine or replace nearby garden stops if they cannot support distinct useful experiences; bring a material change to the six-stop scope to Sidi.

Done when: six retained stops have evidence and field review records, all legs/directions have provenance and observed access, and the measured walking/listening/silence budget fits. Factual script passages map to reviewed claims; source freshness, uncertainty, reviewer/date/method and rights are explicit. The manifest fails readiness for any unresolved critical physical or asset requirement.

### 3. Import a complete local package without losing a working one

Add a mobile staging boundary separate from generation and the player. Validate metadata, safe paths, actual media/map decoding and asset checksums before committing a version. Retain the old working package if interrupted or invalid; pin the active session and its progress to its content version. The Node checker is a starting contract, not a secure archive importer.

Done when: a valid package imports locally; truncated/missing/tampered resources, unsupported versions, traversal, insufficient storage and interruption cannot replace the working version. Reopening restores the committed version. An update does not silently reinterpret existing stop IDs or narration offsets. Define removal/retention explicitly before deleting any user package or progress.

### 4. Connect the six-stop player and actionable cues

Adapt the proven M1 session without mixing location, narration and progress. Provide local map/route/directions, transcripts/sources and manual stop choice, replay, skip and an explicit arrival fallback. Keep one pending eligible stop, never a backlog. Stage any new audio arbitration first in deterministic tests.

A prepared actionable walking cue may pause a story, play, and restore its saved offset. Check manual intent before both cue start and story resume. A user pause during preparation, the cue, focus recovery or a restored session cancels automatic continuation. If a cue is stale after departure, do not play an outdated instruction; retain usable local guidance and manual choice. No online rerouting dependency is introduced.

Done when: relevant race tests cover arrival during narration, cue versus pause in both orders, pause during cue, interruption, stale cue, skip/end and process death during story/cue handover. Confirm new audible handover and pause behavior in one short phone session; reuse unchanged native interruption/recovery evidence and add cases only for a material gap or failure. A reducer pass does not establish audible behavior. The whole planned walk remains manually usable without location permission or network.

### 5. Walk, correct and compare

Use the six-stop walk offline, then briefly review story length, directions, arrivals and enjoyment. Fix blockers and retain low-impact issues for normal-use feedback; retest only what a fix needs. E1 is a separate decision: compare short samples first and walk representative segments only where it would change the choice, recording presentation order and concrete differences.

M2 is done when the curated offline tour is useful under its stated acceptance scope, with remaining non-blocking limits recorded. E1 separately records proceed, revise and repeat, or do not automate yet before authorizing a factory; it need not delay the usable M2 tour. Backend infrastructure, a reusable city knowledge base, driving and a full AI factory remain outside this milestone.

## Decisions still open

The PMTiles native proof and targeted map regression are complete within their recorded Pixel scope. Still open: verified visitor points and feasible leg timing; final six-stop selection, voice/rights and script duration. These require evidence or later feedback, not guesses now. No further M1 or map-regression phone test is requested. Prepare the compact route/content proposal for discussion before the next implementation slice or survey, with purpose and owner time stated before any field request.
