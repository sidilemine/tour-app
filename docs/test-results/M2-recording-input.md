# M2 headset recording and competing music

17 September 2026. **Implemented and built; actual headset capture and Spotify interaction await a short connected check.** This addresses the first Tour B feedback, without changing the authored tours or requiring another baseline walk.

## Diagnosis and change

The pinned Expo Audio 57.0.5 recorder starts MediaRecorder without requesting audio focus. Setting `interruptionMode: doNotMix` alone does not pause another app for recording. Our review also never selected or displayed the actual microphone. This explains a missing control boundary; the old recordings contain no input-route telemetry, so their exact microphone cannot be proved retrospectively.

The owned, version-guarded Android patch now requests transient exclusive audio focus, selects a connected wired/USB/Bluetooth headset input (or the built-in input), and reports MediaRecorder's actual routed device. The UI waits up to four seconds for confirmation before showing Recording and the microphone name. A connected headphone output without an available microphone produces a clear error and an explicit Phone microphone fallback. Android Nearby devices permission is requested for headset selection; capture remains private and foreground-only.

Bluetooth selection uses the communication **output** and corresponding preferred input. It temporarily enters communication mode and restores it when the recorder releases. Focus loss or a changed/disconnected verified input pauses capture; the existing save path finalises and retains the note. Neither focus return nor reopening resumes recording or narration. Normal completion, startup failure and stop failure release the focus/routing session. Notes are mono. No cloud service, background microphone service or paid dependency is introduced.

Locking the phone, opening the camera or switching apps still ends and saves a recording. Keep the review visible while speaking; this change does not add background recording.

## Automated and build evidence

- TypeScript and lint pass; **138 tests pass**, including actual-route verification, refusal of an obsolete adapter, timeout/interruption, and closure during asynchronous startup. Tests do not prove native routing or intelligibility.
- Both development and self-contained APKs assemble. Final source **`ab54dddf76bf5cd0`**, guide **9**. Static checks find recording/playback native markers and required permissions; all 257 map files and both tours' 12 audio entries match the source.
- The Expo compatibility check reports newer patch versions for Expo, build-properties, location, sharing and task-manager. The accepted pinned stack is retained; this is not a clean compatibility-check pass or an SDK upgrade.
- Existing saved-note storage/export and tour arrival/pause policy are unchanged. No repeat export, full walk or stationary-location baseline is justified by this change.

## Silent installation

The self-contained APK was installed in place on the Pixel 6. With Metro absent, force-stop and cold reopening showed both prepared George v2 tours, B selected, all stops complete and tracking stopped. Review opens with the new controls; no recording or audible check is claimed by this silent step. App exit records show the expected package update and engineer force-stop, without a new crash entry.

## Focused physical check

Allow approximately five minutes with the touring headset. Confirm listening readiness first. Play Spotify, open Review and record a short sentence with the phone away from the mouth. Check the actual Headset microphone label, music interruption, clear saved playback, and ordinary headphone playback after capture. A brief Phone microphone fallback and disconnect/save check can be clustered if practical; identify any omitted subcase honestly. Preserve existing feedback and progress; hand back the self-contained app cold-opened without Metro.

## Sources

Implementation inspected against installed Expo Audio 57.0.5 and official [Expo recording API](https://docs.expo.dev/versions/v57.0.0/sdk/audio/), [Android audio focus](https://developer.android.com/media/optimize/audio-focus), [communication device selection](https://developer.android.com/develop/connectivity/bluetooth/ble-audio/audio-manager), and [MediaRecorder routed-device API](https://developer.android.com/reference/android/media/MediaRecorder#getRoutedDevice()). Native API availability and assembled code are not evidence that this particular headset works.

## Subsequent review-resume correction

The next assignment found that the 138-test run preceded adding guide case 21: the final guide-9 tree retained an obsolete expected case count of 20. The new suite exposed that failure; the assertion is now updated to require all 21 specific cases. The earlier claim did not establish a passing suite for the final guide-9 tree. Subsequent owner direction changes explicit review close to resume an active tour; the earlier close-stays-held procedure is historical, superseded by guide 10.

## Second outing, 18 September

The retrieved installed APK confirms source `ab54dddf76bf5cd0` was used. The [new feedback](../content/SECOND-TOUR-FEEDBACK-RECOVERY.md) includes a clear report at Tally Ho that recording did not stop Spotify, followed by an unclear short Arcade report that something worked. Actual input route was not persisted; successful saved files do not establish headset capture or focus correctness. Keep this issue open, with the conflicting/unclear later observation retained. The review-resume update was installed silently after retrieval; no further listening test occurred.
