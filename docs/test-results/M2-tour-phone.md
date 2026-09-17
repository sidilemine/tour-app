# M2 prepared tours — Pixel handoff checks

Date: 2026-09-17. Pixel 6, Android 17; same personal test phone as the accepted M1 evidence. Source **9bfa68ae66573afa**, self-contained APK SHA-256 `048f4941f9b751e37eb7980ce1a9cc9edede0b9b78b93d6abd1b94a061f91445`. See [build evidence](M2-tour-build.md).

## Observed so far

- Owner connected and unlocked the phone for one clustered 15–20 minute session. Audio readiness is requested separately.
- Updated the development variant without launching it, archived the existing private app files/databases/preferences to an ignored local backup, then installed the self-contained variant with `adb install -r`. Both installs succeeded. No uninstall or data clearing.
- Cold launch opened the new tour library. **Prepare both Finchley tours offline** completed and showed both versions, with B selected.
- B's map displayed the local street basemap, route and numbered stops. Approach, viewing place, access, next directions and transcript were readable in the first story's offline reader.
- Start registered the native foreground location service and a two-second high-accuracy request. App-scoped exit records showed the expected package-update exit and no new crash. This service check alone does not establish fresh locked-screen callbacks.
- The initial “Paused” text represented the `not-started` state, which Start deliberately releases. The engineer's attempted Pause tap before Start was not verified and did not establish a manual hold. Start consequently played the first story before the requested listening confirmation. This was an operator mistake, acknowledged to Sidi; playback was stopped. Native MediaSession then confirmed PAUSED at approximately 56 seconds. Do not count that interval as a user-confirmed listening result or a demonstrated manual-pause regression.
- The tour was subsequently ended while waiting for listening readiness.
- Force-stop and cold reopening succeeded with no Metro listener on port 8081. Both packages remained prepared. A could be selected and displayed its different route and numbered stops, then B restored its paused progress. No network setting was changed during these checks.

## Still pending

Explicitly confirmed narration/review pause; short native microphone capture and audible saved-note playback; voice-copy save/readback and cancellation; cold reopening with retained feedback; final independent-use handoff. Full-tour enjoyment, current exterior conditions and walking-chapter arrival remain ordinary first-use observations. Reuse accepted M1 background audio/location and M2 map evidence where unchanged; no extra outdoor baseline is requested.

Raw phone backups, screenshots and native inspection output remain ignored locally. No private coordinates, audio or raw logs are attached to this record.
