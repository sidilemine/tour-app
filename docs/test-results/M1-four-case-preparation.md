# M1: corrected-route four-case preparation

15 September 2026. **Preparation in progress; phone unlock required to finish.** M1 remains implemented; awaiting physical test. The [three development baseline result](M1-three-baselines-and-detour.md) is retained. The remaining four outdoor cases can use the self-contained app; they do not require another development baseline.

## Completed preparation

- The connected Pixel 6 was detected. Before installation, a private app-data archive preserved the original fixture, ended progress (A completed, B in progress, C unplayed), all 5,130 diagnostic events and both SQLite stores. Both copied databases passed integrity checks. All four cached audio files matched the committed assets.
- The verified existing self-contained APK was installed with `adb install -r`, without uninstalling or clearing storage. APK native adapter/job permission checks passed; the installed package is not debuggable. The original route and ended progress were visible after opening. Build source remains `bb0a0e3554c55ed7`; no app/native code changed.
- Android offered to upload the unknown APK to Play Protect. The visible Don't send option was selected, keeping this private build local. Installation succeeded.
- The corrected version-2 candidate from the prior review was paired with a separate long-A fixture using the existing generator. Both contain the same 19 route points and the exact original A/B/C standing coordinates. Both remain explicitly unverified for physical access/orientation. The prior replay comparison is model evidence, not new physical acceptance.
- Both files and the [four-case plan](../FOUR-REMAINING-WALKS.md) were copied into a new **Documents / Walking Tour Remaining** folder. The original Walking Tour Morning folder was preserved. SHA-256 readback confirms all three new phone files match local bytes.
- The Android picker and Validate/Load confirmation successfully imported the corrected long-A fixture. Its controls showed separate unplayed progress. The corrected standard fixture has not yet been imported/selected on the phone.
- Metro was not listening on port 8081. Wi-Fi/mobile data were disabled for readiness testing; Location was on, Battery Saver off, and charging screen-stay-on off. The phone was charging at 100%; this is not a battery test.

## Not yet verified / handoff incomplete

An attempted Start followed by a locked-screen native check did not show an active tour media session. This is not counted as successful playback or location delivery. The phone is locked and requires the owner's fingerprint/PIN before the UI check can continue. A direct private snapshot is unavailable in the non-debuggable self-contained build; use the app's diagnostic export for subsequent evidence. Do not interpret an unavailable snapshot as empty app data.

Before declaring ready: inspect the player, verify long-A playback and fresh live fixes, End and export preparation diagnostics, then load the corrected standard file and check its short playback. Verify cold reopening offline, original archives/history and the four audio assets through available evidence. End/New walk should leave the corrected standard fixture stopped with unplayed progress. Preserve the original route and prior attempts.

The existing guide journal contains a blank in-progress off-route attempt from the previous outing. It was backed up and remains untouched at this point. Finish it as inconclusive with an explicit engineer note describing the route-data issue and omitted manual-replay/paused-return steps, retaining its original start context; then leave no active guide attempt. Do not assign a new physical pass.

The bundled guide remains revision 4. Its individual procedures still apply, but its seven-case overview and old folder reference are superseded by the separate four-case plan already saved on the phone. Guide source was not edited; guide/document parity and whitespace checks passed. No APK rebuild was required. No new outdoor acceptance result is claimed.
