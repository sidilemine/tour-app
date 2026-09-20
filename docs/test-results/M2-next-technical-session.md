# Next M2 technical session: headset capture and review resumption

Prepared 20 September 2026. **Procedure only; no device was contacted, installed, played or recorded during this preparation.** The owner authorised preparation alongside the editorial workshop. No reconnect request is pending. Allow **about 5–7 minutes of owner attention** when the Pixel and EarFun headset are next available, with engineer setup completed first. Stop earlier when the diagnostic question is answered; a fix in the same session is not promised.

## Questions and existing evidence

1. While the app records through the EarFun microphone, does its exclusive focus survive the communication-route change, what input is actually reported, and is the saved sentence intelligible after ordinary headphone routing returns?
2. Does explicit **Save review and resume tour** audibly continue an active story from its saved position on the installed guide-10 build?

The [18 September clarification](M2-recording-input.md#owner-clarification-and-next-diagnosis-18-september) is sufficient evidence of a failed headset use case: Spotify continued and the recording sounded poor through headphones. Selecting **Phone microphone** stopped Spotify. It does not prove the phone sample's quality, the actual Bluetooth route, or one shared cause for continued music and poor sound. The [second outing](../content/SECOND-TOUR-FEEDBACK-RECOVERY.md) used source `ab54dddf76bf5cd0`, guide 9. Guide 10/source `de251b0367a4c3b6` was installed and cold-opened afterward; [audible review-close resumption](M2-review-resume.md) remains unobserved.

Reuse M1's accepted narration focus/remote/hold/recovery results, M2 map results, and the [representative saved-note/copy/reopen check](M2-tour-phone.md). They do not establish this newer recorder path. No full walk, second export matrix, focus-probe installation, SDK upgrade, force-stop series or battery trial is needed here.

## What source inspection establishes

The installed dependency is `expo-audio` **57.0.5**, guarded by [the patch](../../tools/patch-expo-audio.cjs). In [TourRecordingSession](../../tools/native/TourRecordingSession.kt), both Phone and Headset request `AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE` with media/speech attributes and require a granted result **before** starting MediaRecorder. Only the Bluetooth branch then sets `MODE_IN_COMMUNICATION`, selects a communication **output**, and requests a preferred input. The patch calls `session.begin()` then `record()`; [the UI](../../src/feedback/StoryReview.tsx) waits for [actual-input verification](../../src/feedback/recordingInput.ts) for up to four seconds. Stop/reset releases the route and focus session.

The Bluetooth match accepts an actual SCO/BLE-headset type, rather than requiring the originally selected device ID. Thus record the displayed actual product name and have only the intended headset in use. This preparation does not change that matching policy. The UI's verified label is evidence about an active recorder, not proof of good sound, exact codec, focus retention, or the input used on a previous outing. No persistent per-note route/focus telemetry exists. The requested recording format is mono; its encoding sample rate cannot prove the Bluetooth link's negotiated bandwidth.

### Official native references checked on 20 September

- Android explicitly lists voice memos as a use of [transient-exclusive focus](https://developer.android.com/reference/android/media/AudioManager#AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE). [Focus guidance](https://developer.android.com/media/optimize/audio-focus) requires a top app or foreground service for apps targeting API 35+, and documents narrower conditions for enforced fade-out. A granted exclusive request is not, by itself, an audible Spotify-stop observation. Keep Review foreground; do not introduce background capture to reproduce this issue.
- [Communication-device selection](https://developer.android.com/reference/android/media/AudioManager#setCommunicationDevice(android.media.AudioDeviceInfo)) uses an available output device and chooses the corresponding input; its selection should be cleared after use. The [Bluetooth communication guide](https://developer.android.com/develop/connectivity/bluetooth/ble-audio/audio-manager) distinguishes a successful request from the route becoming current and describes asynchronous confirmation. Its example wait is not a reason to replace this app's four-second timeout without observing a timing failure.
- [MediaRecorder routing](https://developer.android.com/reference/android/media/MediaRecorder#getRoutedDevice()) is meaningful during active recording. `getPreferredDevice()` need not equal the actual input. Therefore take the route observation **during** capture; an after-stop null/stale route cannot establish an input failure.

These APIs are available on the recorded Pixel/API 37. Documentation supports the inspection points; it does not establish EarFun behavior or identify the failure's cause.

## Prepared engineer actions

Use [capture-recording-state.sh](../../tools/testing/capture-recording-state.sh) only by explicit invocation. It requires the exact serial, verifies authorised device state, **Pixel 6** model, installed app/UID and running tour process, and never selects another device. It issues read-only queries; it does not launch apps, grant permissions, tap controls, record, play, pause, install or clear data. Its own stdout contains counts and a private folder path, not device identifiers or raw app data.

The script saves unique, restrictive-permission directories under ignored `diagnostics/`. It retains only audio lines matching Walking Tour Lab/Spotify packages, their UIDs or the tour PID, plus selected scalar mode fields and the tour's package version metadata. It discards the rest of the audio-service dump in memory; no whole-system dump, Bluetooth inventory, playlist, general logcat or screenshot is saved. Raw excerpts can still contain identifiers and are private. Review and paraphrase findings before adding a result record to Git.

```sh
# Preparation check: no adb query or device contact.
sh tools/testing/capture-recording-state.sh --serial prepared-device --label headset-before --dry-run

# During the future prepared session, set TOUR_SERIAL privately from the selected
# device. Never paste it, screenshots or raw dumps into the public result record.
sh tools/testing/capture-recording-state.sh --serial "$TOUR_SERIAL" --label headset-before
sh tools/testing/capture-recording-state.sh --serial "$TOUR_SERIAL" --label headset-transition --samples 8 --interval 0.5
sh tools/testing/capture-recording-state.sh --serial "$TOUR_SERIAL" --label headset-after
```

Snapshots carry host query start/end times; they are not atomic native events. The interval is additional to query time. Start the transition capture immediately before Record, keep the app foreground, and correlate actual tap/label/stop times in private notes. Do not prolong capture to wait for all snapshots. Repeated audio dumps may contain the same historical focus events: compare event timestamps and current state, not repeated line counts. A missing match, unsupported format, denial, timeout or USB loss is **inconclusive inspection**, not proof of missing focus. The script has not been exercised against a connected phone in this assignment.

Before asking Sidi to listen, the engineer should:

1. Check the currently installed source/guide in the app against the recorded guide-10 handoff; the Android versionCode alone cannot distinguish these builds. Keep the self-contained APK and Metro stopped. Do not install a different build just to collect this first snapshot.
2. Note the existing selected tour, all completion flags, automatic setting and stopped/held state. Preserve existing backup/feedback archives. Do not reset progress, switch content versions or clear data. If current state differs materially from the last handoff, adapt the setup before sound rather than overwriting it.
3. Verify fresh Pause, Review, Stop-and-save and End control positions while silent. Failed hierarchy dumps must not be reused. Prepare screenshot/native-state inspection and a **12-second media-Pause watchdog for each playback burst**, with immediate Pause/End on failure. A media-Pause fallback may address Spotify instead of the tour; verify the tour is actually paused afterward. It does not stop a recorder: Stop-and-save remains the required capture cleanup.
4. Obtain a new explicit **ready and listening** response before starting Spotify, tour narration or a saved note. Check comfortable volume and intended headset connection; no audible readiness assumption carries over from an earlier session.

## Smallest clustered sequence

The last handoff has A selected, all five stops complete and tracking stopped. Use a short manual replay of a **completed** story; this preserves its completed flag and avoids resetting the walk. A new diagnostic review and short note will be retained separately from the outing's reviews. The current replay offset will intentionally change; record that fact.

| Step | Engineer action and bounded owner observation |
| --- | --- |
| 1. Prepare an active review | After readiness, press Pause and verify it, then **Start location tracking**. A verified manual hold survives Start. Replay the completed first story for about 3–5 seconds, then open Review. Note its held offset and confirm narration stopped. This reproduces recording during an active tour; a stopped-tour close would not test resumption. If Start or Review fails, Pause/End and stop this branch. |
| 2. Establish competing music | With no capture active, have Spotify playing through EarFun, then return to Review. Backgrounding Review here must not be confused with backgrounding a recording. Take `headset-before`; record that music is audible and the headset-selection option is on. |
| 3. One headset capture | Start `headset-transition`, then Record. Sidi speaks one neutral sentence for **6–8 seconds**, phone away from the mouth, and reports whether Spotify stopped. Record the actual microphone label/name, time to confirmation and any error. Engineer presses Stop and save by **10 seconds** even if collection is incomplete; keep Review foreground. Take `headset-after` immediately after saving. If the four-second verification fails, retain the error and any saved note; do not make repeated blind attempts. |
| 4. Separate capture from playback quality | Pause Spotify deliberately after documenting its behavior. While still in Review, play the new saved sample briefly through the same headphones, then stop it. Ask only whether the words are clear and ordinary headphone sound has returned. The watchdog bounds playback. A poor sample can reflect captured sound, retained communication routing or the playback path; the adjective alone does not identify which. |
| 5. Conditional phone comparison | Do this **only** if step 3 reproduced the failure and a same-session route/focus comparison will discriminate it, or if practical phone-note intelligibility remains needed. Keep the headset output, select Phone microphone, restart the same music condition, repeat the sentence with the phone near the mouth, and capture `phone-before`, `phone-transition`, `phone-after`. Stop/save within 10 seconds, pause Spotify and inspect at most one short sample. The prior owner report already establishes that phone selection stopped Spotify in ordinary use; this is not a mandatory repeat. |
| 6. Review-close continuation | Stop note playback and Spotify. Re-arm the playback watchdog. Explicitly **Save review and resume tour**. Observe about **3–5 seconds**: the held story should continue from its saved offset, then press Pause and End. Sidi confirms audible continuation; visible/native advancement alone is insufficient. One button observation is enough; Android Back shares the tested close handler and need not become a second audible case. An inactive/ended tour must not be used to claim this pass. |

If the saved headset sample remains poor and the after-stop route looks normal, the engineer can inspect the **same retained file** locally for decoding, levels and clipping without asking for another recording. A brief alternative-output listen can later distinguish recorded degradation from headphone-only playback, but only if it would change the next fix and Sidi is still willing/listening. Do not launch a headset/codec/phone matrix.

## Evidence that separates hypotheses

| Observation | Supported interpretation / next action |
| --- | --- |
| Tour exclusive request granted, then an identifiable later focus request/loss or abandonment coincides with Bluetooth setup | Focus ownership changes merit tracing. Attribute each native client/request; do not assume every tour UID focus record belongs to the recorder rather than its narration or note player. Correct the demonstrated transition, then retest that short case. |
| Tour recorder focus persists and Spotify still has active playback and is audible | Route/focus expectation or competing-player behavior remains suspect. Inspect loss dispatch/state where available. Do not “fix” it by merely adding the same focus request again or call this an Android defect without causal evidence. |
| Verified headset label missing, startup error, or an active recorder entry/label shows phone input | Investigate device selection/route activation/timing first. A requested/preferred Bluetooth device alone cannot establish actual capture. |
| Active Bluetooth input verified; saved file decodes but speech is poor | Intelligibility is still failed. Compare input conditions, captured waveform and post-stop output route. Mono AAC metadata does not establish the Bluetooth transport/codec, and focus correctness does not establish quality. |
| Focus/route state fails to return after Stop | Treat cleanup as a separate reproduced problem. Keep the note and state evidence, end the test and restore normal output before handoff. |
| Neither failure reproduces in this short attempt | Record exactly one observed short pass, retaining the ordinary-use failure. Stop; do not call the headset defect resolved from an unexplained non-reproduction. |

Snapshots may miss the ordering inside `begin()`. If they cannot distinguish the competing explanations, stop collecting and specify a **small instrumentation-only follow-up** with timestamped focus result/callback, requested/actual communication route, active recorder input and release events. That would require a new build and a separately justified brief retest; it is not implemented in this preparation. Existing authority to fix the reported issue persists; installation and listening still need practical preparation and coordination. Do not infer causality from before/after snapshots alone.

## Stop and handoff

Stop on an unexpected audio route/volume, recorder error, USB/tool failure, inability to verify Stop/Pause, or owner fatigue. No waiting for natural story completion is required. Save any in-progress note if possible, stop note playback and Spotify, and verify **End tour / tracking stopped** and no recording. Leave all earlier notes/completion flags intact; retain the new diagnostic note without invented content ratings. Check ordinary headphone routing has returned. Keep the self-contained app installed and verify it reopens silently with Metro absent after the session, without uninstalling or clearing storage.

Record the exact build, headphone identity privately, selected/actual input, observed music behavior, snapshot coverage, sample result and audible review-close result separately. A failure can still produce a useful diagnosis. No result from this desk session establishes automatic outdoor arrivals or the walking chapter's launch.
