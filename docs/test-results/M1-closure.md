# M1: connected closure checks and loading-offset correction

15 September 2026. The five remaining connected criteria passed in their recorded scope on source `aaa261ee84596b55`; an observed loading-checkpoint weakness was then corrected. Final corrected-build verification/handoff is recorded below. All planned outdoor cases remain accepted in the [final field review](M1-final-outdoor-report.md). No new outdoor case is introduced.

## Preserved data and conditions

Pixel 6 / Android 17, stationary and USB-connected. Initial self-contained app source `aaa261ee84596b55`, guide 5. Airplane mode was enabled, with Wi-Fi enabled as an airplane-mode override (`wifi_on=2`), the mobile-data toggle on, Battery Saver off and USB stay-awake zero. The mobile-data toggle does not establish an active cellular connection in airplane mode. Background app-operation defaults were allow, with no device-idle whitelist entry for the tour. Precise/background location permissions were already granted. The engineer disabled data/Wi-Fi for offline recovery and temporarily enabled USB stay-awake; all were restored at handoff, leaving airplane mode unchanged. Speaker media volume was unmuted at 13/25 and was not changed.

A verified 36,527,616-byte app-only private backup preceded testing. The matching debug APK was installed only to read the backup, without launching it, then the self-contained APK restored before its tests. SQLite integrity passed. Before the loading fix, all 6,987 original events, the fixture and archived progress were unchanged; the three original guide reports remained an exact prefix. A fourth, explicitly partial guide report records the new skipped-stop/note coverage. No app uninstall or storage clearing occurred.

Raw evidence stays under ignored `diagnostics/m1-closure-2026-09-15/`. Copies of the SQLite files are engineer evidence, not user-produced JSON exports. The replayer input was reconstructed locally and filtered to the current fixture/version exactly as the app's exporter does. The first attempted full-database replay included other fixtures and failed; correcting that intake selection produced **1,685 transitions / nine segments**. The new subset reproduced **517 transitions / five segments** before the loading-policy correction. No assertions were relaxed. Older-policy callbacks intentionally differ after the fix; retain these original results and use the new source's segment for its regression check.

## Self-contained force-stop extension

At 19:04 BST, explicit Pause set a manual hold before Start. A was completed, B deliberately changed to skipped, C remained unplayed. A distinct guide attempt contained the exact marker note beginning `M1 closure marker R1`. Actual offline force-stop occurred at **19:05:22.202**; no build replacement or End intervened between checkpoint and reopening.

Cold reopening retained manual hold, completed A, skipped B and the same active guide attempt and exact note. Tracking was stopped and there was no play effect. The follow-up Start still retained the manual hold. This closes the missing skipped-stop/active-note extension; the previously accepted [playing-offset and audible force-stop cases](M1-connected-recovery-permissions.md) retain their original scope. The new on-phone report is labelled inconclusive because that single attempt did not repeat those earlier subcases; this does not erase their accepted evidence or claim they were repeated now.

Location services registered during these desk checks, but no usable fresh fix was captured indoors with network off. These are storage/lifecycle/manual-player checks, not new proof of location readiness or background arrival. The accepted physical walks establish that separate behavior.

## Actual Recents swipe-away

The first gesture was inconclusive and did not establish task removal. The repeated gesture verified that only the identified Walking Tour card was removed from Recents. Native exit history records **19:09:08.810, USER REQUESTED / REMOVE TASK**, distinct from force-stop. The app's services disappeared. Deliberate reopening was a cold launch and retained the manual hold and exact guide note; completed/skipped progress remained intact.

This passes the held active-session swipe-away case on this phone. It does not promise continuing narration or location after dismissal, nor equivalent behavior on every device. The original active-playing force-stop and later SIGKILL checks cover their different interruption mechanisms separately.

## Real transient focus loss and return

The engineer-only [focus companion](../../tools/android-focus-probe/README.md) requested actual Android `AUDIOFOCUS_GAIN_TRANSIENT`, emitted a quiet 300 ms marker, held focus for eight seconds, then abandoned the same request. It used no network/permissions and never accessed tour state. It was removed after testing. This is a native competing-app test, not a claim about telephony-specific routing.

USB disconnects interrupted preparation; commands were stopped/retried after reconnection. The first completed native focus attempt recorded loss and return but the owner's audible report was uncertain: the beep was unclear and Resume was not confirmed. That attempt alone was not accepted. Source inspection and stream-volume checks found no demonstrated mute problem; no volume or native-audio patch was changed. A shorter, clearly cued repeat supplied the audible evidence.

Accepted development-build repeat:

| Event | BST / outcome |
| --- | --- |
| A playing after explicit Resume | 19:21:50.566, saved offset 105.947 s |
| Actual transient loss delivered to tour | 19:22:21.379, native code -2 / handleLoss |
| Tour paused | 19:22:21.388, offset 136.751 s, interruption hold |
| Actual focus returned | 19:22:29.438, native code 1 / handleGain |
| Explicit Resume | 19:23:00.907, same 136.751 s |
| Native playing | 19:23:01.249 |

The tour remained held for **31.469 seconds after actual focus return** until explicit Resume. Sidi confirmed silence until Resume and audible speech afterwards. The beep's audibility is not the acceptance criterion; actual loss/return plus preserved silence and deliberate continuation are. Audio-focus checks require only seconds of narration; the long initial preparation was not a required clip duration.

## Development recovery and unscheduled process kill

The development build was force-stopped after a manual Pause at **185.727 s** (19:23:50.500 exit). With Metro stopped and phone networking off, cold launch reached the development launcher, not a usable offline player. Restarting local Metro and opening its USB-forwarded URL recovered exactly **185.727 s**, manual hold, completed A and skipped B. No speech began on reopening. This is an explicit Metro dependency; independent offline cold start belongs to the self-contained build.

After Start retained that hold, explicit Resume at 19:26:03.223 played the saved clip. Approximately four seconds later, the engineer sent SIGKILL from the app's own UID, without End or force-stop. Native exit records show **19:26:07.483, SIGNALED, status 9**. The final playing checkpoint was **188.424 s**, timestamped 19:26:06.443. At normal speed, using the earliest Resume time bounds possible uncheckpointed speech conservatively below **1.6 seconds**, within the five-second target; this is a timing bound, not a microphone measurement.

Deliberate development reopening recovered precisely 188.424 s, a recovery hold and stopped tracking. The subsequent End transition's before-state independently records that recovered value; no intermediate play effect occurred. Completed A and skipped B survived, as did the saved journal. Sidi confirmed hearing A resume, stop on termination and stay silent after reopening. These observations close the development recovery and separate unscheduled-kill cases. They do not promise uninterrupted operation after process death.

## Loading-offset weakness found during review

The pre-fix Resume stream at 185.727 s included two initial buffering callbacks at offset zero before the sought position arrived seven milliseconds later. Every transition is durable, so termination in that brief window could recover zero rather than the user's saved position. The physical SIGKILL missed that window and passed; the weaker intermediate checkpoint was nevertheless observable in its log.

A sanitized regression reproduces that sequence and closes/reopens a real SQLite file at the vulnerable boundary, also covering a manual Pause during loading and a load error. It failed on the original implementation (`0 != 185.727`). The reducer now preserves the commanded/last usable position during buffering, loading before playback, and errors. Once actual non-buffering playback starts, it accepts the real advancing position. This changes no route matching, arrival timing, native audio adapter or dependency.

All **79 tests**, typecheck and lint pass after the correction. The guide moves to revision 6: completed outdoor procedures remain as reference, and global acceptance wording is replaced with a reference-guide label rather than a stale pending message. Guide/document parity is checked. The offline Expo check reported up to date but explicitly warned that offline validation is unreliable. The subsequent online `npx expo install --check` exited 1 because newer recommended patches are now available: Expo 57.0.23, build-properties/location/task-manager 57.0.18 and sharing 57.0.20. This is a recorded outstanding maintenance recommendation, not a current compatibility-check pass. The earlier online check and 21/21 Expo Doctor result retain their original scope. No dependency changed during closure: the pinned versions compile and passed the physical matrix. Retain that tested baseline for M1 acceptance; evaluate the patch updates with affected native/build/device regression checks during subsequent maintenance instead of silently upgrading the handed-off app. Final build/device evidence follows; do not claim the corrected build was tested from the earlier APK's result alone.

## Corrected-build verification and handoff

**Passed; M1 complete on the tested Pixel 6 / Android 17 configuration.** The corrected source is `75fd0c0718dda379`, with guide revision 6. Both APKs passed local assembly, signatures, native audio marker and required manifest-permission checks. The development APK's native bytes are unchanged; its JavaScript is loaded separately from Metro.

| Artifact | Bytes | SHA-256 |
| --- | --- | --- |
| Self-contained APK | 34,741,555 | `4e6f11002081d6a07ec5d3d30efe6feae4a0d6aecdbc1765ee9afbdc41d78bb0` |
| Development APK | 69,048,968 | `f71a66c6a195edaeeae6ea16b054148c866766566b8d12543ad56d925de105bd` |

In the installed corrected self-contained build, Resume from **188.424 s** again produced two native buffering callbacks at zero. Both now durably retained **188.424 s**, followed by actual advancing playback. Force-stop at **19:34:32.986 BST** interrupted playback without End; cold reopening recovered the exact last checkpoint **192.158 s**, with a recovery hold, stopped tracking, completed A and skipped B. There was no build replacement between checkpoint and assertion. The corrected source's **14 transitions / two segments** reproduce with the current reducer. The older audible confirmations apply to the unchanged audio adapter; this final short correction was verified through native status, UI and persisted state, without requesting another listening confirmation.

After those assertions, a temporary matching development installation allowed an app-only SQLite copy without launching that variant. Integrity checks passed, all **6,987 original events**, the original fixture and archived progress were preserved, and all three original guide reports remained an exact prefix of four saved reports. There is no active draft. The fourth report remains explicitly partial as described above. The corrected self-contained APK was restored with `adb install -r`; no main-app uninstall, storage clearing or private-data upload occurred.

Final handoff: Metro stopped, offline cold launch rendered the player with **192.2 s**, ended hold and tracking stopped; no app services remained. The temporary focus companion was removed. Wi-Fi was re-enabled through the service and returned to `wifi_on=2`; mobile data returned to `1`, USB stay-awake to `0`, Battery Saver stayed `0`, and airplane mode stayed `1`. This preserves the owner's initial settings. The meaning of Wi-Fi value 2 was checked against [AOSP WifiSettingsStore](https://android.googlesource.com/platform/packages/modules/Wifi/+/refs/heads/main/service/java/com/android/server/wifi/WifiSettingsStore.java): it is enabled in airplane mode, not disabled.

## Acceptance scope and next work

The [phone checklist](../PHONE-CHECKS.md) now has no outstanding scheduled M1 case. Accepted field evidence is reused because this correction changes only checkpoint handling and guide wording, not arrival policy, location cadence, clips or the native audio adapter. No additional outdoor repeat is justified by it. Automated tests establish deterministic policy/storage behavior; actual walks, native device checks and Sidi's audible/physical confirmations establish their separately recorded acceptance results.

Known limits remain: broad arrival zones are not exact-pin accuracy; the eligible-leg-only off-route label can misdescribe onward travel past an unplayed stop; rounded battery observations are not an endurance estimate; other devices and telephony-specific routing have not been certified. Earlier developer-menu and permission-controller failures remain in their original records. Continuous service after force-close is not promised. M2's offline map, curated six-stop package/player and supervised content experiment remain separate work.
