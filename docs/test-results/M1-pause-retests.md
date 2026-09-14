# M1: successful pause-at-arrival retests

14 September 2026. Sidi reports that both requested repeats “worked great.” The saved exports corroborate held arrival, prompt release and unfinished-story ordering on corrected self-contained build `84599b46333c1aa1`, Pixel 6 / Android 17. These two in-app pause cases pass for this tested build/route. **M1 remains implemented; awaiting physical test** for the rest of its matrix.

## Evidence

The two new files were in **Documents**, outside its Walking Tour Tests subfolder. Originals were copied to ignored `diagnostics/pause-retests-2026-09-14/exports/`; each copied SHA-256 matched the phone. Both declare `offline-release` and contain the same original three-stop/ten-point fixture. Their cumulative transition prefixes match; do not count earlier attempts again.

| Original export | SHA-256 | Full production replay |
|---|---|---|
| `walking-diagnostics-2026-09-14T13-31-16-775Z-ortplz.json` | `7a0d417bd33d6d80f3394db3cedb637c470f012d7d4f4c299f8e424946d7e42b` | 2,166 transitions / 17 segments |
| `walking-diagnostics-2026-09-14T13-38-48-758Z-txqkfj.json` | `309b6cbee97f10f35aa43e7fa0262852f3ddda944527c9f447b9db59b370d1c8` | 2,355 transitions / 18 segments |

Both full exports reproduced without errors. Isolated Start→End replays reproduced 171 and 189 transitions respectively, one segment each. Raw GPS/native logs remain private. Native audio status timestamps measure reported playback rather than microphone audibility; Sidi's positive walk report supplies the physical observation.

## Results

Times are BST. The recognised-arrival timer is a GPS policy measurement, not a surveyed physical arrival timestamp.

| Measure | Pause after A finished | Pause during A |
|---|---|---|
| Start → End | 14:26:52.569 → 14:31:12.693 | 14:34:18.149 → 14:38:41.663 |
| Intended Pause | 14:27:07.090 (repeated at 14:27:08.951) | 14:34:23.847 |
| First recognised B arrival while held | 14:29:50.233 | 14:37:06.915 |
| Explicit Resume at B | 14:30:59.621 | 14:38:17.946 |
| Recognised arrival → Resume | 69.388 s | 71.031 s |
| Age of latest fix at Resume | 1.460 s | 0.830 s |
| B native playing | 14:30:59.808 | 14:38:26.377 |
| Release timing | **0.187 s after Resume** | A finishes at 14:38:26.256; B begins **0.121 s later** |
| Median fix callback interval, whole walk | 2.003 s | 2.004 s |
| Longest callback gap while arrival held | 2.088 s | 2.230 s |
| B completion | 14:31:11.876 | 14:38:37.954 |

A completed at 14:27:04.576 before the first walk's Pause. There were no playback effects while the hold remained set; Resume itself immediately requested B. In the second walk, Resume requested unfinished A at its saved **3.460-second** offset; native playing followed at 14:38:18.107. Fresh position remained available through A's remainder, and its completion immediately requested B. There was no overlapping or duplicate automatic B; both attempts ended with A/B completed, C unplayed, tracking stopped and the ended hold.

The second trace includes an extra early Resume event at 14:34:23.104, before the intended Pause. It re-requested A at 3.066 seconds. Preserve this setup event rather than claiming there was only one A request; it does not invalidate the subsequent held-arrival/explicit-resume case. No remote-command diagnostic or audio-error event appears in either run.

The entire walks' largest callback gaps were 5.424 and 5.458 seconds, rather than the roughly minute-long stationary gaps before the correction. During recognised held arrival, all observed gaps were below 2.3 seconds. No `pending-arrival-waiting-for-fresh-location` diagnostic occurred in these new walk intervals. This supports the correction on this phone and route; it does not guarantee the same cadence under every device/power/signal condition.

## Scope and disposition

These runs support the two instructed in-app pause tests, including more than 60 seconds of recognised held arrival, explicit release, completion and correct story order, alongside Sidi's report of successful execution. The exact physical wait/stationary procedure was not separately confirmed; the GPS-derived interval is not independent verification of where Sidi stood. Network, output device, battery policy and continuous locking were not separately confirmed for these repeats. They are not offline or development-build baselines, actual remote-control tests, interruption tests, or a new unattended early-arrival/pass-pending fixture test.

Start battery readings were 100% and 99%, low-power mode false. No paired end readings support a consumption comparison. Retained native exit history has a low-memory termination at 12:49:22, before these walks; no termination is recorded within them. The crash buffer contains only the earlier 13 September app failures. Retention limits prevent a universal no-crash claim.

The earlier [failed/delayed attempts](M1-four-pause-walks.md) and [stationary correction evidence](M1-stationary-location.md) remain preserved. The long stationary-release delay is resolved in these two retests. No further identical in-app pause walks are required for the current acceptance checklist. Actual lock-screen/headset pause, interruptions/output changes, remaining recovery/degradation cases and controlled baseline walks remain open in the [working checklist](../PHONE-CHECKS.md).

Review performed: unchanged-export checksums, fixture/prefix equality, full and isolated replays, event/hold/completion/offset/fix timing inspection, native crash/exit review and documentation parity/links/diff. No app code, APK, phone state or guide journal entry was changed by this review. No new build or unit-test run was needed; old private records were not deleted or uploaded.
