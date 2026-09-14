# Offline phone test guide

Generated from `src/testing/guide.json`; edit that source and run `npm run docs:guide`. Revision 3.

Read this before starting. Opening the guide never starts, pauses or ends a tour. Stop safely before using the screen. Your results are observations awaiting review; this guide does not certify M1.

## Before and after each attempt

1. Begin an attempt here to save its build, route identity and notes. Return to the player to control the tour. Notes save as you type and survive reopening.
2. For a fresh walk: End, then New walk / reset progress. This keeps your route and old diagnostics. Reopening alone restores progress; it does not reset the walk.
3. Enable Record private diagnostics before Start. At a safe stop verify fresh fixes and Receiving background-capable fixes. A registered service alone is not proof of readiness.
4. Record network, output/headphones, precise/background permission, battery start/end, saver and app battery policy. The app captures build, phone, route identity and attempt times; these conditions still need your observations.
5. For locked baselines, read the procedure first and close the guide before locking. Do not unlock to tick steps during a silent interval. Aim for four minutes after each clip ends before approaching the next stop.
6. After the attempt: End, save observed pass/fail/inconclusive with notes, then export both Test results and Private diagnostics. Each export opens Save or share JSON with a unique date-and-time filename you can edit. Choose Save to folder, then a local Walking Tour Tests subfolder under Documents or Downloads, Use this folder and Allow. Save success is confirmed after verification. Share instead is optional; Android may block selecting Downloads itself, so choose a subfolder.
7. Never uninstall, clear storage or reinstall within a recovery check. Engineer-prepared cases remain available to read but require the stated preparation. No short-approach route is invented or pre-verified.

## 1. Pause during silence

Case: `pause-silence`. Preparation: independent. Build: either.

Your saved, checked three-stop route.

1. At A, End any previous tour, then New walk / reset progress. Begin an attempt here, then return to the player and enable private diagnostics.
2. Start tracking + first clip. Let A finish. Tap Pause during the silent gap.
3. Walk to B and wait at least 60 seconds. Do not press Manual Play: that deliberately plays a clip even while automatic speech is held.
4. Stay still at B and tap Resume once. Time how long B takes to start; record any waiting-for-location message. Let B finish, then End, save the result and export both results and diagnostics.

Expected: No automatic audio during the 60-second wait. With fresh usable location, Resume promptly permits B while you remain at the stop. No duplicate clip; record any delay.

## 2. Pause an unfinished clip

Case: `pause-narration`. Preparation: independent. Build: either.

Your saved route. Pause A within its roughly 11-second duration.

1. Begin a fresh diagnostic walk at A. Tap Pause before A finishes; note its saved position.
2. Walk to B while paused and wait at least 60 seconds. The unfinished A and the arrival at B must remain separate.
3. Stay still at B and tap Resume once. Listen for A to continue from its saved position, then B. Time any silence after A finishes separately from the remaining A narration; note any waiting-for-location message.
4. Let B finish, then End and save/export the outcome. Include wait timings, overlap, lost position or unexpected speech.

Expected: Silence until explicit Resume; unfinished A resumes before eligible B. No overlap or automatic clearing of pause.

## 3. Actual lock-screen / headset pause

Case: `remote-pause`. Preparation: independent. Build: either.

Lock-screen media controls or the headphones you normally use; a checked route.

1. Start a new diagnostic walk. Use the actual lock-screen or headset control to pause A before it ends.
2. With the hold active, arrive at B and wait 60 seconds. Record which control and output device you used.
3. Use explicit Play / Resume and listen for orderly continuation. End and export after the attempt.

Expected: Actual remote pause stays respected across arrival. Remote Play deliberately releases the hold; no duplicate or overlapping story.

## Development baseline 1 of 3

Case: `development-1`. Preparation: engineer. Build: development.

Prepared development build and verified two-leg route. Three consecutive successful walks are required; a failure restarts the consecutive series.

1. Engineer prepares the development APK, loads JavaScript, caches A/B/C, disables Fast Refresh and records ordinary battery settings. Begin a new attempt with private diagnostics.
2. At A, Start and verify fresh fixes plus service readiness. Unplug USB, stop Metro, switch off Wi-Fi/mobile data while leaving Location on, then lock. Do not reload this development client.
3. Hear A finish. Keep the screen locked through at least three minutes of genuine silence; aim for four minutes before entering B. Wait safely before approaching if needed.
4. B must play automatically once within 30 seconds of physical arrival. Keep locked and repeat B → C with another at least three minutes of silence.
5. Only after C finishes, unlock, End, record actual gaps/arrival estimates and export. Do not delete logs. A short gap, missed/late arrival, duplicate, crash or required unlock is not a pass.

Expected: A/B/C once and in order; both silent gaps ≥3 minutes, full locked intervals, audible B/C ≤30 seconds after arrival, no crash. Repeat attempts are retained, not overwritten.

## Development baseline 2 of 3

Case: `development-2`. Preparation: engineer. Build: development.

Prepared development build and verified two-leg route. Three consecutive successful walks are required; a failure restarts the consecutive series.

1. Engineer prepares the development APK, loads JavaScript, caches A/B/C, disables Fast Refresh and records ordinary battery settings. Begin a new attempt with private diagnostics.
2. At A, Start and verify fresh fixes plus service readiness. Unplug USB, stop Metro, switch off Wi-Fi/mobile data while leaving Location on, then lock. Do not reload this development client.
3. Hear A finish. Keep the screen locked through at least three minutes of genuine silence; aim for four minutes before entering B. Wait safely before approaching if needed.
4. B must play automatically once within 30 seconds of physical arrival. Keep locked and repeat B → C with another at least three minutes of silence.
5. Only after C finishes, unlock, End, record actual gaps/arrival estimates and export. Do not delete logs. A short gap, missed/late arrival, duplicate, crash or required unlock is not a pass.

Expected: A/B/C once and in order; both silent gaps ≥3 minutes, full locked intervals, audible B/C ≤30 seconds after arrival, no crash. Repeat attempts are retained, not overwritten.

## Development baseline 3 of 3

Case: `development-3`. Preparation: engineer. Build: development.

Prepared development build and verified two-leg route. Three consecutive successful walks are required; a failure restarts the consecutive series.

1. Engineer prepares the development APK, loads JavaScript, caches A/B/C, disables Fast Refresh and records ordinary battery settings. Begin a new attempt with private diagnostics.
2. At A, Start and verify fresh fixes plus service readiness. Unplug USB, stop Metro, switch off Wi-Fi/mobile data while leaving Location on, then lock. Do not reload this development client.
3. Hear A finish. Keep the screen locked through at least three minutes of genuine silence; aim for four minutes before entering B. Wait safely before approaching if needed.
4. B must play automatically once within 30 seconds of physical arrival. Keep locked and repeat B → C with another at least three minutes of silence.
5. Only after C finishes, unlock, End, record actual gaps/arrival estimates and export. Do not delete logs. A short gap, missed/late arrival, duplicate, crash or required unlock is not a pass.

Expected: A/B/C once and in order; both silent gaps ≥3 minutes, full locked intervals, audible B/C ≤30 seconds after arrival, no crash. Repeat attempts are retained, not overwritten.

## Offline cold-start and locked walk

Case: `offline-baseline`. Preparation: independent. Build: offline-release.

Self-contained build and saved route. Keep Location on; use ordinary battery settings.

1. End any existing tour. Disable Wi-Fi/mobile data. Close and reopen from the app icon; no Metro or USB support. The app and guide must open.
2. At A, New walk / reset progress, begin the attempt, enable diagnostics and Start. Verify fresh fixes before locking.
3. After A ends, keep locked for at least three minutes of real silence before B; aim for four. B must start once within 30 seconds of arrival.
4. Repeat B → C, still locked. After C, End, save the observed result and export. Record battery start/end and network/output settings.

Expected: Cold launch and complete locked walk work offline with local clips. Both ≥3-minute gaps and ≤30-second arrivals meet the same criteria. This does not replace development-build baselines.

## Call or competing audio

Case: `interruption`. Preparation: independent. Build: either.

Another audio app or someone able to call you. Test separately from baseline walks.

1. Begin an attempt and a fresh diagnostic walk. While A plays, receive a real call or start competing audio; note which interruption you used.
2. End the call/other audio. Wait: our narration must not restart by itself. If you also manually paused, that hold must remain.
3. Return to the player and explicitly Resume. End and record the outcome, output device and any lost offset.

Expected: Interruption pauses narration and saves position. Focus return alone never resumes it; explicit Resume does.

## Headphones / Bluetooth disconnect

Case: `output-disconnect`. Preparation: independent. Build: either.

Your headphones or Bluetooth output. Test each output type you use.

1. Start a diagnostic walk with narration audible through the chosen output.
2. While a clip plays, unplug or disconnect that output. Listen for unexpected speech on the phone speaker.
3. Wait, then choose an output and explicitly Resume. End and record the actual behavior.

Expected: Narration pauses on disconnection and waits for explicit Resume. It must not continue unexpectedly on the speaker.

## Denied or lost location

Case: `location-permission`. Preparation: independent. Build: either.

Android Settings access. Revocation may terminate the app; deliberate recovery is allowed.

1. End before changing permissions. In Android Settings → Apps → Walking Tour Lab → Permissions, deny Location; reopen the app.
2. Manual Play must still work. Start should explain the permission requirement without claiming readiness.
3. Restore precise Location and Allow all the time, then start a diagnostic walk. Pause, turn Location off, and turn it back on.
4. Wait for fresh fixes. The manual hold must remain. Resume deliberately, End and record each subcase.

Expected: No uncertain automatic speech; manual playback remains available. Signal/permission return never clears manual pause. Record termination separately from a crash.

## Leave / rejoin the route and poor GPS

Case: `off-route`. Preparation: independent. Build: either.

Only a known safe public detour. Do not enter unsafe areas to degrade GPS.

1. Begin a separate diagnostic walk. Leave the recorded path by a safe known detour and inspect the location reason while stopped.
2. Try manual playback if automatic arrival is suppressed. Pause before returning to the path.
3. Rejoin and wait for fresh usable fixes: hold must remain. Resume deliberately and observe the next eligible stop.
4. If naturally poor or lost GPS occurs, record it; otherwise mark that subcase inconclusive. End and export.

Expected: Diagnostics explain uncertain/off-route fixes; manual fallback works. No wrong or duplicate arrivals, no automatic removal of the hold.

## Arrive before narration ends

Case: `early-arrival`. Preparation: engineer. Build: either.

A separately checked short-approach fixture is required; it is NOT bundled. Engineer prepares realistic trigger spacing using local clips. Do not replace your main route without exporting it.

1. Engineer loads the checked short-approach fixture and confirms B can receive usable dwell fixes while A is still audible.
2. Start a fresh diagnostic walk at A and reach B before A finishes. Stay at B.
3. Listen until A finishes, then observe B. End and export before switching back to the main route.

Expected: A finishes without overlap or being cut off. B waits and plays only if still eligible. An arrival after A finished is inconclusive for this case.

## Pass a pending stop

Case: `pass-pending`. Preparation: engineer. Build: either.

The same separately prepared short-approach fixture; sufficient safe space to leave B before A ends.

1. Reach B while A is still playing, then pass beyond B before A finishes. Remain on a checked path.
2. When A ends, listen for a stale queued B. Inspect the diagnostic reason while stopped.
3. Use manual playback if desired, then End and export before restoring your main route.

Expected: No stale backlog or outdated standing instructions. B remains unplayed and manually available if its arrival is no longer appropriate.

## Terminate and recover offline

Case: `offline-recovery`. Preparation: independent. Build: offline-release.

Self-contained app. Never reinstall, uninstall or clear storage between saving a checkpoint and checking it.

1. With network off, begin an attempt, start a diagnostic walk and complete A. During B, note playback position; test once while playing and once with a manual Pause.
2. Use Android Settings → Apps → Walking Tour Lab → Force stop. Reopen from the app icon. This is expected to stop operation until reopening.
3. Check route, completed/skipped stops and saved offset (target no more than five seconds lost). No spontaneous audio; a saved manual hold remains.
4. Check that this guide attempt and notes survived. Start restores tracking; Resume is deliberate. End, record the two subcases and export.

Expected: Offline progress and guide notes recover after termination. Completed stops do not automatically replay. Continuous operation after force-close is not required.

## Swipe away and reopen

Case: `swipe-away`. Preparation: independent. Build: offline-release.

Self-contained build; separate from Force stop.

1. Begin an attempt and diagnostic walk. Note completed stops, clip position and hold, then swipe the app away from Recents.
2. Observe whether audio/location stop or continue on this phone; do not assume it behaves like Force stop.
3. Reopen deliberately. Verify saved progress/hold and no unsolicited speech. End and record observed service behavior.

Expected: Progress recovers deliberately with pause respected. Record actual device service lifetime rather than promising uninterrupted operation.

## Development-build recovery

Case: `development-recovery`. Preparation: engineer. Build: development.

Engineer prepares the development build and records whether cold reopening needs Metro.

1. During an active diagnostic walk, record progress/offset/hold, terminate the app and deliberately reopen.
2. Reconnect to Metro if this development build requires it; record that dependency rather than calling it offline cold start.
3. Check saved progress, no automatic speech, and explicit Start/Resume. End and export; engineer restores the self-contained build afterwards.

Expected: Durable progress and holds recover. A Metro dependency is recorded; self-contained offline recovery remains a separate test.

## Unscheduled process kill

Case: `process-kill`. Preparation: engineer. Build: either.

Engineer-controlled process termination during an active session; do not substitute End, swipe-away or uninstall.

1. Begin a diagnostic attempt with known progress and narration position. Engineer terminates the process without orderly End.
2. Reopen deliberately. Check recovered offset, completed/skipped stops and hold; do not expect continuous audio after termination.
3. Engineer inspects exit records and checkpoints, then exports and restores the independent-use build.

Expected: Last durable progress recovers, ≤5 seconds of narration position lost, no unsolicited replay. Uncommitted progress loss must be explained by evidence.

## Battery and power-saving conditions

Case: `battery-saver`. Preparation: independent. Build: either.

A separately labelled run; do not change baseline conditions to manufacture a pass.

1. Record battery percentage, battery saver and the app’s battery policy. Use the locked silent-gap procedure on the checked route.
2. Record end battery and whether fixes/arrivals were delayed. Compare with ordinary-settings baselines.
3. If the phone restricts operation, save an inconclusive/failed observation with conditions and export. Restore your preferred settings afterwards.

Expected: Battery use and operating limits are recorded honestly. This run is separate from the three ordinary-settings development baselines.
