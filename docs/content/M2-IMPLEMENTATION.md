# Next implementation: curated offline walking tours

Prepared 13 September; status updated 17 September 2026. **First map slice implemented and verified using combined desk/outdoor evidence. M1 passed its [acceptance gate](../test-results/M1-closure.md).** These are small ordered tasks for the next assigned milestone, not authorization to bypass the lifecycle gate. Existing research, provisional package validation and listening drafts are retained.

## Preparation available now

**Latest sequencing direction, 17 September:** first conduct the [comprehensive public walking-tour survey](AREA-TOUR-SURVEY.md), cataloguing stops, themes and stories with sources. Revisit the two outlines against it before full scripting. This supersedes the immediate B-script-first sequence below, while preserving the direction to develop both tours. Save reusable structured research; database implementation is a later roadmap item.

Latest owner review, 17 September: [develop both North Finchley tours](NORTH-FINCHLEY-REVIEW-RESPONSE.md), with B’s additional walking welcomed and A’s Stanhope detour removed. Prepare B’s 2–3-minute chapter between stops 3 and 4 and a few scores out of ten plus a voice note after each story. The [editorial record](EDITORIAL-REVIEW-RECORD.md) collates all 45 comments and the corrections. The original A route/timing is now historical; B’s desk estimate is 1.9 km / 37–42 minutes before review overhead and final chapter timing. No new field work is requested at this review stage.

Editorial preparation, 16 September: [walking-tour design research](WALKING-TOUR-DESIGN-RESEARCH.md) brings together visitor studies, heritage conventions and audio-tour practice. Sidi's Word review now informs the [living design guidance](TOUR-DESIGN-GUIDANCE.md): non-obvious insights, a meaningful theme, relaxed pacing, varied tone and comfortable leg/story timing. It distinguishes owner direction from proposed applications and future features. Use it before selecting the final route or fixing narration lengths; it adds no physical test gate or feature implementation.

Sidi reviewed the [first two North Finchley sample stops](NORTH-FINCHLEY-SAMPLE-STOPS.md): develop Tally Ho with factual context before its light anecdote, and retire the minor memorial stop. [Tally Ho revision 2](TALLY-HO-SAMPLE-V2.md) and the living guidance apply all ten comments. The revised wording still needs owner judgement; retained stops need route/viewpoint checks later. These are not full E1 variants or a selected six-stop walk.

Current owner direction: economise technical tests, but let story and walking value determine finished-tour duration. The earlier 20–30-minute product target was over-applied and is superseded. Start/end convenience remains. The [evidence plan](M2-TEST-PLAN.md) distinguishes desk checks, necessary route observations, ordinary tour use and targeted regressions; neither new tour is field-verified.

The 16 September [personal-use testing policy](../../AGENTS.md#testing-policy-for-the-personal-prototype) governs each task below: reuse accepted evidence, automate relevant checks and request physical work only for a material unresolved question. Recorded rare recoverable issues need not block progression. “Done when” describes the useful outcome; it does not require a physical test for every listed failure mode.

- Review batches of M1 evidence using the [local intake tool](../TEST-EVIDENCE-REVIEW.md), then resolve actual failures without changing the test definition.
- Reuse the record structure in the [Finchley field worksheet](FINCHLEY-FIELD-WORKSHEET.md) for separately verified visitor positions, approaches and viewpoints; prepare candidate-specific prompts for North Finchley before a survey. Its named sites belong to the earlier area and are not the new itinerary.
- Retain the two [E1 briefs and predictions](E1-BRIEFS.md) as historical preparation; re-author them for the compact area once feasibility is known. Desk listening can reveal dull stories before routing, but does not establish enjoyable or usable walks. The current six audio drafts are reproducible with the existing local renderer; no new voice service is needed for desk drafts.

## Ordered implementation tasks after the M1 gate

### 1. Prove one small offline map

Current implementation: fixed North Finchley PMTiles, local style/fonts/credits and read-only session position. Both native builds and local checks pass. Offline cold drawing, coverage, short memory measurements, resource repair and remote/focus/recovery now have device evidence. Audio while opening/closing the map also passed with owner confirmation. Stationary live position/camera checks and the targeted outdoor regression have been reviewed. The [outdoor result](../test-results/M2-outdoor-map.md) records the skipped stationary minute and justified reuse of accepted M1 evidence; no repeat outing is requested. See [slice results](../test-results/M2-offline-map.md).

Use the existing [map/routing comparison](MAPS-AND-ROUTING.md) as the experiment proposal. First document a permitted small dataset and its attribution, offline storage/redistribution rights, expiry and cost. Ask Sidi only if the choice creates material cost or lock-in. Then isolate the renderer adapter and prove native compatibility before settling a package map format.

Done when: the entire candidate area pans/zooms after cold opening with networking off; map labels/styles/glyphs/sprites work; missing/corrupt resources and leaving coverage have explicit behavior. Record size, load time, peak memory, SDK/data versions and the rights decision. A drawn route on a blank canvas is not a pass. No backend or arbitrary rerouting is added.

### 2. Develop both tours with B as the six-stop baseline

Complete the public-tour survey and reconcile its findings with the owner-reviewed outlines first. Then develop B’s full script and 3→4 walking chapter, followed by A’s revised five-stop thread after removing Stanhope. Reuse shared research. Reroute A and refine both between reviewed visitor positions; review crossings, access and all legs. Close central stops are editorially accepted, subject to workable physical placement. Do not add a weak replacement or count a walking chapter as a stop merely to make A six; B supplies the six-stop baseline. Final access and directions remain provisional.

Done when: B’s six stops and every retained A stop have evidence and field review records, all legs/directions have provenance and observed access, and each measured walking/listening/silence budget fits. Factual script passages map to reviewed claims; source freshness, uncertainty, reviewer/date/method and rights are explicit. The manifest fails readiness for any unresolved critical physical or asset requirement.

### 3. Import a complete local package without losing a working one

Add a mobile staging boundary separate from generation and the player. Validate metadata, safe paths, actual media/map decoding and asset checksums before committing a version. Retain the old working package if interrupted or invalid; pin the active session and its progress to its content version. The Node checker is a starting contract, not a secure archive importer.

Done when: a valid package imports locally; truncated/missing/tampered resources, unsupported versions, traversal, insufficient storage and interruption cannot replace the working version. Reopening restores the committed version. An update does not silently reinterpret existing stop IDs or narration offsets. Define removal/retention explicitly before deleting any user package or progress.

### 4. Connect the six-stop player and actionable cues

Adapt the proven M1 session without mixing location, narration and progress. Provide local map/route/directions, transcripts/sources and manual stop choice, replay, skip and an explicit arrival fallback. Keep one pending eligible stop, never a backlog. Stage any new audio arbitration first in deterministic tests.

Add B’s leg chapter as separate versioned narration with departure eligibility, once-only progress, fresh route-relative position, manual fallback and stale-chapter handling. It must respect holds, next-stop arrival and cue priority. Replay these transitions before one brief audible/departure check; existing native evidence remains reusable. Detailed proposed behavior is in the [development brief](NORTH-FINCHLEY-REVIEW-RESPONSE.md#a-walking-chapter-with-a-purpose).

A prepared actionable walking cue may pause a story, play, and restore its saved offset. Check manual intent before both cue start and story resume. A user pause during preparation, the cue, focus recovery or a restored session cancels automatic continuation. If a cue is stale after departure, do not play an outdated instruction; retain usable local guidance and manual choice. No online rerouting dependency is introduced.

Done when: relevant race tests cover arrival during narration, cue versus pause in both orders, pause during cue, interruption, stale cue, skip/end and process death during story/cue handover. Confirm new audible handover and pause behavior in one short phone session; reuse unchanged native interruption/recovery evidence and add cases only for a material gap or failure. A reducer pass does not establish audible behavior. The whole planned walk remains manually usable without location permission or network.

### 5. Add local per-story feedback and compare both tours

Build the [small review flow](NORTH-FINCHLEY-REVIEW-RESPONSE.md#a-small-review-after-each-story): three proposed 0–10 dimensions plus a deliberate local voice recording linked to tour/version, story and attempt. Keep review separate from progress and saving separate from Resume. Recording denial/failure must preserve ratings and prior notes. Verify the local storage/export boundary and audible pause behavior proportionately before handing it over.

Use both tours offline for owner feedback, recording order and prior exposure to shared stories. Report review overhead separately from normal duration; a full comparison need not happen on the same day or be repeated to supply identical technical evidence. Fix blockers and retain low-impact issues for normal-use feedback; retest only what a fix needs. E1 remains a separate decision: these unequal outlines and desk reactions alone do not meet its acceptance gate or authorise a factory.

M2 is done when the curated offline tour is useful under its stated acceptance scope, with remaining non-blocking limits recorded. E1 separately records proceed, revise and repeat, or do not automate yet before authorizing a factory; it need not delay the usable M2 tour. Backend infrastructure, a reusable city knowledge base, driving and a full AI factory remain outside this milestone.

## Decisions still open

The PMTiles native proof and targeted map regression are complete within their recorded Pixel scope. Still open: verified visitor points and feasible leg timing; final six-stop selection, voice/rights and script duration. These require evidence or later feedback, not guesses now. No further M1 or map-regression phone test is requested. Both-tour development is authorised; do not ask Sidi to choose A or B again. Implement the bounded player/review work after its content and contract preparation, with purpose and owner time stated before any field request. The exact feedback dimensions and chapter mechanics remain engineering proposals, not observed behavior.
