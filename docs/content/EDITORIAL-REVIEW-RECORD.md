# Editorial discussion and decision record

Start here when resuming tour curation or reviewing how to make systematic guidelines. Updated 21 September 2026. This is the durable history of discussion, alternatives, corrections and outcomes; [TOUR-DESIGN-GUIDANCE](TOUR-DESIGN-GUIDANCE.md) contains the current working rules. Keep evidence and owner preference distinguishable.

## How to maintain this record

For each meaningful discussion, append a dated entry with: artifact/version; what we proposed; Sidi's actual response; decision status; why it changed; affected guidance; and what remains open. Preserve rejected examples and later corrections. Capture Word comments with their anchors before summarising them. Keep originals untouched. Link revised artifacts rather than silently replacing review copies.

Use **owner direction**, **accepted choice**, **engineer proposal**, **observed result**, **superseded interpretation**, and **open question** explicitly. Approval to prepare options is not approval of the options. Lack of feedback is not acceptance. When a working interpretation is corrected, record both the earlier mistake and the correction so a future synthesis does not learn the wrong lesson.

When we take a serious look back: read this record, the captured comments and the actual examples before revising rules. Separate a general preference from a reaction to one weak execution. Compare what was proposed with what was heard or walked; do not infer tour enjoyment from desk approval. This is a local record, not a new knowledge-base service or automation.

## Evidence index

- [Initial walking-tour research](WALKING-TOUR-DESIGN-RESEARCH.md) and [original Word review](walking-tour-design-review.docx).
- [First 34 owner Word comments with anchored text](reviews/2026-09-16-owner-word-comments.json): 24 on the research review, 10 on the narration pair; document-local IDs and source-file SHA-256 retained. This committed text capture remains usable if the original commented Word files are absent from another checkout. Original commented files remain locally under `docs/content/` and are not overwritten.
- [11 tour-options comments](reviews/2026-09-17-tour-options-comments.json) and [response/development brief](NORTH-FINCHLEY-REVIEW-RESPONSE.md): the first **45 comments** across three reviews. All retain source-file hashes, local IDs and anchored text.
- [55 second-pass comments](reviews/2026-09-19-second-pass-comments.json) and [response with complete coverage map](SECOND-PASS-REVIEW-RESPONSE.md): **100 Word comments total** across four reviews. This capture adds paragraph context; a precise private transport origin is redacted while the local original is preserved.
- [Current design guidance](TOUR-DESIGN-GUIDANCE.md), revision 14 with revision history, and the [practical writing brief v4](authoring/WRITING-BRIEF.md).
- [First authoring synthesis/playbook](TOUR-AUTHORING-PLAYBOOK.md), [original Word review copy](tour-authoring-playbook-review.docx), [proposed agent briefs](authoring/AGENT-BRIEFS.md) and [source map](authoring/SOURCE-MAP.md). Preserved as the first pass; not a milestone acceptance decision.
- [Second craft pass](TOUR-STORY-CRAFT-SECOND-PASS.md), [Word discussion copy](tour-story-craft-second-pass-review.docx) and [expanded research notes](authoring/SECOND-PASS-SOURCES.md). Contrasting prose and proposed next-tour experiments are for discussion, not accepted new defaults.
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

### 16 Second tour: historical hierarchy, the present place, motives and detailed preservation

**18 September 2026.** Sidi reports the second tour complete. [Detailed recovery](SECOND-TOUR-FEEDBACK-RECOVERY.md) preserves the five stored reviews and nine recordings (15:11), with uncertain passages and the likely Torrington/Trinity labelling mismatch explicit. Both raw timestamped recognition passes are collated in one private local file, alongside untouched recordings. Do not reduce the detailed record to this index entry when later synthesising guidelines.

Recovered directions extend the first outing: establish historically significant context before subsidiary anecdotes; investigate genuinely independent source coverage for depth and subject selection (Wikipedia notability is suggested as inspiration, not a hard imported rule); connect heritage to today's businesses and condition; evoke the differences between a specific past period and today; introduce performers/institutions instead of assuming familiarity; explain the relationship between people, activity and this place; check sensory claims for internal consistency; and uncover motives so facts convey meaning. Each point's examples, qualification and uncertainty remain in the detailed record. These are general-authoring inputs, not a commissioned rewrite of Finchley.

Sidi explicitly asks to preserve generous detail/raw text for later work on agent guidelines and guardrails, potentially using another model/thinking level then. Preserve the material now; no model switch, new agent framework or rigid numerical research rule is implied. There is strong stop-specific praise for the Arcade and artsdepot; do not invent an overall A enjoyment verdict from those passages. Audio capture/Spotify and automatic-arrival questions remain separate technical issues.

### 17 Clarified: present affairs, contextualised names and grounded insight

**18 September 2026. Direct owner answers:** preserve the [full supplied wording](reviews/2026-09-18-second-tour-clarifications.md) alongside the [detailed recovery](SECOND-TOUR-FEEDBACK-RECOVERY.md#owner-clarification--18-september). All four targeted recovery prompts are answered; this does not certify every word of the original audio.

**Arcade:** re-anchoring history in current affairs is a must for future tours. Closures after a long history/preservation effort invite questions about current decline, its causes and any renewed campaign. An old family-owned jeweller and a traditional greasy-spoon café are concrete present-day subjects to research. This supersedes the earlier positive-only coda preference: truthful current relevance may include sadness and unanswered questions. No decline cause, business history or campaign is asserted without research.

**Torrington:** investigate the performers named in the clipping rather than dropping unexplained names. Their identities should inform the evoked night, music, audience and atmosphere; apply the same contextual care to people, places and organisations generally. Example genres/social groups are research questions, not preselected scene details. The owner confirms this feedback was recorded under Trinity before the actual Trinity review; preserve the stored label while interpreting review 14 as Torrington.

**artsdepot:** the existing story is nearly there. Close the final connection between why people wanted this cultural place and the wider insight/theme. Seek their stated reasons in documents; show how the small local story connects to the bigger world. High-level thought is welcome while grounded throughout. This is not a request to remove interpretation or add an unrelated moral.

**Technical clarification, separate from editorial direction:** headset-microphone recording left Spotify playing and sounded poor on headphone playback; switching to the phone microphone stopped Spotify at recording start. The earlier positive Arcade observation no longer suggests Bluetooth success. The phone path is the practical fallback; Bluetooth input/focus remains unresolved. Guidance revision 10 records the three clarified editorial directions; no Finchley rewrite or new phone session is requested by this clarification.

### 18 Authoring synthesis prepared; stop for the second pass

**18 September 2026. Owner assignment:** start the next M2 steps and progress independently. **Subsequent scope direction:** “When you're done with the synthesis, stop there - I'll make you do a second pass in extra high thinking”. This limits the assignment to the synthesis and review artifacts; technical follow-up, M2 closure and new tour authoring remain outside this turn.

**Prepared:** the [playbook](TOUR-AUTHORING-PLAYBOOK.md) and matching [Word review copy](tour-authoring-playbook-review.docx), [bounded agent briefs](authoring/AGENT-BRIEFS.md) and [source map](authoring/SOURCE-MAP.md). The source map accounts for all 45 captured Word comments, the saved research and both walks' detailed feedback/direct clarifications. Original records remain intact. No new literature search or complete audio recovery is claimed.

**Engineer proposal:** survey, research, curate with route review, write, independently review, then release and learn proportionately. Six role briefs separate survey from story research without prescribing six simultaneous agents. Concrete Finchley examples calibrate review; they do not commission rewritten tours. The actual artsdepot script already supplies 1937, so missing perceived temporal bearings must not be misrepresented as a proven absence of a date.

**Corrections retained:** supported imagined colour is wanted; wider thought belongs with the local story within a deliberate time allowance; the proposed 25% cap is not approved; present-day relevance can include decline; test economy does not cap product length; source counts are not quality scores; owner clarifications outrank uncertain transcription. Positive enjoyment and discovery remain part of the evidence alongside criticism.

**Status:** first synthesis prepared, pending the owner's requested extra-high second pass. No new model setting, agent run, physical test, code change or milestone acceptance is implied. The living guidance remains authoritative; the operational sequence and briefs remain proposals.

### 19 Second pass: story discovery, wider craft and more hand-built tours

**18 September 2026. Owner request:** return to the synthesis with deeper thinking, take his comments and sources into account while looking beyond them, and prepare a document he can react to. Questions and collaborative development are welcome. Several dictated phrases were unclear. The engineer's explicit working interpretation is two more hand-built **tours** and wider lessons from storytelling/writing/film; a clarification was sent rather than treating that interpretation as an owner-confirmed statement. A separate optional question asks whether to use familiar or unfamiliar areas; neither answer is assumed.

**Prepared:** [Making a walk worth taking](TOUR-STORY-CRAFT-SECOND-PASS.md), its new Word copy and [source register](authoring/SECOND-PASS-SOURCES.md). Original review documents and raw comments remain unchanged. New research includes an interest-study abstract, first-party radio and tour guidance, documentary-maker/editor accounts, artists' descriptions and a published 99% Invisible transcript. Reading scope and limits are recorded; no new listening, film viewing or physical-tour evidence is claimed.

**Engineer analysis:** the first pass organised responsibilities better than it explained how to discover and tell a compelling story. Strengthen competing research questions, specific details, the relationships between stops and positive editorial ambition. Keep several possible forms rather than requiring conflict at every stop. Sources provide techniques and counterexamples; they do not supersede Sidi's preferences or prove an ideal formula.

**Concrete discussion material:** three original Crescent treatments using the existing evidence and its unresolved ownership limits; a Torrington research probe using an attributed artist biography and primary chart record to change the story pitch; artsdepot as an example of a writing problem needing further research; one proposed question-led tour and one place-portrait tour, prepared sequentially. These are craft sketches and briefs, not rewritten packages, chosen destinations or a controlled comparison. One familiar and one unfamiliar area is an engineer preference pending Sidi's convenience and choice.

**Proposed process changes:** researchers preserve decisive details and alternative explanations; writing can return focused questions to research; the lead edits the whole narrator/route experience; independent review reads central source material rather than approving another agent's summary. Add the moment worth preserving, an alternative treatment and the unknown that would change a decision to existing handoffs. No agent framework is implemented and no new agent tasks are launched by this paper.

**Status:** second discussion paper prepared for owner reaction. Existing living guidance remains authoritative; new craft choices remain proposals. No app behavior, audio package, technical acceptance or M2 closure status changes. Next practical decisions are the desired feel and actual area/time brief for the next tour, followed by survey-first preparation.

**Verification:** ten-page Word copy rendered and visually checked; its text matches the Markdown paper. All 12 numbered references are cited and defined; 159 local links/anchors across the changed text files resolve. The three owner-commented source documents retain their recorded hashes. `npm run docs:check` and whitespace checks pass. This documentation-only assignment needs no app build or physical test.

### 20 Second-pass owner review and the authoring workshop

**19 September 2026. Source:** `tour-story-craft-second-pass-review sidi comments.docx`, comments 0–54. All 55 comments and their anchors/context are captured. The Word body matches the reviewed paper; no tracked insertions/deletions. The [full response](SECOND-PASS-REVIEW-RESPONSE.md) covers every ID, preserves rejected prose and answers the methodological questions. Both original and commented documents remain untouched.

**Owner direction:** lean towards an insightful documentary with warmth, taking 99% Invisible's research, writing and narration as a reference across the programme. The five story forms are strongly welcomed. Let research deepen and enrich findings autonomously or through writer/lead questions. Seek why-led insight, but allow a charming detail or anecdote without a thesis. Add at least one moment of levity unless the tour is deliberately sombre. A theme can be loose or lightly retrofitted; discovery and oddities are worthwhile.

**Walking narration:** central to the experience, not just transitions or spare material. Broader stories can connect once or twice to visible surroundings; the next tour should have **two narrated legs**. Sidi recalls eventual driving tours as part of the longer-term ambition, without commissioning driving work now.

**Voice and evidence corrections:** contextualise names and supply narrative bearings; vary sentence rhythm. B is the preferred Crescent treatment, with C before or after it. A is monotonous as a story and useful only as short context. Remove the ownership/buyer disclaimers, vague attribution and internal editorial rationale from narration. The owner permits reasonable historical inference and period-informed reconstruction, including inference from adverts; do not interpret evidence discipline as a demand for eyewitness proof of every detail. Qualitative evidence judgements are the engineer's proposed implementation, not invented numerical confidence or a changed package schema. The time-allowance approach is accepted as a start; the 25% cap is not adopted, and a qualitative approach may prove better.

**Direct clarification after comment 20:** asked whether the next brief should also explore invented dialogue or composite characters, Sidi selected **“Start with reconstruction and atmosphere”**. This selects the initial writing experiment, not a permanent ban on fictional forms. The brief records the distinction between vivid reconstruction and falsely attributing a specific documented incident to another place. Physical navigation remains literal.

**Editorial outlook:** be upfront about AI generation; the app may reflect Sidi's values, while the narrator does not invent personal tastes or lived experience. The values themselves are to be developed; his example slogans are not selected. This is product/editorial direction, not an implemented disclosure UI or a claim that AI provenance establishes accuracy.

**Survey and assembly:** broaden discovery to guides/books and present-day places, with a varied tagged candidate pool and a disciplined programme suitable for dense and sparse areas. Sidi asks whether assembly deserves its own function. The engineer proposes separating place/story research, curation and assembly decisions, while reusing agents where practical. The [source-family sweep and gap pass](AREA-TOUR-SURVEY.md#bounded-search-programme-for-the-next-area) are initial adjustable work budgets, not completeness claims or accepted numerical quotas. A small comparative study of walking books is recommended, with no books acquired or private material uploaded in this review. Bounded imagery review is a promising future task; mechanism, rights and cost need concrete evaluation before automated collection.

**Workshop decision:** Sidi takes the editorial lead/orchestrator role to learn through choices and iteration. The engineer handles task preparation/execution, batches meaningful options and records selections, reasons and revisions. The [writing brief](authoring/WRITING-BRIEF.md) is prepared as a usable first draft, not a finished style theory. Current [agent briefs](authoring/AGENT-BRIEFS.md) reflect this handoff. No agents were launched and no full tour was generated by this review.

**Next-area preference and feedback:** anywhere is open; convenient public transport from N12 is a bonus, not a restriction to the immediate neighbourhood. No destination, outing length or travel time is selected. Retain the explicit prompt about a remembered moment, changed view of a place, and a dragging/confusing stretch; the next experiment also asks how walking narration fitted the walk. A response at every stop is not required.

**Outcome:** guidance revision 11, a full response, practical writing brief, bounded survey programme and current role briefs. Focused primary-source checks support the responses about 99PI pitching, researching elsewhere, Cardiff/Miller and current Otway/Barrett touring. The former Finchley packages, app code, physical acceptance and separate recording issue remain outside this editorial assignment.

**Verification:** all 55 comment texts match the source apart from the disclosed private-origin redaction; every comment anchor/reference is present, and all 100 IDs are mapped once within their source document. All four owner-document hashes still match their captures; the original second-pass paper is unchanged. The commented Word copy was rendered and all ten pages inspected. All 251 local links/anchors across the changed Markdown resolve; `npm run docs:check` and whitespace checks pass. No app build or physical test was needed.

### 21 A visible agent authoring pilot

**19 September 2026. Owner instruction:** after asking how a writing brief becomes an agent prompt, how long assignments are and what coordination is needed, Sidi approved trying the workflow on one stop story and one walking chapter. The [pilot record](authoring/pilot-2026-09-19/README.md) preserves the actual task files, launch/follow-up messages, evidence, drafts and review. The engineer chose existing Finchley material for this bounded exercise; it does not select the next tour area or reopen an installed-tour rewrite programme.

**Execution:** separate agents researched artsdepot and the Meeting House–Moss Hall walking leg in parallel. A writer received both evidence packets plus the writing brief and calibration examples; a fresh reviewer independently read central sources, route constraints and the completed scripts. Each had named output ownership. The task files are 322–357 words, excluding shared instructions and supporting material; the research packets together are about 5,400 words. No exact token-use or cost estimate is inferred from word counts.

**Material discoveries:** contemporary reporting of artsdepot director Alison Duthie's 2004 plans supplies particular uses and a meeting-place aspiration, distinct from claiming unanimous residents' motives. An 1886–87 directory locates ladies' education establishments on Alexandra Grove, supplying an ordinary-life foundation for reconstruction without identifying a surviving doorway. The route handoff tightens the proposed speech budget from the measured historical chapter and saved launch geometry. Research is not proof of current physical access or audible timing.

**Review and coordination:** the frozen first draft has no material factual defect identified in its main scripts. The independent review catches a missing Moss Hall introduction when the optional railway opening is substituted; the writer resolves it in V2, preserving the main scripts and V1. The complete alternative is 278 words including navigation. A preliminary read encountered wording still being edited, so the final review explicitly records the finished draft hash and excludes superseded concerns. This demonstrates the usefulness of a ready signal and checking a replacement in its full context. It does not establish improved enjoyment or prove that more agents always improve results.

**Owner choices:** the [sample packet](authoring/pilot-2026-09-19/REVIEW-PACKET.md) asks about a warmer versus more concrete artsdepot ending, and a street-led versus railway-led walking opening. The engineer's suggested starting choices are labelled as proposals. Sidi's selection and reasons remain pending. No additional research question was needed from the writer on these supported angles; no artificial question loop was manufactured.

**Scope at completion of the prose pilot:** documentation and original desk prose only. No app code, package, source Word document or physical-test result changes. Audio had not yet been generated or heard; the subsequent listening request is recorded below. Exact pedestrian entry at the known Crescent turn remains a later-use issue. The pilot introduces no database, orchestration service, new paid dependency or new outdoor test request.

**Verification:** 196 local links/anchors across 17 Markdown files resolve; JSON and baseline fidelity checks pass. The coordinator verified the frozen draft hash, unchanged main scripts, exact sample-packet text, task word counts and the complete 278-word alternative. All four owner Word sources retain their hashes. `npm run docs:check` and whitespace checks pass; no app build or physical test was run.

### 22 Pilot recordings in George and Emma

**19 September 2026. Owner request:** record the two samples, one in George and one in the other auditioned voice. The engineer assigned **artsdepot to George** and **Alexandra Grove to Emma**, using the main versions and including the walking chapter's candidate direction. This request does not select either editorial alternative or replace the previously chosen George voice for installed tours.

**Outcome:** [two local MP3s and exact transcripts](authoring/pilot-2026-09-19/audio/README.md), with source version, model/settings, chunk records and hashes. Artsdepot is **123.650 seconds**; Alexandra Grove is **97.650 seconds**. The same cached free Kokoro setup generated both at speed 1 and a common loudness target. No subscription use, upload, phone playback or package update occurred.

**Rendering correction:** the existing model-token guard stopped the first walking attempt. The long estate paragraph was split at a sentence boundary without changing words, and the full recording then succeeded. George's completed PCM was retained and reused after input/settings checks. Emma's measured pace is faster than the writing estimate; this is not owner feedback about how the narration feels or field evidence of its route fit.

**Verification:** both MP3s decode completely; encoded durations agree with all rendered chunks and pauses. Text fidelity, voice settings, file hashes, type checking, lint, guide consistency and whitespace checks pass. The source packet now displays measured timings. No app build or physical test is needed for these desk samples. Listening reactions and the two editorial choices remain pending.

### 23 Pilot listening response: reveal the unfamiliar and preserve the story

**19 September 2026. Source:** Sidi's direct response to both recorded samples, preserved in full with distinctions between decisions and proposed application in the [pilot owner-feedback record](authoring/pilot-2026-09-19/OWNER-FEEDBACK.md). This is general tour-authoring guidance drawn from specific examples. It adds no Word-comment IDs and commissions no installed-tour rewrite.

**Strong clarification on evocation:** decide first what the listener could not readily picture from normal life. Use a scene to supply that missing understanding. Gaumont's wood panelling begins well but the distinctive experience of a cinema visit in that period remains underdeveloped. The school is a welcome discovery and vignette subject, but opening books and moving chairs feel universal and waste the opportunity. Plausibility alone is insufficient; this sharpens the positive instruction to reconstruct vanished life rather than withdrawing it. The actual differences remain research questions, not licence to invent unusual practices.

**Preserve gains and vivid material:** the artsdepot explanation improved, but plans and intentions became repetitive while protests, masks and the remembered free Madness gig disappeared. The campaign material still existed in the research handoff; this was a selection/integration failure. Future revisions should compare their gains and losses, make room for supported action, and remove repetitive explanation. The saved evidence's limits remain: the reported appearance comes from the institution's history, admission terms are not separately established in the local handoff, and the council account qualifies the older simplified library-versus-arts story.

**Editorial choices and pacing:** Sidi **leans towards a warmer artsdepot ending if better written**, not approval of the existing wording. About two minutes feels somewhat long but acceptable for some especially important or interesting stops; this is not a default or hard cap. He **prefers the railway-led Alexandra Grove opening** for context and the sense of a proper introduction, superseding the engineer's street-led recommendation for this sample.

**Fill the explanatory gaps:** the rail journey needs a comparison with travel before the train, and suburban development needs a picture of what occupied the land before the houses. Seek the relevant before-state and comparable journey endpoints/mode/period, not an invented duration or generic assumption about estates. This generalises the earlier instruction to give statistics useful context.

**Application and limits:** living guidance revision 12, writing brief version 2 and current agent briefs carry these directions into the next assignment. The earlier briefs already asked for distinctiveness and period differences: the pilot shows a need to apply them to actual passages and compare revisions, not proof that adding more instructions will solve the problem. Original assignments, drafts, audio, metadata, baseline and research remain historical artifacts. No new historical answer, audio rendering or physical-test result is claimed.

**Verification:** changed-document links/anchors, consistency and whitespace checked; the retained pilot scripts/audio/research and original owner Word documents are unchanged. Guide consistency passes. Documentation-only capture needs no app build or phone session.

### 24 Period context, relevant comparisons and curation within a story

**19 September 2026. Source:** direct follow-up, retained verbatim in the [pilot feedback record](authoring/pilot-2026-09-19/OWNER-FEEDBACK.md#follow-up-clarification-period-context-and-selection-within-a-story).

**Owner clarification:** a revealing school vignette need not depend on something unique to that institution. Research what a girls' school in the relevant period was like compared with the listener's experience today. The named local school can provide the entry into that broader history. Evidence appropriate to period and type can support reconstruction, while precise local claims retain their own support requirements.

**Relevance correction:** explain the earlier condition when it makes the chosen fact interesting or understandable. Sidi's familiar present-day half-hour journey illustrates why the rail figure alone says little: the pre-rail contrast is the potentially interesting part. The earlier guidance was too categorical. No current timetable, earlier journey duration or specific school practice has been researched in this discussion.

**Curation direction:** select among the facts, scenes and explanations gathered for a place, weighing comparative merits and how the pieces combine into a harmonious narrative. This extends beyond preserving an earlier anecdote or choosing a stop. A large source collection must not become a spoken laundry list.

**Proposed method:** the [short selection pass](authoring/WRITING-BRIEF.md#select-material-within-the-story) uses a provisional story promise, a shortlist of promising pieces, complementary selection, an ordered outline with intelligible joins, and a final flow/subtraction check. Keep a reason for consequential omissions and use existing evidence references. The writer/curator can do this in an ordinary note; no scoring system, fixed story formula, new agent or infrastructure is commissioned. The method is an engineer proposal, not an owner-approved permanent process.

**Outcome:** guidance revision 13, writing brief v3 and role briefs incorporate the clarifications. Original prose/audio and research stay available for comparison. Links, guide consistency and whitespace checked; no app or physical test is relevant to this documentation update.

### 25 Focused revision, thinking effort and the next area

**20 September 2026. Owner instruction:** Sidi approved the proposed next steps, asked about thinking level and delegation, then switched to Extra High and instructed the engineer to carry on. The [revision brief and saved assignments](authoring/revision-2026-09-20/BRIEF.md) preserve the scope: one focused revision of the two workshop samples, new-area discovery and useful technical preparation. This does not turn all feedback into an installed Finchley rewrite backlog.

**Effort and collaboration:** Extra High is the recommended single setting for this editorial batch; High is ordinarily sufficient for bounded research/review, with Extra High useful for synthesis and difficult causal reasoning. Routine rendering needs less deliberation. These are engineering judgements, not measured model comparisons. The two original research launches were interrupted by the setting change; replacement research, the writer and subsequent delegated work explicitly use Extra High. Separate research handoffs precede one writer; independent review follows a frozen draft. More agents do not replace selection, integration or the owner's editorial judgement.

**Material recovered:** the [cinema/campaign packet](authoring/revision-2026-09-20/ARTSDEPOT-RESEARCH.md) supplies the Gaumont's scale, rising organ and opening double bill, with the masks/banners/Madness account and its qualifications. The [walking packet](authoring/revision-2026-09-20/WALKING-RESEARCH.md) supplies the earlier coach duration, different journey origins, estate landscape and a more distinctive period educational context. These expand the choices available to the writer; they are not a requirement to narrate every fact. The exact local school curriculum remains unknown, and “free” is not established for the Madness appearance.

**Area decision:** the [three-area comparison](authoring/revision-2026-09-20/NEXT-AREA-OPTIONS.md) starts with public walks. Sidi selected **Clerkenwell / Farringdon**, agreeing with the engineer's recommendation. Hampstead and Spitalfields remain alternatives rather than rejected areas. That choice selects no theme, itinerary, duration or final stops. The [Clerkenwell survey brief](survey/clerkenwell-2026-09-20/BRIEF.md) assigns public operator/guide discovery and local heritage/current-context discovery separately, before consolidation and our own assembly options. The next complete tour retains the two-narrated-leg brief.

**Technical work stays distinct:** the [M2 evidence review](../test-results/M2-closure-review-2026-09-20.md) and [prepared short phone session](../test-results/M2-next-technical-session.md) preserve the reported headset failure and unobserved audible review resumption. No phone connection, listening test or repeat outing was requested in this batch. Existing enjoyment evidence does not establish unrecorded automatic arrivals, and desk writing does not close M2.

**Completed sample revision:** [the exact scripts](authoring/revision-2026-09-20/SCRIPTS.md) retain the writer's 291/266 words after independent review found no required prose change. The school paragraph's 590 model tokens exceeded the 512-token limit; the coordinator added one sentence-boundary paragraph break before the academic contrast, changing no words. New [George/Emma audio](authoring/revision-2026-09-20/audio/README.md) measures 121.725/101.575 seconds. The complete files pass text/chunk, hash, duration and decode checks. Improved enjoyment, pronunciation and the warmer ending remain owner listening judgements; no preference is inferred from generation.

**Survey and second decision:** the [Clerkenwell survey](survey/clerkenwell-2026-09-20/README.md) records all six source families, explicit partial/inaccessible material, 19 differentiated walk/guide/visit records and 84 consolidated discovery entries. The three gap checks concern current Smithfield works, everyday present life and an archival trail behind flower work. Sidi then chose **Working lives, hidden in plain sight** over *Making room for a better life* for the first tour. This selects a provisional portrait of markets, making, print, livelihoods and Exmouth today; exact stops, route and scripts still need research and assembly. The alternative remains parked, not rejected. No withheld book purchase or exhaustive archival investigation was needed to make that choice.

### 26 George throughout and a Clerkenwell outing worth the journey

**20 September 2026. Direct owner message:** “let's use george in general, just a little bit more pleasant. And let's make sure we have all we need to be thorough - it takes me an hour to get to clarkenwell so let's make it count”.

**Decision:** George is the general voice, including walking narration. Retain the Emma sample as comparison history; do not infer that its faster delivery sets a George chapter's budget. The voice preference alone does not approve the new script's content or ending.

**Application:** prepare the selected working-lives tour as a worthwhile outing. Invest in the strongest stories, current context, views and actual pedestrian approaches; complete the available offline/technical checks before requesting travel. The owner-provided journey estimate is a planning input, not a measured timetable. Avoid filler, unnecessary detours and test outings merely to complete a checklist.

**Duration decision:** asked about time in Clerkenwell excluding travel, Sidi selected **about 75–90 minutes**. Budget walking, listening and looking together without double-counting simultaneous walking narration. Longer interior visits can be optional; do not stretch stories to fill the target. The [focused research/route brief](authoring/clerkenwell-2026-09-20/BRIEF.md) carries this into the next stage.

Guidance revision 14 and writing brief v4 carry this direction forward. The existing pragmatic testing policy remains in force. Detailed research and route assembly follow the selected area/promise; no full package or current access is accepted by this discussion.

### 27 Complete Clerkenwell preparation and review outcomes

**20 September 2026. Execution of the existing owner brief:** the [complete authoring record](authoring/clerkenwell-2026-09-20/README.md) collates the survey, source packets, selection, writer assignment, frozen V1, fresh review, final corrections and navigation check. The final package has eight exterior stops and two walking passages, all in George. Start at Charterhouse after the mapped Farringdon approach; finish at Exmouth. The relaxed 75–90-minute allowance combines movement, 14m42s of stationary speech/directions and time to look, with the walking speech concurrent. It is not a promise of ninety minutes of content or a requirement to visit interiors.

**Consequential corrections:** fresh review found a buyer-attribution error in the flower stock account, an unsupported distinction between interviewers, and wording that could imply local manufacture through Ingersoll's showroom. All were corrected with matching evidence. The chapel gained a brief current church identity; repeated chair/notes-to-speech explanations were shortened while retaining the vivid material. Space EC1 gained its checked street number. These examples show why exact source links alone are insufficient and why review can improve clarity without increasing hedging.

**Route/writing coordination:** an initially inappropriate Clerkenwell Road crossing was replaced with the pedestrian signals by Old Sessions House. The selected walking corridors follow mapped pavements; the final Rosoman crossing instructions were independently checked. George's actual 65.8/64.8-second clips leave 15.31/40.89-second reserves from the latest launch at 6 km/h. These are authoring budgets, not evidence of current native GPS or acoustics. Skinner remains a bus street. The records retain rejected raw routes and the difference between map/imagery candidates and actual field observations.

**Technical outcome and owner burden:** [guide 12/source `9505427915e2d1df`](../test-results/M2-clerkenwell-tour.md) contains three tours, 22 audio entries and both offline map areas. All 153 automated tests and both APK builds pass. Current native dependencies remain pinned; Expo's recommended patch updates are recorded rather than introduced during this content handoff. One combined 10–12-minute phone session is prepared for the new area's drawing/selection and the already-pending headset/Spotify and review-resume observations. No new reconnaissance or repeat Finchley outing is required. A phone-connection availability question is pending; no sound will start without a separate fresh listening response.

**Discussion status:** the [process lessons](authoring/clerkenwell-2026-09-20/README.md#what-this-teaches-the-process-provisionally) are coordinator observations from this execution. Sidi has not yet judged this completed tour, its reconstructed scenes, duration or walking passages. Preserve his next reactions before turning these observations into systematic guidelines. M2 remains open; neither E1 comparison nor the later automated factory has been completed by this hand-built tour.

## 28. Clerkenwell phone handoff — 20 September 2026

**Outcome:** the [combined device session](../test-results/M2-clerkenwell-phone-handoff.md) installed guide 12 and checked the new offline area while preserving earlier work. Sidi confirmed Spotify stopped for EarFun recording, the saved sentence was clear with normal headphone output, and saving Review continued the earlier narration. The historical outdoor headset failure remains unexplained. Clerkenwell is selected, unstarted and ready for the outing; no finished-tour editorial feedback or M2 closure is inferred.

**Process lesson:** setup/tool round trips made this session longer than its estimate. Keep physical cases narrow and improve operator preparation rather than enlarge the checklist. No phone-input comparison was needed after a usable headset sample. Future authoring guidance should still be informed by the ordinary walk, not the successful installation.

### 29 Highgate station to Hampstead — a second complete new-area tour

**21 September 2026. Owner direction:** build the other tour because Hampstead may be easier to do today; subsequently start at Highgate, clarified explicitly as **Highgate Underground station**. George remains preferred. The [complete authoring record](authoring/hampstead-2026-09-21/README.md) links the survey, selection, evidence, writer assignment, frozen draft, independent reviews, final edits and practical guide. The initial Hampstead loop was superseded; this is not permission to pack two full village tours into one.

**Application, not an additional owner decision:** Room to breathe crosses the southern Heath from Highgate station via Pond Square and the ponds to Willow Road and Keats, with two short walking passages. The mapped finish is Hampstead Heath station, with a written Northern line return alternative. About 4.1 km and 85–100 minutes reflects actual walking and narration, not a strict inherited Clerkenwell duration cap. No owner approval of this title, exact selection or final prose is implied by his start-point choice.

**Research/curation:** the public survey precedes own selection and distinguishes complete routes, partial listings and unread paid material. The oath's props and beer exception, elm water pipes, Coleridge's ceaseless conversation, a specific Moore sculpture and Huxter's attempt to share birdsong supply concrete detail. The final edit gives the named Keats ode a short explained image. Broader reflection stays attached to those details. Wells/Burgh, Kenwood, the Pergola and other detours remain documented alternatives, not discarded evidence or padding to meet a stop quota.

**Independent review changed the delivery:** route imagery moved walking speech off Merton Lane, which lacks a continuous footway. A provider shortcut at East Heath Road was corrected to complete the zebra before following the pavement. The pond-island view was not sufficiently established, so the prose does not direct the visitor to find it. The original writer draft and final changes remain separate, allowing comparison after owner feedback. These are useful process observations; enjoyment, warmth and the actual place value remain unobserved.

**Verification and next evidence:** all 161 tests, media checks and both builds pass; the [result record](../test-results/M2-hampstead-tour.md) keeps the silent new-area handoff separate from this evidence. Prior accepted EarFun/Spotify and review-close behavior is reused. The owner can simply take the walk; no mandatory per-stop notes or extra technical outing. Afterwards discuss what worked, current orientation and how both walking passages fitted, then extract general lessons alongside Clerkenwell rather than automatically polishing this route in isolation.

### 30 Highgate/Hampstead silent handoff and map opening

**21 September 2026. Owner connected the phone for delivery.** The [handoff](../test-results/M2-hampstead-tour.md) installed and checked the new tour offline, preserving the existing catalogue/progress. The larger area revealed that centring the map on the extract could show no route at all. A small correction makes authored maps open on the whole route; the corrected Highgate and retained Finchley views were observed on the phone. The planned short session overran because that concrete issue needed a rebuild, not because another audio or field-test matrix was added.

**Final state:** Highgate selected/unstarted, automatic narration on, tracking stopped; original network settings restored and the phone released. No new listening/content reaction is implied. The useful process lesson is to inspect the actual opening view, not treat a “map rendered” flag as evidence that the screen helps orientation. Ordinary walking feedback remains the next content/route evidence.

### 31 Making discovered issues durable

**21 September 2026. Owner question:** while building tours, how do we prevent issues such as map centring recurring, or ensure they are flagged for later correction?

**Audit and response:** the camera correction is shared code and was observed on two routes, with a retained result record. The general 161-test suite does not specifically guard camera opening. Existing records already preserve defects and uncertainty, but discovery depended too much on finding individual historical documents. A short [known-issue index](../ISSUES.md) now links material issues, evidence, recurrence safeguards and concrete revisit triggers; repository startup instructions and agent handoffs point to it. It initially consolidates recent M2 follow-ups, not every historical issue.

**Scope:** documentation only; no app change, extra phone session or new test campaign. Reproducible logic failures should gain useful automated regressions; visual/native outcomes need appropriately scoped observation. Editorial lessons still feed living guidance and writing briefs. This organizational improvement does not claim to make recurrence impossible or mark unresolved field behavior fixed.

### 32 Retrospective log across both project conversations

**21 September 2026. Owner direction:** keep one general log of known issues and fixes for later generalisation and the automated tour builder; go back through this conversation and the previous one, organised around agent functions.

**Completed response:** expanded the existing [issues log](../ISSUES.md) across research, curation, writing, routing, review, media, maps/packages, runtime, feedback and delivery. The lead reviewed user messages and recorded answers from the foundation/M1 and M2 conversations; three bounded audits reconciled the retained editorial, route and engineering records, including the existing 100-comment index and both feedback recoveries. Entries retain concrete examples, actual responses, evidence limits and future safeguards. The five existing issue IDs remain; this is one cross-function entry point, with detailed evidence still in its original records.

**Important distinctions retained:** criticism is general learning alongside the first tour's demonstrated enjoyment; imaginative reconstruction is permitted and should reveal unfamiliar experience; the numerical digression budget remains unapproved; the short-test request is not a tour-duration cap. A later headset pass does not explain its field failure, saved chapter completion does not prove automatic launch, and general passing tests do not establish a camera regression. The original M1 acceptance conditions remain historical evidence under the later personal-use testing policy.

**Reuse and scope:** startup instructions, role briefs, the playbook and M4/M5 roadmap now point to applicable log entries. This documentation task did not change the app, installed tours, phone or milestone acceptance; it did not initiate a database, automation framework, fresh transcription or more physical testing.

### 33 Short Queensway demonstration

**21 September 2026. Owner brief:** a dinner-time demonstration for a friend near 46 Queensborough Terrace, three stops or four at most, with one walking story. Asked about duration, Sidi selected 20–25 minutes. George remains the chosen voice. No dinner time was supplied, and the route does not rely on admission or park opening.

**Application:** [Behind the façades](QUEENSWAY-TAKE-THE-TOUR.md) uses QUEENS, Whiteleys and Leinster Gardens, with one brief architecture passage and a return near the dinner address. The actual route is about 1.21 km; 16.5 minutes of movement plus 3m45.5s of stationary speech leaves a little looking/crossing time. The 30.5-second chapter runs concurrently with walking. The cathedral alternative required 23 minutes of movement before speech and was dropped on route cost; no fourth filler was added.

**Separate handoffs changed the result:** survey preceded selection; research and writing were separate. Source review visually checked the party photo and corrected the museum-alt-text-based costume claim without losing its memorable detail. Route review corrected a discovery pin, moved speech away from small crossings and caught the first of two Queen’s Gardens mouths when setting the chapter guard. Final review read the assembled plan and script; preserved writer drafts let us compare what changed. [Complete authoring record](authoring/queensway-2026-09-21/README.md).

**Delivery/evidence:** local George files are fully decoded and timed, and all 166 tests pass. [Build and phone status](../test-results/M2-queensway-tour.md) is maintained separately. This is a social outing: no per-stop recording requirement, extra listening battery or technical field test. Reuse prior unchanged native/headset evidence. The bounded checks, corrections and limits are added to the general issues log; a successful build is not enjoyment, current route clearance or an automatic-launch result. M2 closure and E1 remain separate work.

### 34 Queensway silent phone handoff

**21 September 2026. Owner connected the phone for delivery.** The prepared self-contained build was installed in place and verified byte-for-byte. With Metro absent and Android reporting no active network, the app cold-opened Queensway and drew the complete route, three markers and return in its initial map view. The first reader’s approach and two-stage crossing instructions were inspected offline. The existing shared camera correction worked without further app changes.

**Handback:** Queensway selected/unstarted, automatic narration on, tracking stopped; original network settings restored and read back. The phone was released after approximately nine minutes of device checks. Existing entries remain available; no walk/review reset. No audible test or extra outing was requested. A minor first-approach spacing defect is retained for the next content revision; the general review log now explicitly includes all visitor-facing fields. [Exact result and limits](../test-results/M2-queensway-tour.md#silent-pixel-result-21-september). Ordinary demo enjoyment and automatic street triggering remain unobserved.

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
| Strongly supported imagined colour | Owner direction; pilot clarifies that a scene must reveal what ordinary experience would not supply | A future passage that delivers that specific understanding |
| Both tours | Owner direction to develop both; initial preference B | Completed content and ordinary-use feedback |
| Stanhope detour | Rejected; Gaumont preferred | New reason to include a passing treatment, if any |
| Product duration and spacing | Short test footprint is not a product cap; variable rhythm accepted | Actual enjoyment and walking feedback |
| B walking chapter and per-story review | Implemented; measured content and automated checks | Phone capture/playback verified; ordinary tour enjoyment and pacing feedback next |
| Distinct standing areas, access and crossings | Desk-reviewed public-exterior candidates with dated imagery; no current field claim | Current conditions during ordinary first use |
| Public-tour survey before new-area curation | Applied; comprehensive first Finchley catalogue and synthesis recorded | Reuse and improve coverage for the next area |
| Reusable place/source/story database | Explicitly planned; not implemented | Actual records and reuse requirements from the survey/two tours |
| Systematic guidelines from these options | All 100 Word comments indexed; revision 14 and writing brief v4 incorporate direct feedback, George and the Clerkenwell brief | Try and assess the proposed selection pass within a story |
| Pilot editorial choices | Railway-led opening preferred; warmer ending conditional on better writing; revised scripts and audio ready | Owner reaction to the revised comparisons, scenes, campaign and ending |
| Two narrated legs in the next tour | Implemented in Clerkenwell; actual George timing and deterministic replays pass | How both passages launch and fit during ordinary use |
| Authoring workshop | Sidi takes editorial lead; engineer prepares and executes | Record consequential choices and useful revisions; no permanent agent count assumed |
| Next complete tours | Clerkenwell Working lives installed; Highgate/Hampstead Room to breathe installed and cold-verified; both George, two passages | Ordinary outings: enjoyment, practical feedback and how the walking passages launch |
| Editorial values and AI provenance | AI provenance visible in the Clerkenwell introduction; values still developing | Develop the outlook from actual editorial choices and feedback |

## 6 October 2026 — first local generation prototype

**Owner direction:** build a bounded local workflow and a proposed daytime, 60-minute Farringdon-to-Farringdon Clerkenwell loop for a visitor with little neighbourhood knowledge and an interest in ordinary lives. Routine theme/route choices were delegated; endpoints, time envelope, evidence and the US$0 direct ceiling remain binding. This selects reversible handoff defaults, not validation of the process or permission for the wider factory.

**Applied candidate:** the [six-stop plan and recordings](generation/PILOT.md) use station/Smithfield, Booth panels, Johnson at the Gate, cooperation at the Green and flower-making at Woodbridge Chapel. Shortening the earlier open route earns the return within the hour. Quiet legs are a calibration choice rather than the older two-chapter experiment; no enjoyment result selects that choice for future tours. Research begins with the existing Clerkenwell public-tour survey.

**Review correction:** independent retained-source review caught physical directions labelled editorial and a too-narrow flower-process excerpt. [Repairs and limits](../../content/generation-pilot/REVIEW.md) preserve the script’s qualifications and distinguish real supporting passages from source links. The current candidate remains blocked for exact exterior positions, final acceptance and listening. No distinctive anecdote was invented to meet the requested style; no walk, listener judgment, live subscription generation or matched comparison is claimed. See [actual results](generation/RESULTS.md).

## 6 October 2026 — live role reviews and one bounded correction

**Owner direction:** proceed through implementation/testing/review while Sidi is away, and retain per-agent token costs. This does not supply a listening or enjoyment judgment.

**Observed review:** live fresh-context roles found lost approximate headcount, overly specific rails, training/proficiency ambiguity, unqualified hour wording, insufficient evidence excerpts and a return direction inconsistent with route geometry. The [supplemental research](../../content/generation-pilot/review-evidence/SOURCE-REPAIR.md) reopened primary notebook images and relevant sources, distinguishing recovered context from missing facts. [One consolidated correction](../../content/generation-pilot/review-evidence/correction-batch-2.json) restores qualifications and maps supporting context into new claim/script revisions. Three texts changed; no original audio/package was overwritten.

**Producer assessment:** missing excerpts did not prove the stories false. Model agreement is not corroboration. Whole-paragraph factual labels can include documented interpretation, so generic demands to split every sentence are not automatically adopted; the introduction's mixed itinerary/physical evidence and remaining source gaps still need precise review. The role tester lacked raw artifacts; engineer-run parser/hash/import tests supply separate actual evidence. Its broad testing suggestions do not override the personal-use policy. Optional style changes are frozen at the allowance. The Old Sessions House direction and visitor-position/current-access gaps remain required, not matters of taste. No observation of enjoyment, final listening or walk acceptance has been made. [Results and exact role returns](generation/RESULTS.md).


## 7 October 2026 — fresh Hampstead factory assignment

**Owner direction:** finish, build and test the local multi-agent tour factory while working autonomously. Use a fresh Hampstead tour, 60 minutes, no walking constraints; do not reuse previous material. This supersedes the earlier factory sequencing restriction for this local assignment. The engineer chooses routine route/theme details; the proposal is a station-to-station public exterior loop. Existing US$0 direct paid usage and offline/privacy boundaries remain.

**Application:** the factory starts with an empty authored-input manifest and performs a new survey, research and selection. Existing player, bundled map and local George are reusable infrastructure. Independent exact-draft reviews, evidence qualification, measured duration and applicable walking-narration windows are enforced by the toolchain. Recorded desktop review does not establish listening enjoyment or an actual walk. [Assignment, execution and limits](generation/factory/PLAN.md).

**Observed outcome:** the first fresh run retained a published-tour survey and actual page/map/image research, then stopped before route approval after integration failures. The corrected visual evidence contract validates the retained report locally, but independent content review, scripts, listening and enjoyment remain unobserved. The owner subsequently approved 45 minutes total; original start, non-time limits and usage remain intact. [Detailed evidence and limits](generation/factory/RESULTS.md).


**7October continuation — owner direction and observed result:** Sidi authorized duration extensions and autonomous completion, then requested another wholly fresh generation around Highgate after the fixes, measuring time and per-agent token use. This is a request to exercise the factory, not approval of any particular Highgate stories or of the Hampstead content.

Hampstead now has four actual George recordings and accepted factual/production-editorial reviews. Its measured narration is5m28 and the complete estimated experience31m28, materially below the requested hour. No enjoyment or listening judgment was supplied. Complete canonical next-leg directions and producer-owned status fixed contradictions between the writer audit and actual package behavior; final check receipts passed the supplemental independent package review. Highgate will start from a new published-tour survey and new evidence, reusing infrastructure only. [Results](generation/factory/RESULTS.md), [accounting](generation/factory/COSTS.md).


**7October first fresh Highgate trial:** fresh survey/research produced four researched candidate places, but all three route proposals failed independent review. Different prose directions had not changed the actual router constraints, so crossings and park exits remained unresolved. No narration or audio was written. The engineering correction permits mapped through points and checks the actual returned geometry; a separate fresh run will reuse tools only. This failure does not select or reject the researched stories on enjoyment grounds. [Measured trial](generation/factory/RESULTS.md).


**7October second Highgate trial:** the new survey and evidence report passed structural checks, but all places retained essential physical unknowns. The producer failed to route that evidence gap into its unused research allowance; two plans named valid candidates while explicitly withholding their eligibility, then failed preparation. No stories were written. This is an orchestration failure, not an editorial judgment or observed enjoyment. The next fresh verification follows a tested readiness handoff repair and retains all trial accounting.


**7October final fresh Highgate evaluation:** a new survey of five published walks and ten candidates led to four supported exterior place records after targeted research. The proposed outline linked Highpoint, Joy Hunt's remembered Waterlow Park view, Lauderdale House's community recovery and a station wartime-refuge account. No narration was written and no editorial preference or enjoyment was established. Actual routed through points and bounded repairs did not establish the full North Road pavement/crossing sequence; three Scouts and a frozen disposition rejected it. The final run stopped without manual recovery after24m22, with all usage known. This is an observed route-convergence limit, not evidence that these themes are uninteresting or that a desktop review equals a field visit. [Outcome and costs](generation/factory/RESULTS.md).

## 7 October 2026 — proportionate crossing verification

**Owner comment:** “I think we might be a little overzealous in our scouting and verification. If the crossing exists, we should be able to say ‘cross here’, don't you think?” This follows the [Highgate final trial](generation/factory/RESULTS.md#final-fresh-highgate-verification), whose North Road legs 2 and 4 were rejected partly over exact pavement/crossing geometry.

**Engineer response and correction:** agree that the standard demanded more geometric detail than ordinary walking directions require. The previous proposed fix—first building explicit pavement-side and complete crossing-chain validation—was too elaborate as a prerequisite. A reliably identified pedestrian crossing can support a straightforward crossing instruction. Review must distinguish map representation from a concrete problem a walker would encounter. Road-centre polylines and partial mapped connectors alone should not force rejection, invented kerb coordinates or another full research cycle.

**Proposed application:** identify the relevant crossing and intelligible public approach/onward direction, then accept ordinary mapping imprecision unless there is concrete contradictory evidence. Keep real blockers such as the wrong crossing, private/inaccessible access or directions that require an unsupported movement. “Use the pedestrian crossing to cross North Road” is an illustrative instruction, not a complete accepted rewrite of those legs. The [living guidance](TOUR-DESIGN-GUIDANCE.md#keep-crossing-verification-proportionate) records this working interpretation separately from the owner's comment.

**Outcome/status:** discussion and guidance updated; runtime prompts/acceptance behavior have not yet changed, and no new inference, route approval, listening or field result occurred. Next application is a targeted review of the retained evidence under the proportionate criterion, not automatic acceptance of the blocked package or resetting its counters. This replaces the engineer's proposed next-step requirement for exact geometric proof; historical reports, hashes, costs and rejected verdicts remain unchanged.

## 7 October 2026 — Sol 6.1 and a fresh duration-controlled run

**Owner direction:** “switch to6.1, fix the issues, run another full generation.” This continues the fresh Highgate brief, roughly60minutes, ordinary hills/steps allowed and no reused authored material. The earlier crossing discussion remains authoritative: an identified crossing with plausible public approaches and clear onward directions does not require complete kerb/island geometry.

**Implemented application, awaiting live result:** new factory jobs enforce a55–65minute estimated range for this brief (10percent or5minutes tolerance, whichever is smaller), check route feasibility before writing using80–180seconds of substantive narration per stop, budget writer words from the actual route, and check both duration bounds after real audio rendering. Walking narration overlaps walking and cannot fill a stationary-time shortfall. No filler, invented facts, inflated looking allowances or manipulated speeds. This tolerance is an engineering interpretation of “60minutes is good” and permission to extend, not observed enjoyment or a measured outdoor hour. A separate frozen-route directions review compiles usable canonical instructions under proportionate desktop evidence. Genuine access/direction contradictions still block. Existing closed trials retain their original limits and outcomes.

**Model evidence:** Sol6.1 passed real hosted search using the existing app grant, medium effort and overflow off; separate calibration14,033tokens,13.36seconds,US$0direct. New run uses the [fresh brief](../../fixtures/generation/factory/highgate-sol61-brief.json) with a60-minute generation envelope and unchanged non-time caps.

**Live sequencing finding:** the first Sol6.1 engineering run's two Scouts supported public access but rejected generic router directions and competing provisional narration numbers. The second explicitly acknowledged that480seconds of speech fits55–65minutes while still requiring another timing reconciliation. New preparation now precedes Scout; its calculated budget supersedes provisional planner/research prose, and an in-range estimate need not equal exactly60minutes. Actual audio and the existing lower/upper bounds still decide final acceptance. A separate fresh [final verification brief](../../fixtures/generation/factory/highgate-sol61-final-brief.json) will measure the corrected sequence without reusing the engineering run's content.


**Third Sol6.1 outcome:** fresh Highgate research selected Highpoint, the Gatehouse, Pond Square and Waterlow Park. The complete2.617km route passed practical Scout review after correcting real omitted crossings and the station return. Independent editorial review removed repeated spoken research disclaimers and shortened the thin theatre encounter. The final918-word narration was accepted after a lossless navigation-layout repair and rendered as383.9seconds of actual George audio. The resulting50m45 estimate missed55–65minutes and was correctly blocked. This is evidence of overly optimistic early narration budgeting, not a reason to retain padding or inflate looking allowances. New policy3 requires enough walking to meet the lower bound with80seconds per stop and uses an approximately2.3word/sec voice-planning estimate. The next entirely fresh v4 run applies these fixes from the beginning; no observed enjoyment or physical duration is claimed.


**Fourth run and owner question about fixes:** the conservative gate rejected the compact village proposals before writing; an unresolved existing longer-route candidate could have used remaining research, but the producer did not hand the duration failure back to research. The shared producer now does so within existing limits, with a regression. Separately, local dated OSM evidence mitigates an external map-service outage; it does not establish current access. Sidi asked whether these are temporary patches or genuine future-run fixes. The distinction is recorded explicitly: shared implementation corrections have focused regression evidence; dated infrastructure has scope/refresh limits; an end-to-end fresh run is still needed to establish integration. No old rejected tour is relabelled a success and no duration/content criterion is weakened to force completion.


**Duration clarification after v7:** the route-selection loop reduced the last proposal to approximately3.82km, but its walking/allowance plus four80-second stories totals66m19, above the engineering55–65minute range. No audio or independent Scout acceptance exists for that proposal;66–70minutes is only a plausible planning estimate. Sidi's earlier “you can extend duration” may refer to tour length or generation allowance. Asked whether a worthwhile walk up to75minutes is acceptable or the tour should remain55–65minutes. No answer or expanded permission is inferred from elapsed time; current criteria remain unchanged. This is separate from the implemented software corrections and does not turn a failed run into a pass.

## 7 October 2026 — beta completion and proportionate rejection

**Owner direction:** Sidi requested a bird's-eye review of where the last pass dragged, including engineering work, handoffs and overly literal enforcement. This is a personal beta for enjoyment; perfection is unnecessary. He then clarified: “it's not just that I want to save time - it's avoiding failure / rejection states when they aren't actually that bad”. Completion despite tolerable imperfections is the main concern. The discussion is not a selection of a new numerical duration range or a claim that a historical rejected package passed.

**Observed last-run timeline:** [v7](generation/factory/SOL61-V7-RUN.json) ran for17m06.938s: approximately2m19 surveying published walks,10m17 researching sources/access, and4m31 producing and routing three proposals. Research returned19sources,17claims and5eligible places. One final research request occupied9m03; the cause of that latency is unproven. All20local map/station/crossing reads succeeded;12of15page reads succeeded. It stopped before independent Scout review, writing or audio. Its90-minute generation allowance was not exhausted.

**Usage and repeated work:** research/survey used7requests and746,541tokens; route planning used11requests and472,991tokens. Of1,219,532total tokens,98.4%were input, reflecting repeatedly supplied context/tool history rather than that volume of new prose. Direct paid usage wasUS$0; the existing token-only API-equivalent estimate isUS$2.21–2.71, excluding implementation-assistant usage and other billing uncertainties. The three final fresh trials,v5–v7, consumed49m29.455s of job wall time, with engineering/review between them. No complete accepted hour-long tour resulted.

**Engineer assessment:** useful fixes and disproportionate stopping rules became entangled. V5 needed measured per-leg feedback and offline-map bounds; v6 exposed an introduced leg-ID instruction regression and sent a local station wording correction into unnecessary research. Both shared defects were fixed. V7 then rejected a66m19 conservative route/narration planning estimate for exceeding the engineering65-minute upper limit by79seconds. This was not a measured finished-tour duration. The earlier v3 had actual audio and a50m45 total estimate but failed the55-minute lower limit. The existing personal testing policy and editorial guidance already allow proportionate effort and selective research; the engineer's rigid gates and repeated fresh starts added strictness beyond that practical intent.

**Proposed application, pending discussion:** report duration honestly as an estimate and preference; keep a useful candidate when it misses a target modestly. Reviewers should identify concrete changes rather than veto a whole draft for ordinary editorial weaknesses. Correct wording locally; omit or qualify a weak historical detail; reroute or remove a stop with a real access problem. Preserve research, route and audio that remain applicable across repairs. Use a compact source-backed authoring brief and one combined review with a bounded focused correction, then render and run deterministic package checks. Fresh benchmarking can follow a coherent change rather than restarting discovery after each small defect. These are proposals for the next implementation, not changes already demonstrated by the current runtime.

**Checks worth retaining:** a route must not knowingly require unavailable/private access or give contradictory crossing instructions; essential offline route/map/media must exist and the package must load. Try repairing or removing the affected element before returning a blocked tour. Ordinary uncertainty about street-level conditions, a slightly different duration, a less elegant paragraph or a missing incidental anecdote should ordinarily lead to a limitation or edit while useful work continues. Actual enjoyment and field usability remain matters for ordinary owner use. No new generation, app test or acceptance result was produced during this discussion.


**Owner selection and first implementation,7October:** Sidi authorized enacting useful simplifications/relaxations and recording them, with tightening later if the results prove sloppy. This selects the personal-beta completion approach proposed above. [Implemented boundaries](generation/factory/README.md#personal-beta-simplifications--7-october) make duration/editorial issues advisory, remove fixed research quotas and the four-stop minimum, combine review, retain local repair inputs and replace the model tester with actual package checks. Real material historical, access, direction and offline-media defects remain repair requirements.374automated tests plus typecheck/lint pass; one fresh Highgate beta run will assess integration. No enjoyment or physical observation is inferred, and no historical rejected job is relabelled.

**Observed avoidable rejection during v8:** exact but separate written excerpts and a structured station-map observation were rejected by a validator that treated both as one contiguous prose quotation. The beta format correction preserves actual textual matching, source allowances and map provenance while avoiding this procedural failure. Original research/repair artifacts and429,171spent tokens remain retained for same-job recovery. This is another selected simplification, not an acceptance of unverified access or fabricated history.

Evidence-format correction verification:376automated tests, typecheck and lint pass. The new focused cases retain fabricated-text/missing-map rejection and the25-word source allowance; all three real v8 research artifacts validate under the corrected formats before same-job recovery.
