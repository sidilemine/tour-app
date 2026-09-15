# M1: four pause-walk exports and stationary-location delay

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

14 September 2026. **Implemented; awaiting physical test.** Manual hold is supported by these field runs, but the complete pause/resume cases remain open because stationary location delivery delayed or prevented B after Resume. No app, installed APK, route, progress or phone setting changed during this review.

Sidi confirms all four attempts used the **app's Pause/Resume buttons and phone speaker**. Only attempt 1 was in flight mode. Attempts 2–4 were not; that does not independently establish which networks were connected.

## Preserved evidence and automated verification

Originals were copied from **Documents/Walking Tour Tests** to ignored `diagnostics/four-walks-2026-09-14/exports/`. Each local SHA-256 matched its phone file. All declare `offline-release`, source `4fa6ab9dd753797d`, Pixel 6 / Android 17. The three-stop/ten-point fixture matches across all four and the previous backup.

| Export suffix, after `walking-diagnostics-2026-09-14T` | SHA-256 | Full replay: transitions / segments |
|---|---|---|
| `08-24-07-177Z-b32ek5.json` | `8b2343f107a15586954821f62ae27f1cd233fee71d66ebf1df5b75f0595e9d41` | 1,385 / 11 |
| `09-45-39-280Z-dvfgw5.json` | `a42869bf3967258460fee0c7c6f79956201d53e9c143828650271aeb4796f4e6` | 1,545 / 12 |
| `09-54-11-139Z-4ao5f9.json` | `dcf0f3a1cc5205f8a77a7032c7bc64f89910109aaf1e1b21ec43c1a2b9608631` | 1,722 / 14 |
| `10-03-37-171Z-767t28.json` | `5c62a96355f67954ae970bb7909b268147b4081b41c509e8f17b5b02556e01ed` | 1,880 / 15 |

These are cumulative exports. Earlier transition sequences match exactly as prefixes of later ones; do not count them as separate repeats. Batch review reproduced every stored transition without errors. Five isolated Start→End segments also reproduced: 144, 158, 23, 152 and 157 transitions, one segment each. The extra 23-transition segment is an A-only setup run at 10:48:48.461–10:49:02.575, immediately before the third described attempt.

No new test-result exports were found in the inspected save folders. Sidi's messages supply observations; no completed journal entries were fabricated. Raw exports, analysis and native records remain private. Retained crash/exit records show no new app crash for these attempts; limited retention cannot prove there was no unrecorded failure.

## Attempt findings

Times are BST. “Playing” and completion mean native status, corroborated by Sidi's audible observations where stated. They are not microphone measurements.

| Attempt | Start → End | Pause / Resume | B outcome |
|---|---|---|---|
| 1: flight mode, uncertain audibility | 09:16:47.241 → 09:24:02.200 | 09:16:59.527 / 09:23:11.098 and 09:23:21.784 | No B play request before End |
| 2: pause after A finishes | 10:39:21.783 → 10:45:29.791 | 10:39:35.098 / 10:44:42.381 | B playing 10:45:17.179: **34.798 s after Resume**; B completed |
| 3: pause unfinished A, short wait | 10:49:13.054 → 10:54:06.508 | 10:49:17.154 / 10:53:12.427 | A resumed first; B playing 10:54:03.191: **50.764 s after Resume** |
| 4: pause unfinished A, timed walk/wait | 10:57:53.088 → 11:03:29.893 | 10:57:57.446 / 11:02:56.371 | A resumed first; B playing 11:03:24.180: **27.809 s after Resume** |

**Attempt 1 is useful failure evidence.** A reports playing at 09:16:47.449 and completing at 09:16:58.467; Pause follows a second later. Sidi does not think either clip was heard, so A's audibility remains unresolved. B was recognised and held from 09:21:15.971, but the last fix arrived at 09:21:55.940. Its age was 75.230 seconds at first Resume and 85.916 seconds at second Resume, beyond the 15-second freshness gate. No further fix arrived before End, 126.260 seconds after the last callback. Fresh-position revalidation therefore never released B. Flight mode does not establish the cause of the gap or explain A's audibility; the bundled clips have no network dependency.

**Attempt 2 supports the silent-pause hold, with delayed release.** A finished before Pause. B was recognised while held at 10:43:20.297; Resume followed 82.084 seconds later, without any intervening playback request. Sidi reports a 60-second wait and immediate B on Resume; preserve that observation alongside the measured 34.798-second delay. The last fix was 33.442 seconds old at Resume. A fresh fix at 10:45:17.072 released B; native playing followed 107 ms later. This was a location wait, not a 35-second audio load.

**Attempt 3 resumed A before B but does not demonstrate the full wait.** Recognised B arrival preceded Resume by 29.012 seconds, consistent with Sidi's uncertain/short wait. A resumed from 3.848 seconds at 10:53:12.578 and finished at 10:53:19.755. The last fix was under 15 seconds old at Resume but too old when A finished. B then waited another 43.436 seconds for a new fix. End stopped B after it began; B remained in progress rather than completed.

**Attempt 4 supports the timed hold and unfinished-story ordering, with another location delay.** Recognised B arrival at 11:01:41.896 preceded Resume by 74.475 seconds. Sidi reports walking about 3:40 and waiting 60 seconds, with B roughly ten seconds after Resume. The log shows A resuming from 4.102 seconds at 11:02:56.525 and finishing at 11:03:03.418. B began 20.762 seconds after A finished, 27.809 seconds after Resume. The remainder of A explains about seven seconds, but not all the delay. End again stopped B before completion.

All four main attempts started with fresh progress. The previous completed-progress setup issue does not explain these results. There were no play effects while the manual hold remained set. Attempts 3 and 4 preserved story order without overlap.

## Finding: stationary freshness conflicts with the current request

At B, callback gaps were **68.064 s**, **63.978 s** and **62.003 s** in attempts 2–4. Their next fresh fixes were within about 9 m of the saved point and released B within 107–137 ms. B had already been recognised before Resume; the missing ingredient was fresh revalidation.

The reducer correctly rejects automatic playback from a position older than 15 seconds, protecting against leaving a pending stop. The live adapter requests a two-metre minimum displacement and a two-second interval. Installed `expo-location` 57.0.17 maps this to `LocationRequest.Builder.setMinUpdateDistanceMeters(2)`. Google's [request documentation](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest.Builder) states that updates below this displacement are not delivered, and the interval is desired timing rather than a guarantee. The displacement threshold is a strong explanation for stationary gaps; the exports do not identify the native reason for each suppressed/missing callback, so other provider/delivery effects are not experimentally excluded.

**Next correction:** remove movement-dependent delivery during an active tour, keep the freshness gate, and verify stationary callbacks with the phone locked. If insufficient, add bounded fresh-location acquisition when releasing a pending arrival, including after unfinished narration completes. Log stale-position waits explicitly. Preserve manual hold, cancellation on End/re-pause, route eligibility and no overlap. Measure additional stationary callbacks/battery use. This correction is **proposed, not implemented or installed** by this review.

This takes priority over pin calibration or radius tuning: B was already recognised. Tightening its radius or simply trusting arbitrarily old fixes would not address the demonstrated conflict.

## Acceptance and handoff

- **Supported:** in-app manual hold through arrival and a reported 60-second physical wait in attempts 2 and 4; over 60 seconds from recognised arrival to explicit Resume in the logs. Unfinished A resumes before B. Sidi heard B in attempts 2–4.
- **Open defect:** reliable prompt B release while standing still. Attempt 1 never released B; attempts 2–4 waited for fresh location beyond any remaining A narration. Keep the complete pause/resume cases open.
- **Inconclusive:** attempt 1's A audibility and attempt 3's full 60-second wait. These are not development-build baseline or offline cold-start/recovery passes. Flight mode was confirmed only for attempt 1, which had unresolved audibility/missing B.
- **Controls/locking:** no remote-command diagnostic, consistent with confirmed app controls. AppState and retained native keyguard/screen events support portions of the held walks but include screen wakes and deliberate unlocking for Resume. Actual lock-screen/headset pause remains untested; these runs are not continuous screen-off baselines.
- **Battery:** starts recorded 51%, 47%, 44% (setup/third) and 43%, low-power mode false. No paired per-run end readings in the reviewed intervals support a consumption claim.

The latest exported state is tracking stopped, hold `ended`, A completed, B in progress and C unplayed. Existing data and phone settings were preserved. Replay, fixture/prefix/checksum checks, native record review, documentation links/parity and diff were verified; no runtime change required a new APK or app unit-test run. See the [working checklist](../PHONE-CHECKS.md). Retest the complete pause cases after the stationary-delivery correction instead of repeating identical walks on the unchanged build.
