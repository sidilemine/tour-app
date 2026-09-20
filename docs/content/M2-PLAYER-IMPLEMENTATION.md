# M2 tour player and feedback implementation

17 September 2026. Implemented for the two authored North Finchley tours. [Build/device evidence](../test-results/M2-tour-build.md) records actual verification; this document describes the code and its limits.

## Package and recovery

The bounded mobile transport is `walking-tour-package`, version 1, with a versioned fixture, narration/evidence and base64 M4A files. It requires the exact installed North Finchley map ID and rejects out-of-coverage geometry. Maps remain embedded shared app assets; imported audio is copied to a unique documents directory and fully read back before a SQLite catalogue transaction exposes it. Unsupported/malformed data, wrong file size/container/checksum, duplicate audio IDs and dangling paragraph/source evidence fail validation. Source-check status describes editorial review; it is not an automated truth judgement.

Import publishes against the latest catalogue, preserving other imports; the same ID/version cannot name different content. A same-version repair can refresh missing/corrupt audio without resetting progress. Start verifies the current directory/assets. Old versions and unsuccessful orphan stages are not aggressively garbage-collected; measured storage pressure would justify cleanup later. No network download or hosted service was added.

Fixture/progress/archive changes commit together. Active state is pinned to exact immutable fixture content. Switching tours restores that version's own stopped/held progress. The library shows the latest version of each tour, plus an older version if it is currently selected; older packages and their progress remain stored. Reopening requires deliberate tracking/resume. The three-stop lab keeps its original schema and replay identity when narration is absent.

## Playback and walking directions

Stop counts are variable. B's walking chapter has separate progress and appended audio identity, not a fabricated seventh physical stop. Eligible departure requires the preceding stop complete/skipped, the next stop eligible, fresh usable fixes on the onward interval, more than 40 metres from either stop, three agreeing fixes spanning at least four seconds, no hold, automatic mode and no competing story. An unstarted chapter expires after its useful window. A playing chapter completes before a freshly revalidated next stop; no overlapping speech or stale backlog.

Manual replay/skip applies to stops and chapter; selecting a later stop explicitly confirms skipping earlier unfinished stops. Interrupted manual stop selection leaves the previous unfinished stop eligible. Pause, recording review, interruption, recovery and End preserve a hold; no automatic event releases it. A queued Pause cancels asynchronous audio preparation/seek, and a pending Start cannot reactivate tracking after End or a tour change.

**Deliberate first-tour simplification:** street-name directions are spoken at the end of each authored stop/chapter and available before the transcript in the reader. The chapter launch window leaves measured navigation margin before the next turn. A generic separate direction cue that interrupts a story and later resumes its offset is not implemented in this version: these short, deliberately budgeted routes do not require it to be usable. If ordinary use reveals missed turns or narration obscuring navigation, implement the smallest needed cue behaviour with its own pause/recovery checks. Do not report the previously proposed generic cue arbitration as passed.

The numbered route and stops overlay the existing offline map. The map still only observes session location/playback; opening it neither starts tracking nor clears a hold. Route lines can follow road centres and do not replace pavement/crossing instructions.

## Feedback and microphone

Review explicitly pauses the session and blocks Start/Resume/manual narration, including remote controls, while the review is open. Optional integer scores distinguish null from zero; text saves as typed. Separate review attempts and voice records live in `walking-feedback.db`, with media in private documents. Presentation sequence is review-opening order, not independently established listening order; shared-story exposure can be marked.

Only Record requests microphone permission and starts capture. Background recording remains disabled. Stop, screen departure and backgrounding finalise the note; failure preserves prior scores/notes and stops/releases recording. Saved notes play only after a deliberate tap and stop on next recording/background/close. A force-killed capture is retained as interrupted without claiming playability.

Ratings/text JSON uses the existing named save flow and excludes private file paths/audio. **Save voice copy to folder** is a separate explicit action: a unique name includes the story and voice-note ID, and the destination's full bytes and MD5 are verified. Cancellation/failure leaves the original recording intact. No upload or transcription occurs. A single representative native save/recording check is necessary because pure tests cannot establish actual Android microphone/container/content-provider behaviour.

## Verification scope

Automated cases cover legacy replays, six-stop/chapter departure/holds/recovery, both real-route geometries, actual packaged audio checksums, latest chapter timing, atomic SQLite switching and catalogue updates, invalid imports, review storage/capture races, saved-note playback cancellation and voice-copy verification. Native APK checks verify adapter/microphone/location permissions, source identity, every map resource and every tour audio payload. The new package JSON is included in the build source hash.

Accepted M1 background location/audio and M2 offline-map evidence remain reusable. The [17 September clustered phone check](../test-results/M2-tour-phone.md) established bundled preparation, review/recording/playback, voice-copy saving and cold-retained feedback on the Pixel; arbitrary external imports remain supported by automated evidence. First owner tour use supplies current access, enjoyment and full-route integration. Rare recoverable GPS/closure/recording interruptions can be reported and fixed without a compulsory whole-walk repeat. The authoring database, new areas, publication and automated tour factory remain separate roadmap work.

### Review completion update, 17 September

Sidi requests saving/closing Review to resume the tour. The foreground Save review and resume tour action and Android Back first stop note playback/capture and save the review, then send an explicit `review-close` event through the serialized session. It resumes an active walk using the existing offset/arrival/freshness rules, without changing automatic-off or starting an ended tour. Passive unmount, background/locking, score autosave and voice-note save do not resume. This supersedes the original close-remains-paused behaviour in earlier phone evidence; no earlier listening result is relabelled.

## Third authored tour, 20 September

[Clerkenwell](../../content/clerkenwell/README.md) now exercises the existing player with eight stops and two walking chapters, using the selected second offline area. Exact source/audio evidence, latest-launch timing and the full ordered route replay pass; the short-window replay also uses a fixed two-second callback interval at 6 km/h. The guide-12 self-contained build includes all three tours. This authored expansion changes neither the native recorder nor the arrival/hold policy; the [combined phone session](../test-results/M2-clerkenwell-tour.md) remains pending.
