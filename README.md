# Self-guided audio tours

A walking tour player for Sidi's Android phone, with iOS to follow. Tours are prepared ahead of time and played from local packages; ordinary walks need no live LLM, TTS or server.

## Repository status

Foundation only, established 12 September 2026. There is no app scaffold, package manifest, installed project dependencies or runnable application yet. The next assignment is **M1: combined background audio and location on a physical Android phone**, as specified in [ROADMAP.md](ROADMAP.md#milestone-1--android-audio-and-location-lifecycle-spike).

The original [project brief](ai_self_guided_tour_project_brief.md) is preserved unchanged. The product owner's agreed revisions, recorded in these documents, supersede conflicting examples and ordering in that brief.

| File | Purpose |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Experience, behavior and scope |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Boundaries, decisions, data and risks |
| [AGENTS.md](AGENTS.md) | Permanent engineering operating instructions |
| [ROADMAP.md](ROADMAP.md) | Milestones, acceptance criteria and device procedure |

## Environment inspected

Observed on this Mac on 12 September 2026; recheck before implementation.

| Item | Observation |
| --- | --- |
| Host | Apple Silicon (`arm64`), macOS 15.2, Zsh |
| Node / npm | Node 24.13.0, npm 11.6.2; native arm64 support present |
| Git | Apple Git 2.39.2; author identity already configured |
| Apple command-line tools | Present at `/Library/Developer/CommandLineTools` |
| Android build tools | Android Studio, SDK, `adb` and `sdkmanager` not found in PATH or inspected standard application/SDK locations |
| Java | `/usr/bin/java` is a launcher; no usable JDK found by `java_home`; standard JVM directory empty |
| Phone | No Android USB device observed; model, Android version and permissions unverified |
| Storage | About 15 GiB available on the project volume at inspection time |

The missing setup that blocks **local M1 device execution** is a working JDK and Android SDK/toolchain, plus a connected, USB-authorized Android phone for installation and physical tests. This does not block implementing the scaffold or running JavaScript tests. Storage headroom must be checked when installing the toolchain; it is an observed constraint, not a proven failure. Do not delete the owner's files to make space.

## Recommended Android workflow

Use **Expo CLI locally, with an installed development build and a USB-connected physical phone**. This supports repeated native debugging without an Expo account or remote build service. Expo Go is not the acceptance environment: we need our own native configuration for background services. Expo documents local compilation and `expo-dev-client` in its [local build guide](https://docs.expo.dev/guides/local-app-development/).

EAS cloud builds reduce Mac toolchain setup, but require account access and sending project inputs to Expo. They are an optional fallback if local setup proves impractical; no cloud build, remote repository, upload or publication is authorized by this foundation task. A local build is the recommended working path, and no store membership is needed for it. See Expo's [build workflow comparison](https://docs.expo.dev/develop/development-builds/introduction/).

### One-time local setup, when M1 starts

1. Install the Apple Silicon edition of Android Studio and a macOS arm64 JDK 17. Expo's current [Android setup instructions](https://docs.expo.dev/workflow/android-studio-emulator/) recommend JDK 17 and Android SDK Platform 36. Reconcile these with the stable Expo SDK selected for M1; record the actual versions, including Gradle/NDK requirements from the generated project.
2. Through Android Studio's SDK Manager, install the required SDK platform, build tools, platform tools and command-line tools. Let the generated native build identify any required NDK/CMake versions. Use the real phone; an emulator and its system images are optional.
3. Set the shell's Java and SDK paths to the installed locations. For the standard SDK location and a registered JDK 17:

   ```sh
   export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
   java -version
   adb version
   ```

   Persist these exports in the appropriate local Zsh configuration once verified; do not commit machine-specific paths. Do not replace an existing shell configuration.
4. On the phone, enable Developer options and USB debugging, connect a data-capable cable and accept this Mac's debugging authorization. `adb devices -l` must show `device`, not `unauthorized`. These physical authorization steps require Sidi. Android's [hardware-device guide](https://developer.android.com/studio/run/device) describes pairing and connection troubleshooting.

Native installers or license prompts may need owner interaction; the engineer should perform all available routine setup and diagnosis. Full Xcode, iOS signing, a map-provider account, backend credentials and AI/TTS accounts are not prerequisites for M1. Use owned test recordings.

### Scaffold and build commands — future M1, not runnable yet

The implementation agent will choose and pin a stable Expo SDK with its compatible React Native and TypeScript versions, create a single app at the repository root, and retain these documents. Generate the template in a temporary directory and selectively integrate it; do not overwrite the nonempty repository or its Git history. Use npm and commit `package-lock.json`; no monorepo tooling is needed.

After scaffolding, install SDK-compatible modules:

```sh
npx expo install expo-dev-client expo-location expo-task-manager expo-audio expo-sqlite expo-file-system expo-asset
npx expo run:android --device
```

For subsequent JavaScript-only changes:

```sh
npm ci
npx expo start --dev-client
```

Use USB port forwarding if needed for Metro:

```sh
adb reverse tcp:8081 tcp:8081
```

Native dependency/config-plugin changes require regeneration and a new build. With all native customizations captured in committed config/plugins and the working tree checked, use `npx expo prebuild --clean --platform android`, then rebuild. `--clean` deletes generated native directories; never use it to discard unpreserved work. This repository adopts [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) and ignores generated `/android/` and `/ios/` directories.

### Walking without the Mac

A normal development client gets JavaScript from Metro. For the M1 development-build walk, load the bundle and copy **every test asset to durable local storage** while connected, confirm readiness, disable Fast Refresh, unplug, and stop Metro before testing. The running session must perform the silence-to-arrival transition without the Mac. An already loaded development session does not establish offline cold-start support.

M1 must also produce a locally installed, self-contained release-variant test APK with embedded JavaScript and assets, using `npx expo run:android --device --variant release`. Verify its generated signing configuration and use a local development key for sideloading if needed; this is not store signing or distribution. Keep the key and APK out of Git. Verify cold launch with Metro stopped and phone data/Wi-Fi off before calling it self-contained. Use consistent local signing when replacing the development build so installation does not erase progress; test recovery within each build, without uninstalling.

## Verification and debugging

M1 will add these actual npm scripts; none exist at foundation stage:

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
```

Tests will exercise deterministic location/event replays, playback policy and durable recovery. They cannot establish real Android background behavior. [ROADMAP.md](ROADMAP.md#physical-phone-procedure-for-m1) contains the required physical test and pass/fail record.

The diagnostic screen must export structured, locally recorded events after an unplugged walk. Reconnect the phone for supplemental native diagnostics:

```sh
mkdir -p diagnostics
adb logcat -d -v threadtime > diagnostics/android-logcat.txt
```

Logcat can include unrelated device information. Keep raw exports private and ignored; inspect before sharing. Commit only deliberately sanitized replay fixtures and a result summary. Record build identifier, device/OS, settings, steps, expected/actual result and relevant event timestamps. No precise location upload or telemetry service is needed.

At foundation stage, verification consists of file/link consistency, ignore-rule checks, unchanged-brief verification and Git review. No app, native build or physical-phone behavior has been tested.
