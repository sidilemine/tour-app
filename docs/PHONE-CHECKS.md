# Remaining phone checks

Current preparation: use [the four remaining outdoor checks](FOUR-REMAINING-WALKS.md) and Documents / Walking Tour Remaining. The development baselines are complete; the [self-contained preparation is complete](test-results/M1-four-case-preparation.md). Corrected STANDARD CLIPS is selected, stopped and reset, with no active guide attempt. The app can cold-reopen away from the Mac. Earlier batch details below retain their historical scope.

The app now includes **Offline test guide / saved results**. Choose a case, begin an attempt, return to the player to test, then record observations and export results alongside diagnostics. All instructions are available offline; engineer-prepared cases are labelled. [Full bundled guide](TEST-GUIDE.md).

To save each JSON, keep its unique default name or edit it in **Save or share JSON**, tap **Save to folder**, choose/create **Walking Tour Tests** under Documents or Downloads, then **Use this folder** → **Allow**. Wait for **Saved and verified**. Use a subfolder if Downloads itself is blocked. Save both test results and private diagnostics after each attempt. **Share instead** is optional and does not confirm a local save. The named export update is included in both prepared builds; direct saving, editable/repeated names and offline exports passed the connected-phone checks. The local **Documents/Walking Tour Tests** folder is ready. See [export delivery evidence](test-results/M1-exports.md).

Updated 15 September 2026. M1: **implemented; awaiting physical test**. This is the working checklist; [ROADMAP](../ROADMAP.md#physical-phone-procedure-for-m1) retains the full criteria and [M1 results](test-results/M1.md) holds evidence. Tick a box only after its observations/logs are recorded, not because the code exists.

On 15 September the engineer left a loaded **development session** for the seven-case outdoor batch, with Metro stopped, Fast Refresh off, and network off. Do not force-close/reload it outdoors; cold reopening may need the Mac. Restore the self-contained APK after this batch for independent cold reopening. Your three-stop route stays saved when you select **New walk / reset progress**. The engineer collects/replays private JSON; you supply the real walking, audible observations and phone prompts.

Latest review: [three development walks and a detour](test-results/M1-three-baselines-and-detour.md). All six automatic arrivals met the locked silent-gap requirement, so the three-run arrival baseline is closed. Run 2’s timer unlock preceded another uninterrupted three-minute interval; run 3’s End cut C short after the successful locked arrival. Those limits are recorded, not relabelled as three full narration completions. No more normal baseline walks are requested.

Remaining outdoor work: **one full-route battery-saver run and three short cases**—early arrival, pass pending, and the corrected detour including manual replay/paused return. The detour exposed inaccurate saved path geometry; a corrected candidate is prepared privately, not installed. Sidi confirms only leaving/rejoining in the latest attempt. The five at-home checks below remain open. Poor GPS remains a conditional observation subcase.

## Pause-at-arrival evidence

The [stationary-location correction](test-results/M1-stationary-location.md) was physically verified on source `84599b46333c1aa1` and remains unchanged in the prepared build `bb0a0e3554c55ed7`. The connected locked check and both outdoor repeats now support fresh delivery during a held arrival. Guide revision 4 retains the procedure for future regressions. **No further identical in-app pause walks are needed.** The later remote-control case also passed below; the development baselines and other remaining cases stay separate.

- [x] In-app Pause after A finishes: B stays held, then starts **0.187 seconds after explicit Resume**. The recognised held-arrival interval was 69.4 seconds.
- [x] In-app Pause during A: arrival stays held; Resume finishes A, then B starts **0.121 seconds after A ends**, with no stale-position delay. The recognised held-arrival interval was 71.0 seconds.
- [x] Actual earbud Pause/Play during an arrival walk: Sidi confirms 60 seconds physically waiting at B; remote Play resumed A before B. GPS recognised held arrival 46.873 seconds before Play, recorded separately from the physical wait. See the [new result](test-results/M1-remote-and-offline-walks.md).

The pause cases do not require three minutes of A→B travel; their procedure requires a full 60-second wait at B while paused. GPS-derived held intervals support the result but are not surveyed physical arrival times; see the result record for confirmation limits. The three-minute genuine-silence rule remains required for the separate baseline walks.

Stop safely before touching the screen. **End** stops tracking. Export diagnostics after each attempt; New walk retains old logs. Do not delete logs or reinstall between a checkpoint and a recovery check.

## Controlled baseline walks

The first functional walk worked: B/C triggered once and all clips completed. The log measured 3:09.6 and 2:50.7 silent gaps; it also contains brief foreground activity. It is useful evidence, but not one of the strict baseline passes.

- [x] Engineer prepared the development build, cached clips and disabled Fast Refresh. Verify fresh fixes before leaving; unplug USB, stop Metro, disable Wi-Fi/mobile data, keep Location on. Use ordinary battery settings and no debugger.
- [x] Development baseline 1: reported successful; both gaps exceed three minutes and A/B/C completed with the app backgrounded through the critical interval. See the 15 September review.
- [x] Development baseline 2: both quiet-gap arrivals and all clips succeeded. Timer unlock was followed by over three uninterrupted locked minutes before B.
- [x] Development baseline 3: both locked quiet-gap arrivals succeeded, completing the six-arrival series. End stopped C early after its arrival; do not claim full C completion for this run.
- [x] Self-contained offline locked walking repeat: 4:17.469 and 3:16.878 silent gaps, A/B/C once and completed. Same-build offline cold opening passed separately in the connected recovery session; this outing was not a new cold-process launch. See the [evidence distinction](test-results/M1-remote-and-offline-walks.md).

Aim for **four minutes of actual silence after each clip ends** before entering the next stop area (minimum three). If necessary wait safely before approaching the stop; time spent after an early trigger cannot lengthen the tested gap. Do not unlock between clips. Each next clip must begin once within 30 seconds of physically arriving. Note estimated arrival time for comparison with logs. The engineer restores the self-contained variant after development tests.

## Connected-phone checks with the engineer

Latest [connected recovery/permission results](test-results/M1-connected-recovery-permissions.md) cover the self-contained build. The Android permission-dialog process crashed once during testing; its retry succeeded. Original phone settings were restored, and the stopped self-contained app was left installed.

- [x] Spotify interrupts narration; stopping music leaves it held; explicit Resume continues the saved clip. [14 September audio results](test-results/M1-audio-interruptions.md).
- [ ] Temporary interruption with actual audio-focus return (for example a call): returning focus never resumes narration by itself. Spotify retained focus when paused, so its successful test did not exercise this subcase.
- [x] Bluetooth earbuds into their closed case, then reconnect: no speaker narration, hold remains, and explicit Resume completes B through the earbuds. Tested with Sidi’s earbuds; wired and other output patterns are not inferred.
- [x] Deny/revoke location and switch it off/on: manual A remained audible, denied Start explained the limitation, and restored fresh fixes preserved manual hold (14 September connected check).
- [x] Self-contained force-stop during active tracking/playback and with a saved manual hold, reopen offline: route/completed stops and offsets recovered within the five-second target; Sidi confirmed silence after reopening. Stationary connected evidence, not a walking baseline.
- [ ] Extend recovery coverage to a deliberately skipped stop and an active guide attempt/notes; verify both survive alongside progress. Preserve the existing journal.
- [ ] Swipe-away separately: document actual service/progress behavior, then reopen deliberately.
- [ ] Development-build recovery: same checks, recording any Metro dependency. Unscheduled process kill is separate from orderly End.

Self-contained cold launch, stationary media pause/resume, and the connected force-stop/permission cases above have passed within their recorded scope. The remaining cases extend that evidence; force-close is allowed to stop the tour until reopened.

## Engineer-prepared field edge cases

The [prepared seven-case batch](TOMORROW-WALKS.md) explains ordering and fixture selection. The two timing cases use the original A/B/C path with a separate long-A fixture; the app labels it EDGE TEST. Connect briefly before leaving to load the development session.

- [ ] Prepared long-A fixture: reach B before A finishes. No overlapping or cut-off story; B only plays when A finishes and arrival remains appropriate.
- [ ] Pass the pending stop before A ends: no stale backlog of “stand here” narration.
- [ ] Leave/rejoin: approximately 62-second false off-route status traced to sparse fixture geometry. Corrected candidate prepared locally; manual-fallback/held-return substeps are not in the latest log. Poor/lost GPS remains conditional.
- [ ] Record start/end battery, battery saver and app battery policy for baseline walks. Try power-saving conditions separately; report limits rather than silently changing settings for a pass.

## Result card (copy per attempt)

Case / date / variant + source ID / network / battery start→end / saver + app battery policy / speaker or headphones / route version / expected / actual / silence lengths / arrival delay / duplicates or crashes / private export filename / engineer replay result.

Precise traces stay private. Send only the diagnostic JSON to this project, not an unrelated cloud service. The route fixture JSON records the path; **walking-diagnostics.json** records what the player did.
