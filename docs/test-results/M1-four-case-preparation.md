# M1: corrected-route four-case preparation

15 September 2026. **Prepared and handed back in the self-contained app; outdoor results pending.** M1 remains implemented; awaiting physical test. The [three development baseline result](M1-three-baselines-and-detour.md) is retained. The remaining four outdoor cases can use the self-contained app; they do not require another development baseline.

## Completed preparation

- The connected Pixel 6 was detected. Before installation, a private app-data archive preserved the original fixture, ended progress (A completed, B in progress, C unplayed), all 5,130 diagnostic events and both SQLite stores. Both copied databases passed integrity checks. All four cached audio files matched the committed assets.
- The verified existing self-contained APK was installed with `adb install -r`, without uninstalling or clearing storage. APK native adapter/job permission checks passed; the installed package is not debuggable. The original route and ended progress were visible after opening. Build source remains `bb0a0e3554c55ed7`; no app/native code changed.
- Android offered to upload the unknown APK to Play Protect. The visible Don't send option was selected, keeping this private build local. Installation succeeded.
- The corrected version-2 candidate from the prior review was paired with a separate long-A fixture using the existing generator. Both contain the same 19 route points and the exact original A/B/C standing coordinates. Both remain explicitly unverified for physical access/orientation. The prior replay comparison is model evidence, not new physical acceptance.
- Both files and the [four-case plan](../FOUR-REMAINING-WALKS.md) were copied into a new **Documents / Walking Tour Remaining** folder. The original Walking Tour Morning folder was preserved. SHA-256 readback confirms all three new phone files match local bytes.
- The Android picker and Validate/Load confirmation successfully imported the corrected long-A fixture. Its controls showed separate unplayed progress. The corrected standard fixture was subsequently imported and selected in the completion checks below.
- Metro was not listening on port 8081. Wi-Fi/mobile data were disabled for readiness testing; Location was on, Battery Saver off, and charging screen-stay-on off. The phone was charging at 100%; this is not a battery test.

## Initial readiness interruption; resolved

An attempted Start followed by a locked-screen native check did not show an active tour media session. This is not counted as successful playback or location delivery. The owner subsequently unlocked the phone. The app was still showing the Start confirmation dialog; no active session had begun in that initial attempt. Confirming it started playback successfully. A direct private snapshot is unavailable in the non-debuggable self-contained build; use the app's diagnostic export for subsequent evidence. Do not interpret an unavailable snapshot as empty app data.

The completion checks below resolve the initial readiness interruption. Raw diagnostic evidence stays private; no outdoor acceptance is inferred from a connected desk check.

The earlier blank off-route attempt was saved as inconclusive with an explicit engineer note describing the route-data issue and omitted manual-replay/paused-return steps. Export comparison proves that its original start context and the two preceding saved attempts are unchanged. There is no active guide attempt; no new physical pass was assigned.

The bundled guide remains revision 4. Its individual procedures still apply, but its seven-case overview and old folder reference are superseded by the separate four-case plan already saved on the phone. Guide source was not edited; guide/document parity and whitespace checks passed. No APK rebuild was required. No new outdoor acceptance result is claimed.


## Completed connected checks and final handoff

- Corrected long-A playback reached approximately 66.6 seconds, well beyond the normal short A. Native media state confirmed Playing, and a media Pause produced a manual hold. The session delivered 41 usable callbacks over 90.017 seconds (median interval 2.002 seconds); one stale initial fix was rejected. End stopped tracking. This was foreground connected preparation; it does not claim a new locked outdoor or audible-owner confirmation.
- The edge diagnostic export saved and verified through the normal folder picker. Replay passed all 117 transitions in one segment. New walk then reset only that preparation progress; the export/history remains available.
- The corrected standard fixture imported with the expected 19-point geometry and STANDARD CLIPS label. A completed at native offset 10.917 seconds. Its readiness run delivered 13 usable callbacks over 34.143 seconds, median interval 2.0105 seconds. No audio error appears in either readiness export.
- After End, an explicit force-stop and cold launch recovered the standard fixture, completed A, next B and ended hold. The UI reported fresh location required and explicit resume, with no automatic playback. Metro was unavailable; the final network check reported no active default network. Wi-Fi and subscription-specific data settings were off (the legacy global mobile_data value remained 1). Location remained on and Battery Saver off.
- The standard diagnostic export saved and verified, and replay passed all 33 transitions in one segment. Both exported fixtures exactly match the prepared version-2 files. The pre-install four cached audio hashes and verified embedded APK assets establish asset identity; post-install playback additionally confirms long/short A selection. Private post-install cache/archive inspection is unavailable in the non-debuggable release and is not claimed.
- App-scoped exit records show the deliberate package update and cold-test force-stop; no new application crash since the historical 09:23 developer-menu failure.
- Final New walk reset standard progress. The final player shows corrected standard clips, TOUR STOPPED, Silence/idle, next A and not-started hold. Both preparation runs were exported before reset. The guide has no active attempt. The original phone route files and private pre-install backup remain preserved.

The self-contained app and separate four-case instructions are ready for disconnection and later cold reopening. Use Documents / Walking Tour Remaining for both fixtures. Corrected physical rejoin behavior, early arrival, pass pending and battery-saver walking remain untested. Documentation/guide parity, relative links and whitespace checks pass; no application change or rebuild was made in this completion step.
