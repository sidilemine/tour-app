# M1: remaining outdoor test preparation

14–15 September 2026. **Implemented; awaiting physical test.** This prepares the existing seven remaining outdoor cases; it does not pass them or reopen previously accepted cases. Build source `bb0a0e3554c55ed7`, guide revision 4, Pixel 6 / Android 17.

## Change and scope

A separately identified edge fixture uses the exact original A/B/C positions, route and verification metadata, with one 6:21 local A recording. This avoids inventing a shorter route while making arrival during unfinished narration practical. The fixture generator refuses overwrites. The optional `audioProfile: "edge-long-a"` selects a distinct durable audio filename; original fixtures omit the field and retain their serialized recovery identity. The player labels STANDARD CLIPS or EDGE TEST. B/C, normal A, the reducer, arrival thresholds, location cadence and native audio adapter are unchanged.

Both build variants contain the updated offline guide and all required clips. The original route and edge copy are in the phone's Documents / Walking Tour Morning folder alongside a readable batch plan. The complete [batch procedure](../TOMORROW-WALKS.md) covers ordering, import and export. Export before changing fixtures because the diagnostic snapshot is filtered to the selected route identity.

## Automated and artifact verification

- TypeScript, lint, 75 unit/replay/storage tests, guide parity and whitespace checks passed. Expo's online compatibility check reports dependencies up to date.
- Development and self-contained ARM64 builds succeeded. APK checks confirm native audio adapter markers and required background-location/job permissions.
- The self-contained bundle contains source `bb0a0e3554c55ed7`, the morning guide and long-A profile. An initial raw UTF-8-only check missed the morning-folder text: Hermes stored that string as UTF-16. The verifier now checks both representations; this was a verification error, not a stale APK. All four embedded audio files match the local asset bytes exactly.
- Private device replay passed: standard fixture 3,283 transitions / 26 segments; edge fixture 125 / two segments. This includes historical data; it does not count that history again as new physical tests.

| APK | Bytes | SHA-256 |
|---|---|---|
| Development | 69,048,968 | `f71a66c6a195edaeeae6ea16b054148c866766566b8d12543ad56d925de105bd` |
| Self-contained | 36,207,167 | `5e09bde608c41940b99b29b01c2458835e4da78f57d93185c6f41e16a7a6f34e` |

## Connected device evidence, 14 September

- Before updated code launched, an app-data backup preserved both SQLite stores; integrity checks passed. Original fixture equality and all 3,636 preceding diagnostic events were retained. Precise data and backups remain ignored locally.
- The Android file picker and Validate/Load flow imported the edge fixture successfully. Real development playback continued beyond the normal A duration; 41 location callbacks spanned 84.262 seconds. Sidi confirmed hearing the long introduction, continuing speech and its subsequent pause. This was stationary preparation, not an arrival walk.
- The newly created development long-A cache was preserved under another filename before installing the release APK, forcing the release to copy its embedded asset. With Metro stopped and Android reporting no default network, cold opening recovered the edge fixture and paused offset without spontaneous narration. Explicit Resume continued the long recording; Pause saved approximately 64.9 seconds. All four resulting durable audio files matched the source assets.
- Importing the original fixture restored its original completed A/B/C progress. A manual replay of A completed at native offset 10.918 seconds; Sidi confirmed hearing the original short clip finish normally. This directly verifies profile switching does not leave long A selected for normal walks.
- Guide revision 4 and the batch overview were visible offline. An older blank, unfinished guide attempt was retained as inconclusive with an explicit engineer preparation note, freeing the guide for new attempts. Its original start context and prior history were preserved; no physical outcome was inferred.
- The self-contained APK was restored for the overnight handoff, with standard clips, ended hold, all previous stops completed and no active service. Wi-Fi/data were restored; Battery Saver and charging screen-stay-on remained off. Exit records for the setup contained the deliberate force-stops; no additional app crash was recorded that evening.

## Morning preparation, 15 September

The owner reconnected before leaving. The development APK was installed without clearing data and the current app data backed up. The original route/progress and four durable audio hashes were verified again. Starting battery was 77%, Battery Saver off; background app-op used its default allowed mode and the app was not on the device-idle whitelist. These are observed settings, not a measured battery-life result.

The **React Native developer menu's Disable Fast Refresh action crashed** with a `BridgelessJSModuleInvocationHandler` null-argument exception through `HMRClient.disable`. Source inspection confirms the setting is saved before that zero-argument call. The persisted `hot_module_replacement` preference was false; reloading with that setting already off succeeded. No tour was active at the crash. This is a known developer-menu limitation, not a passing crash-free setup claim. Do not toggle that React Native menu option during the walks; the prepared session already has Fast Refresh disabled. No native patch was introduced for this developer-only control. The earlier background process had separately been reclaimed for low memory before the new session, reinforcing why overnight development-session survival was not assumed.

Metro and USB forwarding were then stopped, network disabled, and Android reported no default network. Fresh fixes continued through background/foreground while manual intent remained held. These connected readiness checks cannot substitute for cable-free, locked-screen outdoor acceptance. The final connected readiness interval recorded 69 callbacks over 139.0 seconds (two initial stale fixes rejected), with short A completing once while Metro and the network were unavailable. Its cumulative production replay passed: 3,499 transitions / 31 segments. End stopped tracking, then New walk reset the standard player to three unplayed stops and not-started hold, retaining history. The same loaded development process was left ready, Fast Refresh false, Location on, Wi-Fi/data off, Battery Saver off and charging screen-stay-on off. Final exit records show no new crash after the developer-menu failure. Android still listed bound/non-foreground service objects after End (the location service had `startRequested=false`); the app reported tracking stopped. This is not a claim that every service object was destroyed. This is an explicitly prepared development-test handoff; the self-contained APK must be restored after the batch.

## Remaining physical work

Three consecutive development baselines, detour/rejoin, early arrival, pass pending and a separate battery-saver run remain. They can all use this prepared development session. Force-close/reload/reboot may require reconnecting to Metro; a release walk must not be mislabeled a development pass. Restore the self-contained APK after this explicitly prepared batch. Other at-home acceptance items remain on the [working checklist](../PHONE-CHECKS.md).
