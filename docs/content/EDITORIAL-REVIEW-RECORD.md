# Editorial discussion and decision record

Start here when resuming tour curation or reviewing how to make systematic guidelines. Updated 16 September 2026. This is the durable history of discussion, alternatives, corrections and outcomes; [TOUR-DESIGN-GUIDANCE](TOUR-DESIGN-GUIDANCE.md) contains the current working rules. Keep evidence and owner preference distinguishable.

## How to maintain this record

For each meaningful discussion, append a dated entry with: artifact/version; what we proposed; Sidi's actual response; decision status; why it changed; affected guidance; and what remains open. Preserve rejected examples and later corrections. Capture Word comments with their anchors before summarising them. Keep originals untouched. Link revised artifacts rather than silently replacing review copies.

Use **owner direction**, **accepted choice**, **engineer proposal**, **observed result**, **superseded interpretation**, and **open question** explicitly. Approval to prepare options is not approval of the options. Lack of feedback is not acceptance. When a working interpretation is corrected, record both the earlier mistake and the correction so a future synthesis does not learn the wrong lesson.

When we take a serious look back: read this record, the captured comments and the actual examples before revising rules. Separate a general preference from a reaction to one weak execution. Compare what was proposed with what was heard or walked; do not infer tour enjoyment from desk approval. This is a local record, not a new knowledge-base service or automation.

## Evidence index

- [Initial walking-tour research](WALKING-TOUR-DESIGN-RESEARCH.md) and [original Word review](walking-tour-design-review.docx).
- [All 34 owner Word comments with anchored text](reviews/2026-09-16-owner-word-comments.json): 24 on the research review, 10 on the narration pair; document-local IDs and source-file SHA-256 retained. This committed text capture remains usable if the original commented Word files are absent from another checkout. Original commented files remain locally under `docs/content/` and are not overwritten.
- [Current design guidance](TOUR-DESIGN-GUIDANCE.md), revisions 1–3 with revision history.
- [First North Finchley sample pair](NORTH-FINCHLEY-SAMPLE-STOPS.md) and [original Word copy](north-finchley-sample-stops-review.docx), including the rejected memorial execution.
- [Tally Ho revision 2 and response mapping](TALLY-HO-SAMPLE-V2.md) and [Word copy](tally-ho-sample-review-v2.docx). The later imagined-colour correction supersedes its narrower review note, not its narration.
- [Current tour options A and B](NORTH-FINCHLEY-TOUR-OPTIONS.md), [Word proposal](north-finchley-tour-options-review.docx), and [actual routing evidence](routes/north-finchley-options-v1/README.md).
- [Personal-use testing policy](../../AGENTS.md#testing-policy-for-the-personal-prototype), [M2 implementation status](M2-IMPLEMENTATION.md) and [route/test brief](M2-TEST-PLAN.md). Device evidence stays in the linked test records; content feedback does not certify technical acceptance.

## Discussion history

### 01 Convenient location and proportionate testing

**Context:** M2 preparation and the map slice, before the editorial research. **Owner direction:** start around North Finchley bus station and finish nearby; the shorter the better within valid test needs. The Finchley Central–Church End–Stephens House backtracking was queried and was not intentional. The later 20–30-minute compact target is a working design goal, not a measured route or minimum acceptance duration.

After the map walk, Sidi reported accurate location, correct audio and airplane-mode use, but did not do the stationary minute at C or note battery. Those omissions remain explicit in [the result](../test-results/M2-outdoor-map.md); unchanged accepted M1 evidence was reused. Sidi then directed pragmatic testing throughout: he is the user/test subject, and rare recoverable edge cases can be fixed when encountered. **Outcome:** adopted in AGENTS, PRODUCT and ROADMAP. This does not establish that every enjoyable future tour must be the shortest technical test route. **Open:** acceptable finished-tour length when extra time buys better content.

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

**Decision status: awaiting owner feedback.** Neither tour, longer duration nor a general rule about theme/spacing is accepted. Sidi's next response should be recorded here against this version, including disliked choices and why. Existing E1 requirements remain separate; two outlines are not completed comparison variants.

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
| A versus B and specific six stops | Engineer proposals | Owner story/time preferences |
| Distinct standing areas, access and crossings | Unverified | Desk inspection, then only necessary physical checks |
| Systematic guidelines from these options | Open learning questions | Recorded choices and actual experience; no automatic promotion |
