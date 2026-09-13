# M1 named JSON export delivery

13 September 2026. M1 remains **implemented; awaiting physical test**. This change fixes the chooser-only export handoff; it does not complete the walking matrix.

## Implemented behavior

All three exports (test results, private diagnostics and fixture JSON) open a shared screen with a unique timestamped default name and editable filename. Save to folder uses Android's chosen document tree and confirms success only after reading back identical JSON. Share instead is separate. Original tour progress, route, notes and attempts are never reset by export. Cancellation creates no file; write or verification failure retains the snapshot for retry and attempts to remove only the newly created incomplete file. Repeated custom names rely on the document provider's new-file collision naming.

The offline guide and Markdown instructions now describe the same save flow. Original brief and historical physical results are preserved. No new dependency, paid service, remote or upload is introduced.

## Automated verification

Typecheck, lint and all 61 tests pass (54 existing plus seven export tests). New cases cover stable snapshots, repeated/backwards-clock default naming, filename validation, cancellation, verified readback, provider-selected duplicate document URIs, write/verification failures, retry, permission errors and failed cleanup. Existing replay and real SQLite durability tests pass unchanged. Generated guide parity passes.

## Build and phone evidence

Expo compatibility passes; Expo Doctor passes 21/21. Both Android variants built successfully. APK signatures, native audio markers and background-location permissions pass the build verifier. The self-contained bundle contains the current source ID and the Save to folder / Share instead / Saved and verified strings.

Runtime source ID: `4fa6ab9dd753797d`. Self-contained APK SHA-256: `ed8a47d24344e5711cdc78094092489d853fb78ae155288dfda492f2fbef0c65`. Development APK SHA-256: `ad9d843bc708c1c329e05508fae1e3abb4fb49c4104980a74c753dcf670eb3d6`. The native development APK is unchanged; its current JavaScript requires Metro. The self-contained artifact embeds the updated UI and guide.

## Connected-phone verification

Completed on 13 September 2026, approximately 12:44–12:52 BST, on Pixel 6 / Android 17. The phone reconnected after the initial build-only handoff. Installed the self-contained APK with `adb install -r`; its installed checksum matches the artifact above. No uninstall or data clearing occurred. Declined Play Protect's optional upload of the APK.

Observed checks:

- Renamed the fixture export to `export-save-check` in the app; Android created `export-save-check.json` in local **Documents/Walking Tour Tests**. The app reported Saved and verified after readback. The folder was created through Android's picker, with access limited to that chosen folder.
- Saved the same custom name again. Android created `export-save-check (1).json`. Both files were pulled privately and byte-compared; the earlier file was unchanged. Both contained the existing three stops and ten route points.
- Cancelled a subsequent folder selection. Android Back first moved up the folder hierarchy; further Back exited the picker. The app reported cancellation without success and created no extra file.
- Share instead displayed the edited `export-save-check.json` filename. Cancelled the chooser without selecting any recipient or external service. This verifies chooser handoff, not delivery through recipient apps.
- Disabled Wi-Fi/mobile data and force-stopped/reopened the app. Android reported **Active default network: none**. The self-contained app recovered its guide, selected case and original inconclusive note: “Engineer UI smoke check. No walk performed.” No attempt was added or reclassified.
- From the nested guide export dialog, saved two new test-result snapshots offline using default filenames. Both files had distinct timestamped names, parsed as JSON and contained source `4fa6ab9dd753797d`, guide revision 2 and the unchanged original attempt with its original build/revision.
- Saved private diagnostics to the same local folder while offline. Parsed the file privately and replayed it with `npm run replay -- diagnostics/export-device-check/latest-diagnostics.json`: **299 transitions in 7 segments, all stored transitions reproduced**. These are retained historical transitions, not evidence of a new walk.
- Verified the original network settings were restored (Wi-Fi/data enabled, airplane mode off). No app entry appeared in the crash buffer during this test interval. Left the player foreground, **TOUR STOPPED**, ended hold, no unplayed stops, original three-stop/ten-point route retained.

Five local JSON files remain in Documents/Walking Tour Tests: two fixture save checks, two result snapshots and one diagnostic export. Private pulled files and UI/native evidence remain ignored under `diagnostics/export-device-check/` and `diagnostics/`; no coordinates or private traces were committed or uploaded.

The direct-save, rename, collision and offline export handoff is verified on this phone. The source implementation and APK did not change during this follow-up; the previous 61 automated tests and build checks apply, with real exported-data replay added here. Other document providers and recipient apps are not certified by this check. No new walk, audibility or audio-interruption result is claimed; M1's full physical matrix remains pending.
