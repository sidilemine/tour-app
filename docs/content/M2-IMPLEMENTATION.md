# Next implementation: one curated offline walk

Prepared 13 September; status updated 15 September 2026. **Ready as an implementation plan; M1 passed its [acceptance gate](../test-results/M1-closure.md).** These are small ordered tasks for the next assigned milestone, not authorization to bypass the lifecycle gate. Existing research, provisional package validation and listening drafts are retained.

## Preparation available now

Current owner direction: minimise walking time while preserving valid tests, beginning near North Finchley bus station and finishing nearby. The [short-walk evidence plan](M2-TEST-PLAN.md) replaces the earlier provisional area/duration target with a 20–30-minute design goal, subject to six useful verified stops. It distinguishes desk checks, route survey, the completed walk and targeted regressions. M2 implementation remains under discussion; neither the old Finchley sequence nor the new candidate pool is a verified itinerary.

- Review batches of M1 evidence using the [local intake tool](../TEST-EVIDENCE-REVIEW.md), then resolve actual failures without changing the test definition.
- Reuse the record structure in the [Finchley field worksheet](FINCHLEY-FIELD-WORKSHEET.md) for separately verified visitor positions, approaches and viewpoints; prepare candidate-specific prompts for North Finchley before a survey. Its named sites belong to the earlier area and are not the new itinerary.
- Retain the two [E1 briefs and predictions](E1-BRIEFS.md) as historical preparation; re-author them for the compact area once feasibility is known. Desk listening can reveal dull stories before routing, but does not establish enjoyable or usable walks. The current six audio drafts are reproducible with the existing local renderer; no new voice service is needed for desk drafts.

## Ordered implementation tasks after the M1 gate

### 1. Prove one small offline map

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

Done when: race tests cover arrival during narration, cue versus pause in both orders, pause during cue, interruption, stale cue, skip/end and process death during story/cue handover. Follow with native phone checks; a reducer pass does not establish audible behavior. The whole planned walk remains manually usable without location permission or network.

### 5. Walk, correct and compare

Complete the six-stop walk offline, then review story length, directions, arrival behavior, recoverability and enjoyment. Preserve defects and retest fixes. Finish the feasible routed E1 variants with the same duration/access envelope, record presentation order and concrete differences, and compare to the curated baseline.

Done when: the M2 acceptance matrix passes and Sidi's E1 outcome is recorded as proceed, revise and repeat, or do not automate yet. Backend infrastructure, a reusable city knowledge base, driving and a full AI factory remain outside this milestone.

## Decisions still open

Map dataset/rights and demonstrated renderer format; verified visitor points and feasible leg timing; final six-stop selection, voice/rights and script duration. These require evidence or later feedback, not guesses now. No M1 phone test remains. This plan adds no immediate owner action; batch future field/content review and present its purpose and time requirement before requesting it.
