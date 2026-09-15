# M1: two further walks and Spotify observation

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

13 September 2026. **Implemented; awaiting physical test.** This is a review of two actual diagnostic exports and Sidi's observations, preserving the earlier setup attempts separately. No app code, trigger thresholds, route or installed APK changed during review.

## Evidence preserved

The new diagnostics were saved in the phone's **Documents** directory, not its Walking Tour Tests subfolder. Both were copied unchanged to ignored `diagnostics/two-walks-2026-09-13/new-exports/`. The saved fixture is identical in both and matches the earlier backed-up three-stop/ten-point fixture.

| Original export | SHA-256 | Full replay |
|---|---|---|
| `walking-diagnostics-2026-09-13T18-28-49-708Z-74rgvq.json` | `fc7d076205aa01c1714a6486da25d46135cb49483f82cde2f48addad4a685e14` | 945 transitions, 9 segments |
| `walking-diagnostics-2026-09-13T21-17-15-086Z-kmoh3p.json` | `82e91e4a13ef17e52fa2682bfd36f14a13da527cda7391893ab4951f151dc7c4` | 1,241 transitions, 10 segments |

Both carry source `4fa6ab9dd753797d`, Pixel 6 / Android 17. The self-contained installation was previously checksum-verified; no development build has been installed since that handoff. Each replay reproduced all stored transitions using the current reducer. This checks recorded behavior, not independent audibility or ground truth.

The engineer also saved/exported the current journal without modifying observations. It contains only the earlier labelled inconclusive guide smoke check, with no active attempt. The new walks exist in diagnostics but were not recorded as completed guide attempts. Do not fabricate journal entries or infer an unfinished guide attempt from the aborted tracking session. Raw exports, journal backup, native records and analysis remain ignored/private.

## Earlier setup attempts

Sidi reported an earlier attempt with incorrect initial setup. The logs show Start at 19:00:11 BST with all three stops already completed and the `ended` hold retained; End followed at 19:04:19. Another Start at 19:08:16 had the same completed state; Resume at 19:09:39 and 19:12:53 did not make completed stops eligible. End followed at 19:19:44. These are tracking/setup attempts, not successful fresh walks or demonstrated playback crashes.

The 19:20 Start follows a fresh progress reset and starts A with B/C unplayed. The behavior explains the setup problem: reopening, Start and Resume preserve completed stops; a fresh repeat requires **End → New walk / reset progress → Start**. No additional reset was performed during this review.

## Completed runs

Times below are BST. Gaps measure the previous clip's native completion to the next native playing status. They are **intervals without tour narration**, not proof of actual silence if Spotify was playing.

| Measure | First completed walk | Second completed walk |
|---|---|---|
| Start → End | 19:20:03.182 → 19:28:35.950 | 22:08:33.070 → 22:16:56.404 |
| A completed → B playing | 243.654 s (4:03.7) | 249.672 s (4:09.7) |
| B completed → C playing | 207.803 s (3:27.8) | 207.159 s (3:27.2) |
| A/B/C play requests and completions | One each | One each |
| B/C requested by | Automatic location arrivals | Automatic location arrivals |
| B/C confirmation → native playing | 166 / 194 ms | 238 / 293 ms |
| GPS fixes through End / max receipt gap | 227 / 13.689 s | 237 / 11.888 s |
| Recorded start battery / low-power mode | 80% / false | 69% / false |
| Isolated run replay, Start through first End | 284 transitions, 1 segment | 295 transitions, 1 segment |

No manual-play, pause, resume, skip or audio-error event occurs within either completed run. Both finish A/B/C completed, tracking stopped and the ended hold saved. The crash buffer read during this review contains no new app entry since the prior handoff; absent/expired crash records cannot prove that no crash ever occurred. No end-battery reading or full network/output/battery-policy record is available, so battery use is not inferred from the two start readings hours apart.

The first walk includes foreground entries during the gaps (19:20:28–19:20:31 and 19:24:38–19:24:46); both arrival/play events occur in background. In the second, AppState stays background from 22:08:43.583 (before A finishes) until 22:16:49.781 (after C finishes). That supports uninterrupted background operation but is not a lock-state sensor. Sidi subsequently confirmed no Spotify and a locked phone throughout the first walk; Spotify was used only on the second, with a deliberate unlock at B because it had not yet triggered. Record the first walk as a positive user-reported music-free locked run. The first walk’s brief AppState foreground entries remain an unexplained instrumentation discrepancy; historical Android screen events for that window are no longer present in the retained buffer. Wi-Fi/mobile-data conditions and end-battery remain unrecorded.

### Second B: unlock coincidence checked against native events

Retained Android event-buffer timestamps corroborate Sidi's B observation: screen on at 22:12:48.786; arrival/play request at 22:12:54.446; keyguard-going-away at 22:12:54.596; native tour playing at 22:12:54.684; keyguard hidden at 22:12:55.168. Thus B began during unlocking, even though the tour's AppState stayed background. AppState alone would have incorrectly suggested an uninterrupted locked run.

GPS delivery was already continuing before the screen woke: a fix at 22:12:47.229 was 30.479 m from the stored point, just outside the 30 m zone. Subsequent fixes at 22:12:50.123 (29.505 m), 22:12:51.942 (27.304 m) and 22:12:54.446 (25.602 m) completed the arrival dwell rule. This explains why no request existed before the qualifying fixes; there is no logged pause in GPS delivery at B. It does **not** prove audio would have started without the screen wake, or that waking had no effect on location estimates. Preserve that as a retest condition rather than asserting a screen-dependent failure or a locked B pass.

Android records screen off again at 22:13:13.775. It briefly wakes with keyguard still shown at 22:15:56.094, then screen off at 22:16:05.857. C starts at 22:16:33.416 with the screen off and keyguard shown; screen on follows at 22:16:45.112 near clip completion. Other brief screen wakes occur in the second run, so do not classify it as a continuous screen-off baseline. The retained private OS event log is under `diagnostics/two-walks-2026-09-13/android-events.txt`.

## Arrival position observations

Sidi reports B at the physical recorded spot on the second walk, compared with the usual roughly 4–5 m early trigger, and C roughly 10 m early instead of the usual 3–5 m.

| Stop | First walk: reported distance / accuracy | Second walk: reported distance / accuracy |
|---|---|---|
| B | 25.011 m / 4.849 m | 25.602 m / 4.685 m |
| C | 21.231 m / 5.813 m | 23.582 m / 4.447 m |

Distance is computed between the **live reported GPS coordinate and stored standing coordinate** at the arrival decision. It is not a measurement of how far Sidi physically stood from the remembered spot. The accuracy field is the provider's estimated horizontal uncertainty, not a guaranteed bound or proof that the stored point is correct; see [Android Location.getAccuracy](https://developer.android.com/reference/android/location/Location#getAccuracy()).

The current lab rule permits the next stop within 30 m, with usable fixes, route cross-track ≤45 m, no detected reversal and at least three agreeing fixes spanning four seconds. B used four fixes / 5.952 s on the first walk and three / 4.304 s on the second; C used three / 4.122 s and three / 4.005 s. Fix ages at confirmation were 34–129 ms. No change to thresholds or saved geometry occurred between these runs.

These logs show consistent execution of the broad arrival-zone rule, not exact-pin arrival. The discrepancy at B suggests live and/or originally recorded position error, or a difference in the physical reference; this evidence cannot isolate the cause. Reducing the radius based only on remembered distances risks missed triggers. Before precise viewpoint-dependent narration, verify stored visitor positions against repeated observations at the physical spot, review the approach/corridor, and tune a suitable stop-specific zone. Do not silently treat a 30 m lab trigger as verified physical orientation. The frequent off-route classifications (71 and 74 fixes) also deserve route/trace review; they do not establish that Sidi left the intended path.

## Spotify and acceptance disposition

Sidi reports Spotify stopped and started again while locked, and confirms it was playing only on the second completed walk. Record this as positive observed **music yielding to tour clips and resuming**. Tour logs show each clip completing normally, but contain no Spotify playback or audio-focus-owner timestamps; they cannot independently prove music resumption. This is distinct from deliberately starting competing audio during an unfinished story, which must pause the tour and require explicit Resume. That interruption/hold test remains open.

Both completed walks meet the numerical three-minute interval between tour clips and repeat automatic A/B/C playback without logged duplicates. Neither is counted as one of the required development-build baselines. The first adds user-reported music-free locked playback, with network/end-battery conditions and the brief AppState discrepancy still unresolved for full acceptance. The second is a Spotify coexistence run: B coincides with unlock and C starts screen-off; music and screen wakes prevent classifying it as the controlled genuine-silence baseline. The pause-at-arrival test is not demonstrated by these runs because no pause/resume occurred. Preserve this successful functional evidence while keeping the [remaining checklist](../PHONE-CHECKS.md) and full M1 gate open.

Review performed: unchanged-export checksums, fixture equality, full and isolated production replays, event/hold/arrival/offset/lifecycle inspection, journal export and app-scoped crash/exit review and retained Android screen/keyguard-event correlation. Documentation links/parity/diff checked. No new build or app unit-test run was needed for this evidence/documentation-only change. The phone was left on the player with the original route retained, no unplayed stops and **TOUR STOPPED**; no connectivity setting was changed during review.
