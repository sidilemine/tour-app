# North Finchley tour review and development brief

17 September 2026. Response to all 11 comments in Sidi's `north-finchley-tour-options-review sidi comments.docx`. [Exact comments and anchors](reviews/2026-09-17-tour-options-comments.json); [discussion history](EDITORIAL-REVIEW-RECORD.md); [original proposal](NORTH-FINCHLEY-TOUR-OPTIONS.md). The Word body is unchanged and contains no tracked insertions or deletions. Both original Word files are preserved.

## What is decided

**Develop both tours for actual use and feedback.** Sidi is slightly more excited about B and accepts its extra walking. Short technical tests remain desirable; they do not set a maximum duration for finished tours. The original 20–30-minute target was over-applied to content selection and is superseded as a product constraint.

Keep Tally Ho's proposed treatment and Grand Arcade. Remove Stanhope as a dedicated detour: the currently researched story and available view do not earn the extra walk. Gaumont/artsdepot has the stronger combination of evidence, position and present-day continuity. This is a judgement about these candidates, not a prohibition on two cinema stories in a strongly themed tour.

The approximately 106-metre Tally Ho–Arcade leg is acceptable in editorial terms. Dense centres can have close stops; longer stretches and repeated pavement can also work. Check actual standing areas and arrival eligibility separately, without treating even spacing as a goal in itself.

## The two working versions

**A — places people went for a good time.** Retain the five selected candidates in order: Tally Ho → Grand Arcade → Torrington → Trinity → Gaumont/artsdepot, starting and ending near the bus station. Give them a clear thread about local audiences, gathering and participation. An occasional thematic explanation between stops may strengthen that thread, but its subject and placement still need drafting. Do not replace Stanhope merely to restore a count. A is the comparison tour; B retains the six-stop M2 baseline. The original A map, 1.391 km and 28–33-minute estimate include the rejected detour and are now historical, not the revised route or timing. Reroute the retained points before preparing directions.

**B — how a neighbourhood makes itself.** Develop the existing six candidates, with the Elephant still subject to whether its full story earns its place. Add one proposed 2–3-minute walking chapter between stop 3, the meeting house, and stop 4, Moss Hall Crescent. The existing 1.918-km desk route and 37–42-minute base estimate exclude review time and predate that chapter. Moving narration may overlap the roughly 7½-minute leg; do not automatically add its entire duration to the walking total or use it to erase the quiet. The final timing depends on the departure point, recording length, crossings and retained route.

**Engineer sequencing:** develop B's complete script and walking chapter first, then A's revised thread and five-stop route, reusing shared claim research and unchanged passages. Both remain assigned; this sequence is not a request to choose one. These outlines are not ready packages or evidence that either route has been walked.

## A walking chapter with a purpose

Working title: **How the neighbourhood filled in**. Begin after leaving the sculpture and use the residential walk to explain how and why this area developed, arriving at the villas with context already established. A possible structure is the older estate landscape, subdivision and streets/housing, then the relationship between houses and shared local places. Research chronology and causes before writing them as fact; the current sources do not justify a generic claim that one railway line caused all development here.

Use the [Moss Hall conservation appraisal](https://open.barnet.gov.uk/download/2nx73/e21/2015-08-26%20-%20MossHallCrescentConservationArea%20-%20CharacterAppraisalAndManagementProposals.pdf) and the existing Tally Ho claim record as starting material. Write for 2–3 minutes at the chosen voice's measured pace. Help picture the landscape and ordinary activity using supported imagined colour. Save the villas' specific architectural detail for the arrival story, so the chapter prepares that stop instead of repeating it. This is an original writing brief, not a verified narration draft.

Proposed playback behavior for the first implementation:

- Package the chapter as separate offline audio/transcript associated with leg 3→4. It is not a fake stop or an extra landmark arrival.
- Make it eligible only after stop 3 is completed or explicitly skipped and recent route-relative fixes show departure into a reviewed portion of the onward leg. Position it beyond any immediate navigation task. Do not use a timer alone or a single noisy fix; choose the actual interval after approach review.
- Play once with automatic narration enabled and no hold or other story playing. Pause, recording, interruption and restart never clear a hold. Saving feedback never resumes speech. Keep deliberate manual play/skip available.
- If the visitor reaches stop 4 early, preserve usable directions and the next story without a speech backlog. A stale, unstarted walking chapter can be skipped; it must not belatedly begin at the villas. Define cue priority and saved-offset recovery before connecting native audio.

The installed player currently validates a three-stop fixture (`src/domain/fixture.ts`) and indexes stop audio (`src/domain/engine.ts`). Departure-triggered chapters and per-story recorded feedback are not implemented. Build the chapter behavior as one bounded extension of the planned M2 player, with deterministic replay of departure, holds and late arrival before a short audible check. Do not reopen the completed map tests or add a separate long outing for this feature.

## A small review after each story

Sidi requested a few dimensions scored out of ten plus a voice note immediately after each story while out. Proposed first version: **three integer scores from 0 to 10**, with “not rated” distinct from zero. These are personal reactions, not validated survey measures or factual confidence ratings.

| Dimension | Question | 0 | 5 | 10 |
| --- | --- | --- | --- | --- |
| Interest | How much did you want to hear this story? | No interest | Some interest | Absorbing |
| Value of being here | How much did this story reward being in this place? | Location added nothing | Some connection | Being here made it much better |
| Storytelling | How well did the telling work for you? | Hard to follow or badly judged | Worked reasonably | Clear and engaging throughout |

For a walking chapter, “this place” means the surroundings along the leg. A low place-value score is worth discussing; it does not automatically disqualify useful general context. A voice note can distinguish weak writing, voice delivery, length and environmental distraction rather than adding a separate score for each.

**Voice prompt:** “What stayed with you, and what would you change?” Aim for roughly 20–40 seconds if convenient, without a hard cut-off. Mention “too long”, “too short”, confusing directions or an audio problem only when relevant. Allow a skipped score or voice note and preserve incomplete feedback.

Proposed local flow: stop somewhere comfortable → choose Review, which pauses the tour → three taps and an explicit Record/Stop/Save → explicit Resume when ready to continue. Recording requires a deliberate microphone action; saving or leaving the review screen must not clear the pause. Failed or denied recording should leave ratings and earlier notes intact. No automatic microphone recording or cloud transcription is needed.

Keep each attempt under tour/version, story or walking-chapter ID, presentation order and review time. Link the local voice file to that attempt. Separate feedback from tour progress; preserve earlier attempts and use the existing named local save/export conventions. Do not export or transcribe personal audio without the relevant instruction. Repeated shared stories may be marked “heard before”; skip a repeat rating if there is nothing new to say, while retaining order/context for comparison.

Allow about 45–60 seconds per reviewed story as a planning estimate: roughly 4–5 minutes for A's five stops and 5–7 minutes for B's six stops plus walking chapter. Review time is reported separately from ordinary tour time. At the end ask just whether the whole tour was worth the time and one change Sidi would make. This does not create a repeated-walk quota or require reviewing both on the same day.

## The Kinks example

The provider's [Kinks Tour of North London](https://britmusictours.com/tour/the-kinks-north-london-walking-tour/), checked 17 September 2026, advertises a two-hour tour beginning at East Finchley station and ending at Konk Studios, with a bus connection near the end. Its route connects homes, school, pubs and performance history through the band. Supporting passages: “Starting Location: Outside the exit of East Finchley tube station”; “ends with a short bus ride”. Provider description, not independent verification of its historical anecdotes or walking quality.

Our inference: a theme can connect different types of place through a developing story. Merely collecting several venues of the same type does not establish that thread. We should research and write our own tour rather than copy its script, adopt its sensational diversions or assume its stops belong in our North Finchley route. The existing Dave Davies–Grand Arcade connection remains a useful local lead, with evidence in the original proposal.

## Comment by comment

| ID | Response and status |
| --- | --- |
| 0 | Tally Ho treatment works: retain. Approval attaches to the outline, not every word of the earlier full script. |
| 1 | Grand Arcade is appealing: retain. Current access remains separate. |
| 2 | Stanhope does not warrant the detour: remove it as a dedicated stop. Passing narration with an archival image remains a possible future treatment if a route naturally passes; no photo feature is implemented. Sidi's electronics-company observation is an owner report, not our independent current-frontage check. |
| 3 | Accept the short central leg editorially; vary pace to reflect local density. Physical placement still needs review. |
| 4 | Prefer Gaumont for route convenience, stronger back story and continuity with today's venue. |
| 5 | Develop a 2–3-minute area/theme chapter on B's 3→4 leg, triggered by onward departure. Exact script and playback mechanics remain to build. |
| 6 | Develop both tours and prepare per-story scores plus voice notes. The three dimensions and flow above are engineering proposals answering that request. |
| 7 | B's extra time is welcome; stronger initial enthusiasm recorded. No claim of actual enjoyment yet. |
| 8 | Short footprint was for efficient technical tests. Remove the inherited product cap; Sidi's expectation about future tour lengths is product judgement, not population research. |
| 9 | A strong arts theme could support several similar sites; an explicit contrast or developing narrative must earn each one. Do not invent a high-end/working-class contrast. Kinks example researched above. |
| 10 | Walking, retracing and silence are acceptable; quiet supports future social use. Music and additional walking stories remain optional future treatments, not a mandate to fill gaps. The single requested B chapter is current development work. |

## Review outcome and next work

This review records a go-ahead to develop both tours, a rejected detour, accepted length/spacing preferences and a concrete feedback/chapter brief. It is not physical acceptance or a positive E1 automation decision. The next content work is B's script and chapter, A's revised route and theme, and retained-site desk checks. The subsequent player work needs versioned packages, departure narration and local story review; keep it separate from the already completed map slice. Prepare only the physical checks needed for access, sightlines or new audible behavior, with the question and owner time stated in advance.

Verification for this review: all 11 comments structurally extracted with anchors; full Word body including table text matched to the original; no tracked text changes; all four rendered pages inspected. No original Word file changed. Link, JSON and whitespace checks apply to this documentation update; no application test or physical result is claimed.
