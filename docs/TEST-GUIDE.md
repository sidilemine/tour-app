# Offline phone test guide

Generated from `src/testing/guide.json`; edit that source and run `npm run docs:guide`. Revision 12.

The planned M1 outdoor walks are complete. These procedures remain available for reference and targeted regression checks; do not repeat a walk unless the engineer identifies a specific need. Opening this guide never starts, pauses or ends a tour. Stop safely before using the screen. Saved results are observations: acceptance combines diagnostic review and physical feedback in the project checklist. Long A lasts 3 minutes 30 seconds and is only a test asset; desk interruption and recovery checks need just a few seconds of playback. M2 adds an engineer-prepared offline-map desk check; this does not reopen the full M1 field matrix. The tour home contains the Finchley A/B walks and the new Clerkenwell walk, with transcripts, directions and story reviews. Case 20 records one short engineer-led check of the new import/recording boundary; it does not require another baseline walk. Guide 12 includes Clerkenwell’s eight stops and two walking chapters in the combined preparation check. A new area needs a short drawing/selection check, not a repeat of the historical map matrix.

## Before and after each attempt

1. Begin an attempt here to save its build, route identity and notes. Return to the player to control the tour. Notes save as you type and survive reopening.
2. For a fresh walk: End, then New walk / reset progress. This keeps your route and old diagnostics. Reopening alone restores progress; it does not reset the walk.
3. Enable Record private diagnostics before Start. At a safe stop verify fresh fixes and Receiving background-capable fixes. A registered service alone is not proof of readiness.
4. Record network, output/headphones, precise/background permission, battery start/end, saver and app battery policy. The app captures build, phone, route identity and attempt times; these conditions still need your observations.
5. For locked baselines, read the procedure first and close the guide before locking. Do not unlock to tick steps during a silent interval. Aim for four minutes after each clip ends before approaching the next stop.
6. After the attempt: End, save observed pass/fail/inconclusive with notes, then export both Test results and Private diagnostics. Each export opens Save or share JSON with a unique date-and-time filename you can edit. Choose Save to folder, then a local Walking Tour Tests subfolder under Documents or Downloads, Use this folder and Allow. Save success is confirmed after verification. Share instead is optional; Android may block selecting Downloads itself, so choose a subfolder.
7. Never uninstall or clear storage. Do not replace builds within a recovery check. Engineer-prepared cases need the stated preparation. The edge fixture uses your existing checked geometry with long A narration; it asserts no new verified location.
8. Prepared fixtures are in Documents / Walking Tour Remaining. End and export before changing: Configure / load fixture → Choose JSON file → 01-standard-walk.json or 02-edge-tests-long-A.json → Validate and load JSON → Load, then New walk. Begin the guide attempt afterwards. EDGE TEST is only for early-arrival and pass-pending; restore STANDARD CLIPS for all other walks. After updating the long-A recording, always use New walk before a fresh attempt; do not resume an offset saved against the older 6:21 recording.

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

1. Start a fresh diagnostic walk at A using STANDARD CLIPS. Let A finish. Before B, take a familiar safe public side path about 60 m sideways from the recorded route.
2. Stop and read Why it spoke — or stayed quiet. Look for off-route; if it does not appear, record the actual reason rather than wandering to force it.
3. Tap Play A to check manual fallback. Let that replay finish, then tap Pause. Return to the recorded path and continue to B while paused.
4. At B, wait about 10–15 seconds for fresh fixes. B must remain silent until you deliberately Resume, then play once. End and export. No trip to C, three-minute silent gap or 60-second wait is required.
5. If naturally poor GPS occurs, record it separately; otherwise that subcase is untested. The app does not calculate a detour or directions back.

Expected: Diagnostics explain uncertain/off-route fixes; manual fallback works. No wrong or duplicate arrivals, no automatic removal of the hold.

## Arrive before narration ends

Case: `early-arrival`. Preparation: engineer. Build: either.

Engineer supplies 02-edge-tests-long-A.json using your original A/B/C and path, with 3 minutes 30 seconds of local A speech. Load it BEFORE beginning the guide attempt. Check the player says EDGE TEST. No new standing position is invented.

1. End the current tour and export its diagnostics. Configure / load fixture → Choose JSON file → 02-edge-tests-long-A.json → Validate and load JSON → Load. Close configuration. New walk / reset progress. Begin this guide attempt.
2. At your usual A, Start a diagnostic walk. A must announce the three minute thirty second narration. Walk normally to your usual B while A continues speaking; do not pause or use manual Play.
3. At B, stop safely and check the recent diagnostic events for arrival-pending-unfinished-clip. Stay at B until A finishes. B should then play once, without cutting off or overlapping A. If A finished before you reached B, record inconclusive.
4. Let B finish, then End. Save the result and export diagnostics BEFORE changing fixtures. No C or three-minute silence is required. Use New walk with the same edge fixture for the pass-pending case; restore 01-standard-walk.json for other walks.

Expected: A finishes without overlap or being cut off. B waits and plays only if still eligible. An arrival after A finished is inconclusive for this case.

## Pass a pending stop

Case: `pass-pending`. Preparation: engineer. Build: either.

Use the prepared 02-edge-tests-long-A.json with the same known path and standing points. It has long A narration, not short baseline clips. Load it before beginning this guide attempt.

1. End and New walk / reset progress. Begin this guide attempt, then Start at your usual A. Walk normally towards B while the long A recording is speaking. Do not pause or manually play a clip.
2. At B, stop safely for about 10 seconds and inspect recent events. Confirm arrival-pending-unfinished-clip while A is still speaking. Without a confirmed pending arrival, this attempt cannot establish the case.
3. Continue along your familiar B-to-C path to a safe point at least about 70 m beyond B while A is still playing. Stop and check To eligible stop is over 50 m with fresh fixes. Do not return towards B. If A ends before you have left its arrival area, record inconclusive.
4. Wait there for A to finish. B must stay unplayed and silent: it must not deliver a stale queued story. C is not required. You may manually play B afterwards to check fallback, but record that deliberate action separately.
5. End, save the result and export diagnostics before changing routes. Restore 01-standard-walk.json via Configure / load fixture, then New walk. Verify STANDARD CLIPS before baseline, detour or battery-saver walks.

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

A separately labelled run; do not change baseline conditions to manufacture a pass. Use 01-standard-walk.json / STANDARD CLIPS, never the long-A edge fixture.

1. Use STANDARD CLIPS. Record battery percentage and the app’s battery policy, then enable Android Battery Saver for this separate test. Keep network off and Location on. Use the full locked A/B/C procedure with at least three minutes of actual silence before each arrival; aim for four. Do not change app-specific battery restrictions to manufacture a pass.
2. Record end battery and whether fixes/arrivals were delayed. Compare with ordinary-settings baselines.
3. If the phone restricts operation, save an inconclusive/failed observation with conditions and export. Restore your preferred settings afterwards.

Expected: Battery use and operating limits are recorded honestly. This run is separate from the three ordinary-settings development baselines.

## 19. M2 offline map / session regression

Case: `offline-map`. Preparation: engineer. Build: either.

Engineer-prepared map APK; for development, verified cached map and all four audio assets. Use the existing checked M1 fixture only for the later targeted outdoor case.

1. At the desk, begin this attempt. Record the build, network condition and map revision. With Metro stopped and phone networking off, cold reopen the self-contained app. Open Offline area map (North Finchley offline map in older builds) and record its first complete frame time.
2. Pan to all four saved-area edges and corners, zoom from overview to street detail, and check street labels. Grey outside coverage is expected. Open Map credits; return to the map and then the player. Report blank tiles, missing characters, errors or a stalled screen.
3. Engineer: preserve data and inject a missing font and a same-size damaged map copy in separate runs. Reopen the map: it must show Map unavailable. The player must remain usable. Rebuild local map copy, recheck drawing offline and record actual recovery. Never delete tour or test databases.
4. With the engineer at the desk, use only seconds of existing test audio. Open/close the map during playback and manual pause; check real remote controls, focus and reopen recovery as directed. Map navigation must not start location, clear a hold or restart narration. Engineer checks app-scoped crashes and memory.
5. Only after desk checks pass: on an already checked M1 segment, prepare a separate diagnostic attempt for one locked silence-to-arrival case. Allow at least three minutes of genuine silence before arrival. Check fresh locked location, one eligible clip and manual pause/release at the stationary stop. Stop for failed arrival, unexpected speech, unsafe access or missing evidence.
6. Save observations and export through the existing named local-save flow. Engineer restores the self-contained build without clearing data and verifies cold reopening with Metro stopped. No North Finchley route survey or full six-stop acceptance is claimed by this test.

Expected: Entire declared map area draws with labels and network off; damaged local resources fail visibly and recover. Map screen does not own location or playback. Native audio/location and the targeted locked arrival remain correct. Desk, outdoor and automation evidence are recorded separately.

## 20. Curated tours: offline preparation and feedback

Case: `curated-tour-feedback`. Preparation: engineer. Build: offline-release.

Final self-contained three-tour build; phone connected for one clustered session. Ask whether Sidi is listening before any audible playback. Preserve prior phone data and reviews.

1. Engineer: prepare Clerkenwell offline and confirm eight stops and two walking chapters. Retain the existing Finchley A/B packages and progress. With Metro stopped and networking off, cold reopen, inspect the Clerkenwell numbered route/map and representative labels, switch to a retained Finchley map and check progress, then return to Clerkenwell. Read the first-stop approach/directions. Import/corruption/version handling has automated evidence; do not repeat destructive file tests without a concrete need.
2. After Sidi confirms listening, play a few seconds of a tour story, open Review and confirm narration pauses. Record a brief spoken note deliberately, stop/save and play the saved note back. Save and close review: an active tour resumes, continuing unfinished narration or awaiting the next eligible location. Saving the voice note while Review remains open stays silent. Closing a review on an ended tour must not restart it. Engineer inspects permission, actual file finalization and app-scoped errors.
3. Reuse the accepted local voice-copy/readback/cancellation evidence while that boundary is unchanged. Confirm the new diagnostic note remains after reopening; repeat copying only to recover it for the specific diagnosis. End tracking after any short native location check.
4. Engineer retains the self-contained app with Clerkenwell selected and unstarted, and prior Finchley progress intact. Normal tour use supplies route/enjoyment feedback; no stationary-minute or three-minute repeat is required. Save actual observations and specific unresolved issues.

Expected: All three tours retain their offline packages; the selected map and saved progress survive reopening. New diagnostic recordings are audible and durable; Review/record/voice-save stays paused; explicit review close resumes an active tour. Reuse unchanged export evidence. Actual phone observations are distinct from automation and enjoyment.

## 21. Headset microphone and competing music

Case: `headset-recording-focus`. Preparation: engineer. Build: offline-release.

Installed microphone adapter and the touring headphones. The reported EarFun/Spotify problem remains unresolved. One short diagnostic desk session; confirm listening readiness before sound. Preserve prior recordings and progress.

1. Engineer verifies installed recording adapter revision 1, microphone/Nearby devices permissions and actual available inputs. No tour restart or outdoor walk is needed.
2. After Sidi confirms listening, start Spotify, then tap Record in a story review. Wait for a verified Headset microphone label. Speak one short sentence with the phone away from the mouth, then stop/save. Confirm music paused during capture and the saved sentence is clear.
3. Compare one short Phone microphone note only if the headset problem reproduces or a usable feedback path still needs confirmation. Check the actual input label. Reuse automated interruption coverage; a deliberate disconnect is not required for this batch. If a real disconnect occurs, preserve the note and report whether capture stopped with an interruption message.
4. Confirm saved-note or a few seconds of deliberate narration playback returns through the headphones after recording. Stop note playback, save/close review and confirm the active tour resumes. Ended tours stay stopped. Engineer inspects app-scoped errors and restores the self-contained variant with existing progress.

Expected: Recording requests exclusive focus; the displayed microphone is an actual verified route, not merely a preference. Saved notes are intelligible, interrupted capture retains its file, and recording cleanup restores ordinary playback routing. Only explicit review close/resume releases the tour hold; passive background/locking does not. No baseline walk or export repeat required.
