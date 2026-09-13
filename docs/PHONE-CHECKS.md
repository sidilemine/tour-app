# Remaining phone checks

The app now includes **Offline test guide / saved results**. Choose a case, begin an attempt, return to the player to test, then record observations and export results alongside diagnostics. All instructions are available offline; engineer-prepared cases are labelled. [Full bundled guide](TEST-GUIDE.md).

Updated 13 September 2026. M1: **implemented; awaiting physical test**. This is the working checklist; [ROADMAP](../ROADMAP.md#physical-phone-procedure-for-m1) retains the full criteria and [M1 results](test-results/M1.md) holds evidence. Tick a box only after its observations/logs are recorded, not because the code exists.

Your current self-contained app can reopen away from the Mac. Your three-stop route stays saved when you select **New walk / reset progress**. The engineer prepares development builds and collects/replays the private JSON; you supply the real walking, audible observations and phone prompts.

## Next convenient walk: pause at arrival

- [ ] Start a new diagnostic walk. Let A finish, then **Pause** during silence. Walk to B, wait at least 60 seconds: no audio. **Resume** should release the hold and permit B when still appropriate.
- [ ] In another attempt, pause part-way through a clip; reach the next stop while paused. Wait 60 seconds, still silent; Resume continues unfinished narration before any eligible next clip.
- [ ] Repeat the pause with the actual lock-screen or headset control. ADB media-key checks have passed; actual controls during a walk are outstanding.

Stop safely before touching the screen. **End** stops tracking. Export diagnostics after each attempt; New walk retains old logs. Do not delete logs or reinstall between a checkpoint and a recovery check.

## Controlled baseline walks

The first functional walk worked: B/C triggered once and all clips completed. The log measured 3:09.6 and 2:50.7 silent gaps; it also contains brief foreground activity. It is useful evidence, but not one of the strict baseline passes.

- [ ] Engineer prepares the development build, caches clips and disables Fast Refresh. Verify fresh fixes before leaving; unplug USB, stop Metro, disable Wi-Fi/mobile data, keep Location on. Use ordinary battery settings and no debugger.
- [ ] Development baseline 1: lock through A → silence → B → silence → C.
- [ ] Development baseline 2: same conditions, new walk.
- [ ] Development baseline 3: same conditions, new walk. Three consecutive successes required.
- [ ] Self-contained repeat: cold-open with no Metro/network and repeat the locked silent-gap scenario.

Aim for **four minutes of actual silence after each clip ends** before entering the next stop area (minimum three). If necessary wait safely before approaching the stop; time spent after an early trigger cannot lengthen the tested gap. Do not unlock between clips. Each next clip must begin once within 30 seconds of physically arriving. Note estimated arrival time for comparison with logs. The engineer restores the self-contained variant after development tests.

## Short connected-phone session with the engineer

- [ ] Real call or competing audio: interruption pauses; returning audio focus never resumes by itself.
- [ ] Headphones/Bluetooth disconnect: narration stops, does not jump to speaker, waits for Resume.
- [ ] Deny/revoke location and switch it off/on: no uncertain automatic speech; manual playback still works; existing manual hold remains.
- [ ] Terminate during an active walk/clip, reopen offline: saved route, completed/skipped stops, offset (≤5 seconds lost) and hold recover; no spontaneous speech.
- [ ] Swipe-away separately: document actual service/progress behavior, then reopen deliberately.
- [ ] Development-build recovery: same checks, recording any Metro dependency. Unscheduled process kill is separate from orderly End.

Stationary self-contained cold launch, media pause/resume and force-stop recovery at a saved pause have already passed. The cases above extend that evidence; force-close is allowed to stop the tour until reopened.

## Engineer-prepared field edge cases

- [ ] Short-approach fixture: reach B before A finishes. No overlapping or cut-off story; B only plays when A finishes and arrival remains appropriate.
- [ ] Pass the pending stop before A ends: no stale backlog of “stand here” narration.
- [ ] Leave/rejoin the known route, poor/lost GPS: useful reasons and manual fallback, no duplicate/wrong arrival.
- [ ] Record start/end battery, battery saver and app battery policy for baseline walks. Try power-saving conditions separately; report limits rather than silently changing settings for a pass.

## Result card (copy per attempt)

Case / date / variant + source ID / network / battery start→end / saver + app battery policy / speaker or headphones / route version / expected / actual / silence lengths / arrival delay / duplicates or crashes / private export filename / engineer replay result.

Precise traces stay private. Send only the diagnostic JSON to this project, not an unrelated cloud service. The route fixture JSON records the path; **walking-diagnostics.json** records what the player did.
