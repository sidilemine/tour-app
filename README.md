# Walking Tour Lab

An Android device experiment for a self-guided walking audio player, built with React Native, Expo and TypeScript. M1 is **implemented; awaiting physical test**. This is a three-stop lifecycle lab, not the six-stop product or an offline map/navigation engine.

The original [brief](ai_self_guided_tour_project_brief.md) is unchanged. [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [AGENTS.md](AGENTS.md) and [ROADMAP.md](ROADMAP.md) are the maintained project contract. The owner's latest instructions override conflicting brief recommendations.

## Install and take the first walk

Start with [docs/FIRST-WALK.md](docs/FIRST-WALK.md). The full physical acceptance matrix remains in [ROADMAP.md](ROADMAP.md#physical-phone-procedure-for-m1); an initial successful walk does not complete M1. Recorded verification is in [docs/test-results/M1.md](docs/test-results/M1.md).

Local build outputs (ignored by Git):

| File | Purpose |
| --- | --- |
| `artifacts/walking-tour-development.apk` | Installed Expo development client; load JavaScript from Metro before the walk |
| `artifacts/walking-tour-offline.apk` | Self-contained release variant with embedded JavaScript and all three clips; no Metro needed |
| `artifacts/walking-tour-m1a-development.apk` | Earlier vertical-slice checkpoint; prefer the final development build |

The APKs target ARM64 Android, minimum API 24, target/compile API 36. USB installation and development-app launch are verified on Sidi's Pixel 6 (Android 17/API 37, ARM64). Walking, audio/location lifecycle and progress-recovery acceptance remain pending; see the result record. Both final APKs use the same package ID (`uk.sidi.walkingtourlab`) and development signing certificate. Installing one replaces the other without needing to uninstall; never clear app data during recovery testing.

```sh
sh tools/android-env.sh adb devices -l
sh tools/android-env.sh adb install -r artifacts/walking-tour-development.apk
sh tools/android-env.sh adb reverse tcp:8081 tcp:8081
npm start
```

Press `a` in Metro to open the app. `npm start` uses the project toolchain and localhost; USB forwarding avoids a LAN dependency while preparing the build. Keep connected until **Start** has copied all clips to durable local files. For a development-build walk: disable Fast Refresh, unplug, stop Metro, turn off phone Wi-Fi/data while keeping Location enabled, and lock. A loaded development session does not prove offline cold launch.

For the self-contained build:

```sh
sh tools/android-env.sh adb install -r artifacts/walking-tour-offline.apk
```

Open **Walking Tour Lab** from the phone's app list. Check cold launch with Metro stopped and data/Wi-Fi off. Expo's [local compilation guide](https://docs.expo.dev/guides/local-app-development/) documents development and release variants; this project performs no EAS build, remote upload, store signing or publication.

## Configure a walking fixture

Use **Configure / load fixture** in the app:

- **Record a path:** keep the preparation screen open, capture A, walk a known path for roughly four minutes, capture B, then another roughly four minutes to C. The recorder retains intermediate geometry. Check access and standing areas yourself; GPS capture is not physical verification. Stop moving before tapping.
- **Import or paste JSON:** validate and load a three-stop fixture, then export a copy if desired. The [synthetic example](fixtures/synthetic-three-stop.json) documents the format and is only for desk/replay tests, never a real walk.

Standings, optional landmark coordinates, approach, viewpoint and access remain separate fields. Changed content under an existing ID/version is rejected: increment its version. A new fixture gets separate progress; previously loaded fixture progress is archived locally. Export logs before changing fixtures; an export includes events for the current fixture only.

**Friary Park, North Finchley** is the proposed nearby test area; [Barnet Council](https://www.barnet.gov.uk/directories/parks/friary-park) lists it at Friary Road, N12. No geographically invented route or claim of field verification is bundled. The recorder allows Sidi to choose actual paths and standing positions there or elsewhere.

Start, Pause, Resume, manual clip play, Skip, End, automatic playback on/off and New walk/reset are available. Start after recovery restores tracking but keeps the saved hold; use Resume deliberately. End stops tracking. Manual Play intentionally plays one selection without clearing an automatic hold. Diagnostics explain eligible stop, GPS age/accuracy, route distance, dwell, pauses and audio requests/status.

## Development setup on this Mac

Inspected and installed locally on 12 September 2026:

| Component | Version/location |
| --- | --- |
| Host | macOS 15.2, Apple Silicon; Node 24.13.0, npm 11.6.2, Git 2.39.2 already present |
| Expo / React Native / React | 57.0.22 / 0.86.3 / 19.2.3, locked by `package-lock.json` |
| TypeScript | 6.0.3 |
| JDK | Temurin 17.0.20.1+1, ARM64, `.toolchain/jdk` |
| Android tools | `.toolchain/android-sdk`; command-line tools 22.0, platform-tools 37.0.1 |
| Native build | SDK/build tools 36/36.0.0; NDK 27.1.12297006; CMake 3.22.1; Gradle wrapper 9.3.1 |

Only the physical-build components were installed: no Android Studio, emulator or system images. The JDK/command-line downloads were checked against publisher SHA-256 values. Shell profiles and other projects were not changed. ADB creates its normal local authentication directory. Disk space was rechecked throughout and did not block builds; no owner files were deleted. About 15 GiB was available initially; available space varies during builds.

On a fresh checkout on an Apple Silicon Mac:

```sh
npm ci
sh tools/setup-android.sh
npm run build:android
```

`setup-android.sh` downloads pinned tools into ignored project-local directories and accepts the ordinary SDK package licenses. [Android's tool downloads](https://developer.android.com/studio) provide the command-line-only option. `tools/android-env.sh` scopes JDK/SDK/Gradle paths to a single command rather than editing shell configuration.

`build:android` regenerates native projects from committed Expo config, builds both ARM64 variants and verifies their signatures. Native `/android` and `/ios` directories are generated/ignored. Keep customizations in committed scripts/config/owned modules before regenerating. The only native library patch is the version-guarded [audio adapter patch](tools/patch-expo-audio.cjs), applied by `npm ci`'s postinstall and the build script. Rebuild after native changes; JavaScript-only changes use Metro. Rebuild the self-contained APK after any application change.

No backend, paid TTS, AI provider, map key, full Xcode or store membership is needed for M1. Sidi's Pixel 6 is authorized over USB and the app has launched. There is no remaining local installation blocker. For later connections, use a data cable, enable USB debugging and accept this Mac on the handset. The engineer can run installation/build commands; Sidi supplies phone/OS prompts and walking observations.

## Verification and diagnostics

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npm run replay -- diagnostics/walking-diagnostics.json
```

Tests use deterministic timestamps, real Node SQLite files, failed transactions and a killed subprocess. They do not simulate proof of Android service survival, audible sound, lock-screen controls or real walking GPS. APK inspection verifies embedded assets and configuration, not successful device execution.

Use **Export private diagnostics** after the walk. Up to 10,000 locally stored events include build/source identity, state before/after, reasons and (when explicitly enabled) precise fixes. New walk resets progress but retains logs. The replay runner checks recorded state/effect results and reports discontinuities as separate segments. A source/policy revision may deliberately change replay outcomes; preserve the original export for diagnosis.

```sh
mkdir -p diagnostics
sh tools/android-env.sh adb logcat -d -v threadtime > diagnostics/android-logcat.txt
```

Raw exports stay ignored/private. Logcat may include unrelated device information. Review and sanitize before sharing or committing a fixture. Synthetic fixtures are labeled accordingly. No precise location telemetry or automatic upload exists.

## Code layout

- `App.tsx`: controls, fixture recorder/import and diagnostics UI.
- `src/domain/`: fixture validation, geometry and deterministic state transitions.
- `src/session/`: live Expo location/audio adapters, task registration and serialized coordination.
- `src/storage/`: shared SQL transaction policy used by Expo SQLite and Node tests.
- `tests/`, `fixtures/`: automated cases and synthetic input data.
- `tools/`: scoped build/setup, guarded audio patch, source identity and replay tools.
- `assets/audio/`: three short local clips; [provenance/transcripts](assets/audio/README.md).

The Expo blank template's license is retained in [TEMPLATE-LICENSE](TEMPLATE-LICENSE). The project is private and no distribution license has been granted.
