# M2 prepared tours — Pixel handoff checks

Date: 2026-09-17. Pixel 6, Android 17; same personal test phone as the accepted M1 evidence. Source **9bfa68ae66573afa**, self-contained APK SHA-256 `048f4941f9b751e37eb7980ce1a9cc9edede0b9b78b93d6abd1b94a061f91445`. See [build evidence](M2-tour-build.md).

## Installation and silent checks

- Owner connected and unlocked the phone for one clustered 15–20 minute session. Audio readiness is requested separately.
- Updated the development variant without launching it, archived the existing private app files/databases/preferences to an ignored local backup, then installed the self-contained variant with `adb install -r`. Both installs succeeded. No uninstall or data clearing.
- Cold launch opened the new tour library. **Prepare both Finchley tours offline** completed and showed both versions, with B selected.
- B's map displayed the local street basemap, route and numbered stops. Approach, viewing place, access, next directions and transcript were readable in the first story's offline reader.
- Start registered the native foreground location service and a two-second high-accuracy request. App-scoped exit records showed the expected package-update exit and no new crash. This service check alone does not establish fresh locked-screen callbacks.
- The initial “Paused” text represented the `not-started` state, which Start deliberately releases. The engineer's attempted Pause tap before Start was not verified and did not establish a manual hold. Start consequently played the first story before the requested listening confirmation. This was an operator mistake, acknowledged to Sidi; playback was stopped. Native MediaSession then confirmed PAUSED at approximately 56 seconds. Do not count that interval as a user-confirmed listening result or a demonstrated manual-pause regression.
- The tour was subsequently ended while waiting for listening readiness.
- Force-stop and cold reopening succeeded with no Metro listener on port 8081. Both packages remained prepared. A could be selected and displayed its different route and numbered stops, then B restored its paused progress. No network setting was changed during these checks.

## Confirmed listening and feedback checks

After Sidi replied **“ready and listening”**, brief manual first-story playback was followed by opening Review. The first automated tap sequence missed Review and was stopped by its bounded media-Pause fallback; the corrected sequence opened Review. A final fallback Pause was also sent, so native timing alone does not isolate which pause event stopped sound. Sidi explicitly confirmed **“Saved; narration stopped”** after the review opened and he recorded a short test sentence.

- The app showed a **saved seven-second voice note**. No ratings were manufactured; all three dimensions remained unrated.
- Saved-note playback was deliberately started, then the review was closed. Sidi confirmed the recorded sentence was clear and narration remained silent: **“Yes, both correct.”** No further audio was played after that confirmation.
- Force-stop and cold reopening retained review attempt 1 as saved with its voice note. The walking-chapter review also opened correctly (attempt 2), including the retained first-story history. Attempt 2 has no scores or recording; both attempts are technical desk checks, not content feedback.
- **Save voice copy to folder** created a verified M4A in the existing Documents/Walking Tour M2 folder. Repeating the action produced a distinct filename; both saved copies had identical full-file MD5 values. The app's successful readback message verifies its bytes against the private source.
- Cancelling a third folder selection returned **“Save cancelled. The original voice note is unchanged.”** The retained review still listed the original recording. No source recording or earlier copy was overwritten or deleted.
- Closed the review and used **Take this tour again → New walk** to reset only B's desk-playback progress. Final screen: **TOUR STOPPED**, **Next: Tally Ho Corner**, **Start tour at Tally Ho**. A remains untouched at its initial progress. Native service inspection confirmed no LocationTaskService remained.

## Handoff and remaining scope

**Ready for Sidi's ordinary first tour use.** Self-contained source `9bfa68ae66573afa`, guide 8 remains installed; both packages are prepared locally. Metro was stopped, no data was cleared and no network settings were changed. Sidi was told he could disconnect. Existing private test results and the new voice note are retained.

This is sufficient representative evidence for the new recording/playback/copy/reopen boundary on this Pixel. It is not full M2 acceptance or a full-tour enjoyment result. Today's exterior conditions, pacing, ordinary outdoor chapter triggering and overall value remain first-use observations. Reuse the accepted M1 background audio/location and M2 map evidence: no further desk session, separate reconnaissance or extra outdoor baseline is scheduled. Explicit Resume after a review uses the existing tested hold-release path; it was not separately replayed in this short session. Battery impact and rare recording interruptions were not measured.

Raw phone backups, screenshots, recordings and native inspection output remain ignored locally. No private coordinates, audio or raw logs are attached to this record. The two test copies remain on the phone; they were not uploaded or transcribed.
