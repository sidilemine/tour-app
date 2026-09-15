# M1: remote-pause walk and self-contained offline locked walk

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

14 September 2026. **Both newly reported walking cases pass within the evidence below. M1 remains implemented; awaiting physical test for the remaining matrix.** Sidi identifies these as the earbud Pause/Play A→B test and the full offline locked A→B→C walk, reports both went according to plan, and separately confirms the full 60-second physical wait at B. For the second walk, Sidi confirms SIM and Wi-Fi off, locked operation and at least three minutes of silence on each leg.

## Evidence and preservation

Both exports were saved in Documents on the phone, outside Walking Tour Tests. They were copied read-only into ignored `diagnostics/new-walks-2026-09-14/exports/`; phone and local checksums match. Both declare source `84599b46333c1aa1`, `offline-release`, Pixel 6 / Android 17. The original three-stop/ten-point fixture and all preceding transition prefixes match the prior backups.

| Export | SHA-256 | Full / isolated production replay |
|---|---|---|
| `walking-diagnostics-2026-09-14T18-09-48-983Z-sqdkct.json` | `680a6d03a27ea2d70c064dae3cd4bb830ac29e7b92231816271a2956690276fb` | 2,949 transitions / 24 segments; new walk 197 / one segment |
| `walking-diagnostics-2026-09-14T18-22-46-406Z-p7fie5.json` | `eb4ea0eceba85378f84bff8d009a80b058e0f057d747f93a7aeaed02fc3b8416` | 3,265 transitions / 25 segments; new walk 307 / one segment |

All replays passed. Exports are cumulative; previous walks are not counted again. These new files are diagnostics, not guide result exports. Sidi's observations were supplied in conversation, and the app's journal was neither inspected nor edited during this review. No phone controls, settings, app state, APK or route were changed. Native exit/lifecycle records were read privately.

## Earbud Pause/Play at B — passed

Times are BST. Start 19:04:47.076; End 19:09:45.717.

- A began at 19:04:47.458. A real remote Pause arrived at **19:04:50.794**; the saved offset was **2.348 s** and manual hold followed at 19:04:50.797.
- The app was backgrounded at 19:04:57.641 and stayed backgrounded until 19:09:44.493. Remote Play at **19:09:25.136** caused explicit Resume at 19:09:25.141, before foreground return.
- The full manual-hold interval was **274.344 s**, with no play effects. First GPS-confirmed held arrival was 19:08:38.268, **46.873 s before Resume**. Sidi separately confirms a full **60 seconds after physically reaching B** before pressing Play. Do not relabel the shorter GPS interval as a measured 60 seconds.
- Around the implied physical-arrival time, recorded fixes lay just outside the 30 m entry radius; they crossed inside and accumulated dwell later. Fixes continued regularly: 149 callbacks, median interval 2.0005 s, maximum gap 3.919 s. This was not the old minute-long stationary callback starvation. Coordinate capture/live-fix uncertainty and the arrival zone remain calibration considerations.
- Resume used a fix only **0.922 s old** and continued A at its saved offset. A completed at 19:09:34.773; B began **0.140 s later**, once and without overlapping narration.
- End occurred before B's completion callback, leaving B in-progress at 9.496 s. Do not claim this attempt completed B. Its remote-hold/release and unfinished-story ordering are established; complete B playback is independently established in the next walk. No further identical remote-pause repeat is requested for this case.

The real headset Pause and Play, preserved arrival hold, owner's physical wait confirmation, background continuation and correct A→B ordering close the walking remote-control check. C was unplayed in this short attempt.

## Self-contained offline locked walk — passed

Start **19:14:25.085**; End **19:22:42.822**. A brief setup session from 19:14:08 to 19:14:19 was stopped before the fresh walk; it is retained in the cumulative export and is not counted as another baseline.

| Measure | A → B | B → C |
|---|---|---|
| Previous clip completion | 19:14:37.116 | 19:19:06.637 |
| Arrival request | 19:18:54.419 | 19:22:23.315 |
| Next clip native playing | 19:18:54.585 | 19:22:23.515 |
| Genuine silence between native statuses | **257.469 s — 4:17.469** | **196.878 s — 3:16.878** |
| Request → native playing | 0.166 s | 0.200 s |
| Distance from stored standing coordinate at trigger | 21.93 m | 24.13 m |
| Reported horizontal accuracy / fix age | 6.45 m / 92 ms | 4.52 m / 149 ms |

A/B/C each have one play request and one completion. The walk contains no manual playback, Pause, Resume, skip, audio error or reopened event. C completed at 19:22:36.051; final state has all stops completed, tracking stopped and ended hold. There were 248 fix callbacks, median interval 2 s and maximum gap 3.005 s.

Sidi supplies the audible, offline and locked-screen observations. The app was backgrounded at 19:14:40.218 and did not return to foreground until 19:22:41.225, after C's completion. Retained native events begin around C: its playing status precedes the first retained screen wake by 139 ms; keyguard dismissal appears approximately 0.6 s before the JavaScript completion callback. This does not show an unlock that enabled either arrival. Earlier native lock events are no longer retained, so the owner's report remains necessary for the long locked intervals. Request latency is not a surveyed physical-arrival timestamp; the reported normal arrivals, with C slightly early, supply that aspect of the result.

Start/end battery readings were **100% → approximately 99%**, with low-power mode false at Start. Sidi independently reports the same change, describing it as barely reaching 99%. This is a short-run observation, not a reliable consumption-rate estimate. Network off is owner-reported rather than measured by these diagnostic envelopes. App-specific battery policy was not independently recorded during this walk; no all-power-modes claim follows from this result.

**Cold-start distinction:** this outing log contains no new process-open event before the walk; it does not establish a fresh offline process launch immediately followed by this walk. Offline cold opening, recovery, explicit Start/Resume and local playback were already verified separately on this exact unchanged self-contained build in the [connected recovery record](M1-connected-recovery-permissions.md). The new evidence closes the previously missing offline locked-walking portion; those two sources establish separate cold-start and walking results, not a fabricated single continuous cold-start-to-walk trace. The three development-build baselines remain outstanding.

## C's early trigger and scope

Sidi estimates C began roughly **10 m before the physical spot originally recorded**, consistent with earlier observations. The current reducer deliberately accepts a next-stop arrival within **30 m**, after route/dwell/quality checks; the logged C trigger was 24.13 m from the saved coordinate. A physical distance estimate and distance between two GPS coordinates are different measurements. Neither the reported ±4.52 m live accuracy nor the stored coordinate establishes a surveyed position or the original capture error.

Retain this observation with the existing [arrival-calibration work](../ARRIVAL-CALIBRATION.md). No radius, route, capture point or physical-verification status was changed. This is not a new mandatory repeat of either successful walk. More precise visitor positioning remains an existing curation/calibration concern before real orientation-sensitive narration.

Native exit history records no app termination in either walk; the latest entry is the earlier deliberate 18:10 handoff force-stop. Retention limits prevent a universal no-crash claim. Full/isolated replay, checksum/prefix/fixture equality, event/offset/fix timing, native records, guide parity, links and diff checks constitute this review. No app rebuild or unit-test rerun was needed for documentation-only changes.

The [working checklist](../PHONE-CHECKS.md) now closes these two cases. Assuming successful attempts, its planned outdoor work is four full-route runs (three development baselines and one battery-saver run) plus three short field cases (detour/rejoin, early arrival, pass pending). The five remaining at-home checks are unchanged. Naturally poor GPS remains a conditional subcase, not a requirement to keep walking indefinitely until signal fails.
