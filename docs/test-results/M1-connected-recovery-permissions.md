# M1: connected offline recovery and location permissions

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

14 September 2026, approximately 17:26–17:41 BST. **The tested self-contained force-stop and location-permission cases passed; M1 remains implemented, awaiting physical test for the remaining matrix.** These were stationary USB-connected checks on Sidi's Pixel 6 / Android 17, not additional walking baselines.

## Build and preserved evidence

Installed self-contained source `84599b46333c1aa1`; APK SHA-256 `883d5990a7a065eaf123a93fee5043d568d6bf4bf5e553778a062bd0b21ecc0d` matched the previously verified artifact. No installation, app-data clearing, fixture replacement, progress reset or application-code change occurred during this session.

The prior successful-walk export was copied before testing. After testing, the app's **Saved and verified** flow saved `walking-diagnostics-2026-09-14T16-39-21-039Z-djp7p3.json` to Documents/Walking Tour Tests. Phone and copied SHA-256 matched: `782aae5b8952e94d2a12b9ce8d4db7a1818ad5fb7a56e3a33989ad003e7d051e`.

Private originals, UI snapshots, native exit/media/service records and timing files are under ignored `diagnostics/connected-checks-2026-09-14/`. No raw coordinates or unrelated phone content are committed. The original three-stop/ten-point fixture is byte-equivalent as parsed JSON; the prior 2,355-transition prefix is unchanged. Final A/B remain completed, C unplayed. Manual replays of already completed A/B did not undo completion. No guide journal entries were edited or automatically certified.

## Offline force-stop recovery

Wi-Fi and mobile data were disabled, Android reported **Active default network: none**, and no Mac listener existed on Metro port 8081. Each test used deliberate Start/Resume or manual playback, then `am force-stop` without End. Native exit history identifies the deliberate force-stops, separately from process kill, swipe-away or a crash.

| Case | Recorded checkpoint and recovery | Result |
|---|---|---|
| Active tracking, manually replayed B, no hold | Last playing checkpoint at 17:27:01.685 was **4.763 s**. Force-stop exit at 17:27:02.235; cold reopen showed B paused at 4.8 s, recovery hold, tracking stopped. The next Start retained the exact 4.763 s. | Native/UI pass; Sidi was not nearby for this first audible attempt. |
| Audible repeat | Start retained recovery; explicit Resume requested B at 4.763 s. Last playing checkpoint at 17:28:56.617 was **6.461 s**. Force-stop exit at 17:28:57.397; cold reopen showed 6.5 s, recovery hold and tracking stopped. | Sidi confirmed hearing B resume, stop and remain silent after reopening. |
| Saved manual hold during active tracking | Explicit Pause set manual at 6.461 s. Start retained it; force-stop at 17:29:34.061 and cold reopening retained the same displayed position and manual hold. | Exact offset/hold retained; no automatic play effect. |

For the two playing cases, elapsed time from the recorded playback request to process exit, at the observed normal playback speed, bounds uncheckpointed narration below approximately **0.9 s and 1.3 s** respectively. These are conservative timing bounds, not microphone measurements; both are within the five-second target. Recovery assertions use visible cold-reopen state and exact subsequent event state, rather than replay alone. No app services remained after the inspected cold recovery.

This establishes the tested self-contained cases with existing completed stops. It does not establish recovery of a deliberately skipped stop or guide attempt/notes in this session, unscheduled process termination, swipe-away, development-build recovery or uninterrupted service after force-close. Those remain distinct checks.

## Location denied and restored

Precise, approximate and background location grants were revoked while tracking was stopped. Android recorded an expected **PERMISSION CHANGE** process exit at 17:30:01.670. The app reopened with the manual hold. A manually requested A played and completed with location denied (17:30:15–17:30:26).

The first Start/permission-dialog attempt encountered a separate Android failure: `com.google.android.permissioncontroller` aborted in its RenderThread at 17:31:22–23 with `VK_ERROR_DEVICE_LOST`. The phone unexpectedly displayed a previous app. Sidi reported not knowingly touching it. Retained Walking Tour Lab exit records contain no corresponding app crash; the permission-controller crash is observed, while the precise window-switch sequence is not fully established. No system graphics setting or other app was modified to work around it.

A single subsequent permission-dialog retry succeeded. Choosing **Don't allow** produced **Location denied. Manual playback is available; grant location to start tracking.** Tracking remained stopped. A second manual A request at 17:36:16.635 played and completed at 17:36:28.044 with all location grants still denied. Sidi confirmed hearing it. Manual intent remained held throughout both deliberate manual clips.

The original precise/background grants were restored. Start at 17:37:19.780 retained the manual hold and resumed location. Device location was then off for approximately **18.1 seconds**. Android displayed its expected location-off warning; location was restored before dismissing that warning. The last pre-disable fix was received at 17:37:39.303; the first post-enable fix at 17:38:00.179 was only **215 ms old**, about 1.3 seconds after the enable command. Fresh updates continued. All **41 transitions** from the final Start through the held interval before End preserved manual hold and issued no play effects.

These checks establish denied-location manual playback, a truthful Start error, restored tracking and hold preservation through device-location off/on. They do not simulate every poor-signal situation or an outdoor leave/rejoin case. A stale coordinate is still not authorized to release automatic narration.

## Handoff and verification

End stopped tracking at 17:39:05.404. After saving the export, another deliberate cold reopening visibly showed the original route, silence, stopped tracking and the ended hold. No app services remained. Wi-Fi/mobile data were restored to their original enabled values; device location was enabled. Location grants **and permission flags** exactly matched the initial snapshot, including removal of temporary `USER_FIXED` flags introduced by denial. The temporary USB keep-screen-awake setting was returned to its original value, zero. The self-contained APK remains installed; no Metro is needed for independent use.

Automated review reproduced **2,485 stored transitions / 22 segments**. The new subset reproduced **130 transitions / five segments**. Segments reflect preserved earlier walks and recovered process states; the replayer does not independently prove cold-start hydration or audibility. Fixture and historical-prefix equality, checksums, native/UI evidence, guide/document parity, local links and whitespace were checked. No build or unit-test rerun was needed for this documentation-only result update.

Actual lock-screen/headset pause while walking, audio contention/output disconnection, skipped/guide-note recovery coverage, swipe-away, unscheduled process kill, development-build recovery, controlled offline locked baselines and remaining route/battery edge cases are still in the [working checklist](../PHONE-CHECKS.md).
