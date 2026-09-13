# Product

## Intended experience

Sidi can download a walking tour, start it on an Android phone and put the phone in a pocket. The guide uses the surroundings to tell engaging, sourced stories, gives usable directions, and leaves intentional silence. Arrival at the next appropriate stop can start narration even after several quiet minutes with the screen locked. iOS follows after the Android walking experience is proven.

The first useful product is one curated six-stop walk that Sidi would willingly take again or recommend to a friend. The first implementation is a smaller device experiment to establish whether its essential background behavior works.

Tours are prepared before use. A downloaded tour contains the local map, planned walking route, directions, narration, transcripts, relevant images/attributions and everything needed to recover progress. Normal touring does not call a server, LLM, TTS or online routing service. The user can complete the planned walk manually if GPS is unreliable.

## Core promises

- **Route and story agree.** Plan and verify the walk before budgeting narration. Leave time for navigation, stopping, looking and silence; do not fill every gap with speech.
- **Arrival means a usable viewing position.** A landmark's coordinates are not the visitor's destination. Record a safe standing area, approach, viewpoint and access conditions separately. Verify instructions such as “look left” from that position and approach; GPS heading at walking speed does not prove what someone faces.
- **The user remains in control.** Play, pause, resume, replay, choose a stop, skip, previous, “I'm here,” and disable automatic narration remain available. Wrong GPS must not lock the user out of the tour.
- **A pause stays paused.** A user pause, including a lock-screen/headset pause, inhibits automatic speech until explicit resume. Moving into a stop, regaining signal, ending a call or reopening the app must not clear it.
- **Recovery is durable.** After process termination or force-stop, reopening restores the tour, completed/skipped stops and saved narration position. The user resumes deliberately. Continuous service after force-close is not promised.
- **Privacy is the default.** Match location and trigger audio on-device. Precise traces are recorded only in an explicitly started local diagnostic session, with review before any sharing. No accounts or remote analytics in the prototype.
- **Evidence is inspectable.** Each factual claim retains supporting passages, source details, uncertainty and explicit verification status. Folklore and disputed accounts stay labeled; a source URL alone is insufficient.

## Walking behavior contract

Location, audio and tour progress can differ at the same instant. A visitor may arrive at stop B while listening to the end of A. The app must represent both facts.

| Situation | Intended behavior |
| --- | --- |
| Arrive while previous narration is playing | Keep the unfinished clip playing. Hold at most the next eligible arrival; do not overlap, cut off the story or jump chapters. Recheck position and intent before playing the pending stop. |
| Leave before finishing narration | Let the current story finish unless the user pauses/skips. Preserve its offset if interrupted. Do not treat physical departure as completion. |
| Pass a pending stop before it can play | Retain it as unplayed and offer it manually; do not launch outdated “stand here” instructions behind the visitor. Do not play a backlog of missed stops. |
| Actionable walking direction during narration | Briefly pause the story, play the prepared direction cue, then resume at the saved offset, provided the user has not manually paused. A pause during the cue prevents automatic story resumption. Visual directions supplement the audio; they are not the sole fallback for long narration. This belongs to the walking player, beyond M1. |
| Manual pause during narration or silence | Hold all automatic speech, including pre-recorded directions. Keep locating while the active tour remains on, and save arrivals without playing them. “End tour” stops tracking. |
| Resume | Explicit Resume/lock-screen Play resumes the saved clip and releases the playback hold; it does not clear a separately disabled automatic-trigger setting. Recheck any pending arrival afterwards. |
| Choose/play a different stop manually | Play that selection deliberately. Do not silently re-enable automatic triggering or mark intervening stops completed. “Start from here” makes a visible sequence change. |
| Call, audio-focus loss or headphone disconnection | Pause and save position. Initial policy requires explicit resume after interruption or output change; never surprise the user by switching narration to the speaker. Validate native behavior. |
| Poor/stale GPS, implausible speed, reversal or off-route travel | Suppress uncertain automatic triggers and show a reason when the screen is open. Keep the map, stored directions and manual audio available. |
| Missing location permission | Manual tour still works. Explain how to enable location; do not loop permission prompts or claim automatic mode is ready. |
| Re-enter a completed stop's area | Do not replay automatically. Explicit replay remains available and does not undo completion. |
| Reopen a terminated app | Show saved progress and Resume; refresh location and permission state. Never infer current location from a stale saved fix or start audio merely because the app reopened. |

These are initial testable defaults. Change them using observed walking feedback, updating [ARCHITECTURE.md](ARCHITECTURE.md) and tests together.

## M1 test companion

The lifecycle lab includes an offline test guide with preparation, steps, expected behavior and durable attempt notes. It distinguishes independent tests from engineer-prepared cases. Saving an observed pass/fail/inconclusive result does not control playback or mark M1 accepted; diagnostics and physical observations still need review. Test records stay separate from tour progress and export only on request.

## Scope of the curated prototype

One walk in a location Sidi can test, six publicly reachable stops, a clear start/end, verified walking legs and standing positions. Include natural spoken narration, transcripts, clear manual controls, visible route, local map and directions, sources, asset rights and restart recovery. The actual area, themes, walking duration and voice are chosen with Sidi during early curation, not invented as settled decisions here.

Accessibility descriptions must state what was checked, when and what remains unknown: stairs, gradient, surface, crossings, gates, opening hours, fees and rest options where relevant. Do not advertise a route as wheelchair accessible on inference alone. An unavailable or unsafe stop must have a curated alternative or be omitted; never guide through a closed gate because a route line exists.

Offline means the downloaded **planned route** works. Within the downloaded area, show the visitor's position, route and stored rejoining instructions/verified alternatives. If they leave coverage or meet an unplanned closure, offer manual choice and explain the limit. Arbitrary offline rerouting needs a separate product decision, routing data and implementation; it is not implied by offline maps.

## Early supervised AI content experiment

Run this alongside development of the curated six-stop walk, before investing in a full tour factory. Use the same test area and comparable time/access constraints, but contrasting briefs—for example engineering/architecture versus ordinary lives/unusual stories. Test differences in selected stops or route, story focus, pacing and enjoyment, not just different adjectives applied to an identical script.

Produce reviewable candidate routes, claim/evidence packs and short narration samples using human-supervised steps. Route with a real walking router, verify physical orientation, inspect claims, and use existing authorized tools or owned recordings. Record edits, generation effort and any approved costs. Sidi listens and walks both variants; [ROADMAP.md](ROADMAP.md#experiment-e1--supervised-ai-brief-comparison) defines the decision gate. This is a learning experiment with local artifacts, not a backend or personalized-generation UI.

## Non-goals until explicitly scheduled

Driving, car navigation, live Q&A, live narration generation, arbitrary offline rerouting, worldwide instant generation, accounts, cloud progress sync, production backend infrastructure, a reusable city knowledge base, public distribution, a marketplace and extensive analytics.

Keep walking simple. Version the tour format so a future driving extension can be designed later; do not add driving states or scheduling rules now. Provider boundaries should permit replacement without rewriting playback, while remaining small enough for one walking app.

## Success measures

First prove repeated locked-phone silence-to-arrival playback with useful diagnostics. Then complete the six-stop tour in airplane mode, recover from termination, and replay recorded failures in automated tests. Record false triggers, missed arrivals, manual recoveries, interruptions, pacing friction and Sidi's enjoyment. An emulator pass, a single triggered MP3 or a smooth screen-on demo is insufficient evidence of a successful walking experience.
