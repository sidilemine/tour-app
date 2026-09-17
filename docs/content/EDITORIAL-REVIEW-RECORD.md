# Editorial discussion and decision record

Start here when resuming tour curation or reviewing how to make systematic guidelines. Updated 17 September 2026. This is the durable history of discussion, alternatives, corrections and outcomes; [TOUR-DESIGN-GUIDANCE](TOUR-DESIGN-GUIDANCE.md) contains the current working rules. Keep evidence and owner preference distinguishable.

## How to maintain this record

For each meaningful discussion, append a dated entry with: artifact/version; what we proposed; Sidi's actual response; decision status; why it changed; affected guidance; and what remains open. Preserve rejected examples and later corrections. Capture Word comments with their anchors before summarising them. Keep originals untouched. Link revised artifacts rather than silently replacing review copies.

Use **owner direction**, **accepted choice**, **engineer proposal**, **observed result**, **superseded interpretation**, and **open question** explicitly. Approval to prepare options is not approval of the options. Lack of feedback is not acceptance. When a working interpretation is corrected, record both the earlier mistake and the correction so a future synthesis does not learn the wrong lesson.

When we take a serious look back: read this record, the captured comments and the actual examples before revising rules. Separate a general preference from a reaction to one weak execution. Compare what was proposed with what was heard or walked; do not infer tour enjoyment from desk approval. This is a local record, not a new knowledge-base service or automation.

## Evidence index

- [Initial walking-tour research](WALKING-TOUR-DESIGN-RESEARCH.md) and [original Word review](walking-tour-design-review.docx).
- [First 34 owner Word comments with anchored text](reviews/2026-09-16-owner-word-comments.json): 24 on the research review, 10 on the narration pair; document-local IDs and source-file SHA-256 retained. This committed text capture remains usable if the original commented Word files are absent from another checkout. Original commented files remain locally under `docs/content/` and are not overwritten.
- [Latest 11 tour-options comments](reviews/2026-09-17-tour-options-comments.json) and [response/development brief](NORTH-FINCHLEY-REVIEW-RESPONSE.md): **45 comments total** across the three reviews. All retain source-file hashes, local IDs and anchored text.
- [Current design guidance](TOUR-DESIGN-GUIDANCE.md), revisions 1–9 with revision history.
- [First North Finchley sample pair](NORTH-FINCHLEY-SAMPLE-STOPS.md) and [original Word copy](north-finchley-sample-stops-review.docx), including the rejected memorial execution.
- [Tally Ho revision 2 and response mapping](TALLY-HO-SAMPLE-V2.md) and [Word copy](tally-ho-sample-review-v2.docx). The later imagined-colour correction supersedes its narrower review note, not its narration.
- [Current tour options A and B](NORTH-FINCHLEY-TOUR-OPTIONS.md), [Word proposal](north-finchley-tour-options-review.docx), and [actual routing evidence](routes/north-finchley-options-v1/README.md).
- [Personal-use testing policy](../../AGENTS.md#testing-policy-for-the-personal-prototype), [M2 implementation status](M2-IMPLEMENTATION.md) and [route/test brief](M2-TEST-PLAN.md). Device evidence stays in the linked test records; content feedback does not certify technical acceptance.
- [First ordinary Tour B feedback recovery](FIRST-TOUR-FEEDBACK-RECOVERY.md): all seven saved ratings and reviewed paraphrases from 14 field recordings, with three explicit clarification gaps.

## Discussion history

### 01 Convenient location and proportionate testing

**Context:** M2 preparation and the map slice, before the editorial research. **Owner direction:** start around North Finchley bus station and finish nearby; the shorter the better within valid test needs. The Finchley Central–Church End–Stephens House backtracking was queried and was not intentional. The later 20–30-minute compact target is a working design goal, not a measured route or minimum acceptance duration.

After the map walk, Sidi reported accurate location, correct audio and airplane-mode use, but did not do the stationary minute at C or note battery. Those omissions remain explicit in [the result](../test-results/M2-outdoor-map.md); unchanged accepted M1 evidence was reused. Sidi then directed pragmatic testing throughout: he is the user/test subject, and rare recoverable edge cases can be fixed when encountered. **Outcome:** adopted in AGENTS, PRODUCT and ROADMAP. This does not establish that every enjoyable future tour must be the shortest technical test route. **Then open:** acceptable finished-tour length when extra time buys better content. Resolved for these proposals in entry 08: B’s longer duration is welcome; the short footprint was for technical tests.

### 02 Research before relying on taste alone

**Owner request:** find literature, conventions and reports on good walking tours, then agree general guidelines; provide Word for comments. **Outcome:** [research review](WALKING-TOUR-DESIGN-RESEARCH.md), followed by 24 comments. Research findings retain their scope and limitations; Sidi's preferences guide this personal product. No general claim that synthetic narration inherits effects measured in live interpretation.

### 03 First Word review and living guidance

**Owner direction, captured comments 0–23:** enjoyable non-obvious knowledge tied to the place; 99% Invisible as a reference; a meaningful theme; relaxed cognitive effort; varied tone; comfortable walking and directions; practical production/rhythm advice; flexible endings; honest speculation. Retain visual depth, eventual voice feedback and other future ideas without treating them as current implementation scope.

**Outcome:** guidance revision 1. The [comment capture](reviews/2026-09-16-owner-word-comments.json) preserves every comment, including the detail not repeated here. The guidance maps each ID to its response and distinguishes owner direction from proposed applications. **Open:** whether these principles produce good actual scripts and walks; future features remain unscheduled.

### 04 Contrast in sample stops

**Engineer proposal:** a light Tally Ho naming anecdote beside a reflective John Parr/vanished-street sample, both about a minute. Sidi authorised preparation. **Artifacts:** [draft pair](NORTH-FINCHLEY-SAMPLE-STOPS.md). Local audio files were silently rendered; this is not evidence of listening or approval.

**Owner response, comments 0–9:** strong preference for Tally Ho's tone and quirkiness, with conventional factual context first. Suggested the roads and coaching inn as a possible anchor, then the anecdote and a present-day coda only if worthwhile. The memorial sample meandered, gave unexplained figures, included an unhelpful theft detail, blurred who was commemorated and imposed a meaning the memorial did not have. Sidi prefers avoiding minor solemn sites and treating major ones formally and without poetic embellishment.

**Outcome:** develop Tally Ho; retire the John Parr stop. Guidance revision 2. The prior engineer defence of the memorial ending as mere interpretation was wrong and is expressly withdrawn. Do not generalise that failed execution into a ban on reflective stories or all religious buildings. **Open:** final writing, story depth and complete itinerary.

### 05 Tally Ho factual grounding

**Engineer action:** checked road and coaching history and wrote [revision 2](TALLY-HO-SAMPLE-V2.md), 240 words, estimated 96–111 seconds before pauses. Distinguished an attributed horse-changing operation from an unproven particular coaching inn; retained uncertainty on the first use of the place name.

**Status:** owner preference for the direction is established; the revised script itself has not been expressly approved. No inference that 240 words or that duration is a general standard. **Working lesson:** an interesting suggestion becomes a factual anchor only after checking, and factual context can improve an anecdote without stripping its personality.

### 06 Correction on imagined colour

**Owner clarification:** “imagined (but strongly supported) color” should bring a vanished scene to life. Asking people to imagine something without help is unfair and wastes the narrator's opportunity. Sidi used a serious audiobook about an area as a reference for appropriate descriptive freedom.

**Superseded interpretation:** the initial response to comment 4 put too much emphasis on restricting evocation. **Outcome:** guidance revision 3 positively encourages supported reconstruction of character, everyday activity and sensory texture. The narrator supplies the scene; individual ordinary details need not each have an eyewitness source. The imagined frame can be established naturally without hedging every sentence. This remains separate from inventing a memorial's intended meaning. **Open:** judge an actual descriptive passage, rather than assume the revised rule guarantees good writing.

### 07 Current assignment and options

**Owner direction:** proceed with research and route proposals; options can be alternative stories/places or two tours. Preserve discussion and outcomes so we can later develop systematic guidelines. **Engineer response:** two six-stop proposals, actual pedestrian routing estimates, explicit route compromises and candidate swaps; no implementation or field request.

**Current proposal:** A, entertainment-led, about 1.4 km / 28–33 minutes; B, broader neighbourhood variety, about 1.9 km / 37–42 minutes. Both begin/end by the bus station. The full [options document](NORTH-FINCHLEY-TOUR-OPTIONS.md) explains sources, limits and weaker candidates.

**Status at proposal:** awaiting owner feedback; neither option was selected then. Entry 08 records the subsequent decision to develop both and the required changes. Existing E1 requirements remain separate; two outlines are not completed comparison variants.

### 08 Owner review of the two tours

**17 September 2026. Artifact:** proposal 1 and its commented Word copy. [All 11 comments, IDs 0–10](reviews/2026-09-17-tour-options-comments.json); [complete response and development brief](NORTH-FINCHLEY-REVIEW-RESPONSE.md). The original body including table text is unchanged, with no tracked insertions/deletions; all four pages were inspected. Original files are preserved.

**Owner direction and accepted choices:** develop both tours for actual feedback; B's extra time is welcome and it is slightly more exciting on paper. Keep the Tally Ho treatment and Grand Arcade. Drop Stanhope's dedicated detour: limited researched material and weak current continuity do not earn it. Prefer Gaumont/artsdepot for its position, present connection and fuller back story. Stanhope could be a passing story with a picture if a future route naturally passes it; this is not a requested detour or an independently verified frontage.

**Corrections to our planning:** the short footprint was for economical technical tests, not a product ambition. Close stops can convey a dense centre; longer walking, some retracing and quiet can be enjoyable, particularly for social use. The earlier emphasis on even spacing and treating all empty legs as weaknesses was too rigid. Two cinemas are not inherently repetitive: they need a strong developing theme or meaningful contrast. Sidi's high-end/working-class example is illustrative, not historical evidence about our cinemas. The Kinks tour was explicitly suggested for lookup; the response links the provider's East Finchley-based tour and distinguishes its advertised design from verified experience.

**New requested development:** a 2–3-minute area/theme chapter after departure from B's stop 3, on the way to stop 4; a small set of scores out of ten and a voice note after each story during the walk. Music, richer visual support and social touring remain future ideas. The specific chapter and per-story feedback are now active preparation, not merely distant ideas.

**Engineer proposals, not separately owner-approved:** develop B's complete content first, then revised A; use B as the six-stop M2 baseline and A as a five-stop comparison after removing Stanhope, without padding; try three review dimensions (interest, value of being here, storytelling), optional short voice notes and explicit pause/resume around recording. Detailed departure/recording mechanics are proposed in the brief and are not implemented. No new itinerary has field acceptance. The old A routing output still contains Stanhope and is historical; do not use its timings for revised A.

**Outcomes:** guidance revision 4; current M2 planning corrected; 45 comments collated. Both-tour development is authorised, not a request to choose A or B again. Physical access, final scripts, new player behavior and actual enjoyment remain unverified. Future comparative conclusions must record differences in duration, number of stories, review interruptions and exposure to shared stories, rather than claim a controlled comparison or E1 success from these comments.

### 09 Survey before selection and retain reusable research

**17 September 2026, conversation. Owner direction:** the first step for a new area should be a full survey of publicly available walking tours, cataloguing stops, themes and stories. The aim is to learn from the existing guiding knowledge rather than duplicate or plagiarise it. Plan a database of locations and related research so each new tour does not start from scratch.

**Outcome:** [survey protocol](AREA-TOUR-SURVEY.md) added to startup instructions, living guidance revision 5 and current M2 sequencing. A comprehensive Finchley survey now comes before full scripting, preserving the existing A/B work and owner choices for reconsideration against better coverage. The [local reusable catalogue](../../ROADMAP.md#reusable-location-and-research-catalogue) is explicitly planned; structured records come first, database implementation after observed reuse needs. Earlier generic deferral of a city knowledge base does not prohibit these research records or the newly requested roadmap item. A hosted knowledge service remains separate.

**Engineering interpretation:** cover multiple source families and nearby areas, deduplicate listings, catalogue only publicly supported stop/story details, document access gaps, independently verify adopted claims, and preserve alternative stories per place. “Full” is a documented broad survey, not a claim of access to unpublished scripts. The protocol is ready; the actual survey and database are not complete.

**Working preferences and advice request:** Sidi asked which thinking level and whether sub-agents would help for the next tasks, then clarified not to worry much about token spend. Prioritise quality and useful progress. Recommended High as the main-thread default, independent research/checking sub-agents for broad surveys, and higher effort selectively for difficult synthesis or playback races. This is engineering advice, not a measured performance result or a changed app setting. A question about delegation is not itself a request to spawn agents.

### 10 Survey findings and preparation through usable tours

**17 September 2026, conversation. Owner direction:** proceed with the necessary work and keep going until the tours are ready for him to take. Token spend is secondary to quality. When asked about a connected phone, Sidi requested one clustered session rather than leaving it connected throughout development; desk work/builds proceed first, with listening readiness checked separately before sound.

**Outcome in preparation:** three delegated source-family surveys produced 50 raw walk/resource records and 45 consolidated entries after five cross-branch duplicates were merged. These include collections and partial listings, not 45 complete scripts. [Synthesis and decisions](survey/README.md) retain the published places/themes/stories, gaps and future leads. Preserve the owner-selected themes and bus-station geography; the Kinks tours are mostly East Finchley comparisons. Reiniger's Waylamp and Postgate remain future leads without forcing new unverified stops.

**Editorial application:** A retains five stops, removes Stanhope and views the Arcade from its street entrance. B keeps six stops and its separate estate-to-streets chapter. The chapter supplies development context, the villas explain the shared garden arrangement, and the Elephant is deliberately brief. [Nine shared narratives](../../content/north-finchley/stories.json) retain paragraph evidence and supported imagined colour; the original Tally Ho revision is reused. This is a proposed successful application, not observed enjoyment.

**Physical interpretation:** dated Street View establishes credible pavement views of the sculpture and villas; camera coordinates, landmark pins and approximate standing nominees remain distinct. The Crescent green lies across the roadway from the house-side pavement. [Exterior checks](routes/north-finchley-review-v2/EXTERIOR-CHECKS.md) resolve the need for separate reconnaissance while retaining current-obstruction uncertainty for ordinary use.

**Implementation:** local packages, variable stops, once-only departure chapter, numbered map, transcripts/directions/evidence and private scores/voice notes are implemented. Reviews preserve pause, recordings and earlier attempts; saving a voice copy is explicit and verified. The simple prepared spoken directions and measured chapter window serve these routes; generic interrupting navigation cues remain deferred. [Implementation](M2-PLAYER-IMPLEMENTATION.md) and [build/device results](../test-results/M2-tour-build.md) distinguish completed checks from first-use evidence. No E1 automation decision, authoring database or public release is inferred.

**Phone outcome:** the [17 September check](../test-results/M2-tour-phone.md) passed representative recording/playback/save/reopen checks; both tours are installed for independent use. **Next owner evidence:** ordinary A/B use with optional feedback. No new baseline walking quota or stationary-minute repeat. The [tour guide](NORTH-FINCHLEY-TAKE-THE-TOURS.md) records the actual steps and time estimates.

### 11 A voice comfortable enough for the whole walk

**17 September 2026. Owner feedback:** the installed macOS Daniel voice is too robotic for sustained listening. Sidi wants a quick, easy, free improvement for now; he has ElevenLabs and Hume subscriptions for later serious work. Their mention does not authorise paid usage or uploading scripts.

**Authorised next step:** prepare matching short Kokoro samples in British Emma and George. [The audition and metadata](voice-samples/README.md) preserve the exact excerpt and outputs. Both were generated locally and decoded successfully, with no audible device action or phone/package change. **Owner decision after listening:** both are good. Emma sounds crisper but quite flat; George has better intonation, feels deeper and more appropriate for a London tour. **Accepted choice: Kokoro George (`bm_george`)** at the auditioned speed. Regenerate both tours with George. This is a preference from this direct comparison, not a universal rule about male voices or proof of full-tour enjoyment. Recheck measured chapter timing; pronunciation and sustained comfort remain ordinary-use observations.

### 12 First ordinary Tour B use and voice-note recovery

**17 September 2026. Owner report and request:** Sidi took the first tour and left long voice memos at the stops. He expected the headphones' microphone to capture them, then found the recordings difficult to hear. Retrieve what is usable and ask focused questions or request re-recording only for missing material.

**Observed result:** the selected outing is B, George version 2. Fourteen field files (19 minutes 29 seconds) and scores for all six stops plus the walking chapter were recovered locally. Every file decodes; originals and timestamped machine outputs remain private. Local transcription of original and filtered copies supplies substantive feedback for every subject. [The complete recovery summary](FIRST-TOUR-FEEDBACK-RECOVERY.md) retains scores, stop-specific points, uncertain passages and app reports. This is reviewed machine-assisted recovery, not verbatim owner confirmation of every phrase.

**Recovered themes for discussion:** anchor each stop in what the visitor sees; give dates and historical context; connect the junction/coaching/cycling and wider estate stories more clearly; use imagined colour to convey a different era rather than over-describing familiar activities. The Crescent receives 10/10 in all dimensions; the walking chapter is especially promising. Research the church/music relationship, artist/meeting-house context and historical continuity rather than padding known facts. Photographs would help the vanished cinema. Preserve the idea of separate research, curation, assembly, writing and review for later process discussion; no agent framework was commissioned here.

**Open:** the Crescent lease detail, the precise confusing turn and the sculpture/reflection distinction need short clarification. Reported microphone selection, locking/camera recording stops, Spotify interaction and manual narration starts need scoped technical diagnosis. Saved completion does not certify automatic starts. **Outcome:** no full re-recording or repeat walk requested; no content/code changes yet. Keep this outing's actual responses distinct from earlier desk preferences and await corrections before adopting detailed general rules.

### 13 Explain who acted, and check directions from the actual approach

**17 September 2026. Owner clarification of first-walk feedback:** at the Crescent, “shared responsibility and endeavour” left the development mechanism unexplained. Who developed it, who leased what to whom, and who owns/maintains the green now? A single developer is Sidi's hypothesis to investigate, not a sourced fact. The specific navigation failure was the right turn from Alexandra Grove at the Ballards Lane end: the Crescent runs parallel to the main road, so an instruction suggesting a separate earlier side street is confusing.

**Owner direction:** use maps and potentially Street View screenshots to prepare usable guidance. Irregular city street layouts should be expected, not dismissed as rare edge cases. A visible route map is a useful fallback; bad guidance is worse than no guidance.

**Engineer outcome:** [the recovery record](FIRST-TOUR-FEEDBACK-RECOVERY.md#owner-clarification-development-leases-and-the-parallel-street) now includes the clarified questions, exact installed wording, map comparison, candidate wording and limits of the council source. Shared use does not establish shared ownership or collective development. The existing appraisal does not answer the developer/lease-party/current-management questions. Earlier imagery checks concerned the stop viewpoint, not the approach junction, so they did not validate this instruction. Guidance revision 7 adds an explicit check of the historical actors and arrangements, plus map/approach-image review for spoken directions. No audio/package or phone update occurred; entry 14 records the subsequent sculpture/reflection clarification.

### 14 Welcome broader thinking, but budget its duration

**17 September 2026. Owner clarification:** both directly place-linked material and broader thinking/digressions are welcome in the same story. Cap the time spent on digressions so they do not accidentally overwhelm it. Keep the experience grounded and make being there meaningfully better than listening at home or in a hotel room. This corrects the tentative recovery question: broader reflection need not be reserved for a tour with an explicitly matching theme.

**Accepted direction:** use a time allowance and a test of the benefit from being present. **Engineer proposal, not an accepted numeric rule:** initially allow roughly 25% of a stationary story's spoken duration for broader digression, excluding directions; check the actual audio duration and label any deliberate exception during authoring. Place-specific historical context belongs to the core story, even when its subject has vanished. Guidance revision 8 separates this proposal from Sidi's principle. All three voice-recovery clarification gaps are now answered; no wholesale re-recording is required. Historical ownership/development research and navigation/app corrections remain separate next work.

### 15 Purpose correction: general authoring lessons, not Finchley polishing

**17 September 2026. Explicit owner direction:** all these comments are intended to guide how tours are built in general, not to fine-tune this particular tour. Sidi calls the result a fantastic first effort, says he “100% enjoyed it”, and learned a lot about where he lives. His perfectionism explains the detailed critique; it must not be interpreted as dissatisfaction or an unsuccessful first tour.

**Owner's main learning:** divide the work between different agents instead of trying to do everything in one pass. This is an authoring-process direction, not permission to build a speculative framework or spawn unrelated agents during documentation work.

**Superseded engineer framing:** entries 12–14 and the initial recovery summary treated several examples as candidate local research/rewrite tasks. Keep those examples as evidence for general lessons; they are not a Finchley improvement backlog. The open developer/lease/current-maintenance details illustrate incomplete research of an arrangement; they do not now commission an exhaustive title-history investigation. Candidate junction wording illustrates approach-aware guidance, not a promised re-recording or route patch.

**Outcome:** the first B walk supplies explicit positive enjoyment/learning evidence for M2. Saved completion does not prove automatic arrivals, and reported recording behaviour remains a separate product concern; neither invalidates the owner's enjoyment. Guidance revision 9 and the [proposed authoring workflow](TOUR-AUTHORING-WORKFLOW.md) organise the lessons into distinct responsibilities, handoffs and an integrated review. A remains optional comparative learning, not a required retake of B. Numeric digression budgets and the precise division of roles are engineer proposals for future use, not newly imposed acceptance gates.

## Questions to carry into a later systematic review

- Does context before anecdote usually improve the story, and when can an immediate intriguing detail work better?
- Which descriptions make the listener see the place differently? What separates useful imagined colour from generic atmosphere?
- How much walking, repeated pavement and silence is worth a stronger subject? Distinguish testing convenience from tour enjoyment.
- Can two related stops deepen a theme without repeating it? Compare the two cinema pitches in A.
- Does a contemporary community/art story feel as worthwhile as historical discovery? Does it risk sounding promotional or instructional?
- Which editorial rules came from Sidi's stable preference, which from one failed script, and which have been supported by ordinary use?

## Current outcome register

| Item | Status | Next evidence that matters |
| --- | --- | --- |
| North Finchley start/end convenience | Owner direction | Selected route actually returns conveniently |
| Pragmatic personal testing | Adopted policy | A material changed behavior or reported failure |
| Factual grounding plus light anecdote | Owner direction | Response to revised wording |
| Minor solemn memorial in this walk | Rejected | Reconsider only for a compelling new reason |
| Strongly supported imagined colour | Owner direction | Review an actual passage |
| Both tours | Owner direction to develop both; initial preference B | Completed content and ordinary-use feedback |
| Stanhope detour | Rejected; Gaumont preferred | New reason to include a passing treatment, if any |
| Product duration and spacing | Short test footprint is not a product cap; variable rhythm accepted | Actual enjoyment and walking feedback |
| B walking chapter and per-story review | Implemented; measured content and automated checks | Phone capture/playback verified; ordinary tour enjoyment and pacing feedback next |
| Distinct standing areas, access and crossings | Desk-reviewed public-exterior candidates with dated imagery; no current field claim | Current conditions during ordinary first use |
| Public-tour survey before new-area curation | Applied; comprehensive first Finchley catalogue and synthesis recorded | Reuse and improve coverage for the next area |
| Reusable place/source/story database | Explicitly planned; not implemented | Actual records and reuse requirements from the survey/two tours |
| Systematic guidelines from these options | Open learning questions | Recorded choices and actual experience; no automatic promotion |
