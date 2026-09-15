# Transient audio-focus companion

Engineer-only Android test app for M1's **actual focus return** case. It requests `AUDIOFOCUS_GAIN_TRANSIENT` through Android's `AudioManager`, emits one quiet 300 ms beep, then abandons the same request after eight seconds. It never dispatches tour events or accesses tour storage. No network or Android permissions are requested. This is controlled native competing-app evidence, not a simulated phone call or a walking test.

Uses the existing project JDK/SDK and generated standard debug keystore; no dependencies, main-app changes or remote build. Outputs and signing material stay ignored. Do not distribute this debugging companion or use its key for production.

```sh
sh tools/android-env.sh sh tools/android-focus-probe/build.sh
sh tools/android-env.sh adb install -r artifacts/tour-focus-probe.apk
sh tools/android-env.sh adb shell am start -n uk.sidi.walkingtour.focusprobe/.FocusActivity
```

The activity has no launcher shortcut. Build alone does not install it or prove focus behavior. Keep the activity foreground when pressing **Interrupt for 8 seconds**: Android 15+ requires a top app or foreground service for focus requests. Inspect the grant result; denial is not a successful interruption. **Release now**, the timeout and activity destruction abandon the held request. The timeout intentionally exceeds the beep; no silent audio plays during the hold.

## Physical procedure

1. Prepare a stopped, backed-up Walking Tour Lab session, with no other competing audio. Have Sidi listen through the selected output. Use long A so UI preparation cannot outlast the clip.
2. Start the tour with no manual/recovery hold, then open this activity while A is audibly playing. Press **Interrupt for 8 seconds** once. Confirm Android grants transient focus and the tour pauses at a saved offset.
3. Capture app-scoped focus evidence during the hold and after abandonment. Retain only Walking Tour Lab / this companion's focus records; do not save or print other apps' media metadata. The probe's own `TourFocusProbe` log records request/abandon results and timestamps.
4. Verify **actual focus returned to the tour** using Android focus-stack/loss-state or dispatch evidence, not merely the beep ending or the probe saying it abandoned focus. Observe at least ten seconds after return: no spontaneous narration and the saved hold remains. If return cannot be established, keep the criterion open.
5. Return to Walking Tour Lab. Explicit Resume must continue the saved clip. Ask Sidi to confirm audible stop, silence after the beep and deliberate continuation. End, export/replay and record the tested scope. Preserve all previous attempts.
6. Remove only this temporary companion after collecting its evidence: `adb uninstall uk.sidi.walkingtour.focusprobe`. Never uninstall or clear Walking Tour Lab.

Official basis: [Android audio focus](https://developer.android.com/media/optimize/audio-focus), checked 15 September 2026. This test complements the accepted Spotify and Bluetooth checks. It does not establish telephony-specific routing or every possible interruption.

## Preparation result

15 September: compiled and signed locally; APK signature verified and manifest inspection confirms no requested permissions. Initial compilation against Android's boot stubs failed on Java lambda support; compiling with JDK `--release 8` and the Android API classpath, followed by D8 desugaring, passed. No main-player source or binary changed. Subsequent execution passed on Pixel 6 / Android 17: native loss and gain were delivered, the tour remained silent for 31.469 seconds after gain until explicit Resume, and Sidi confirmed audible continuation. The companion was removed afterward. See [connected closure evidence](../../docs/test-results/M1-closure.md).
