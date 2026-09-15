# Walking Tour Lab

An Android device experiment for a self-guided walking audio player, built with React Native, Expo and TypeScript. M1 is **complete on Sidi’s Pixel 6 / Android 17**, with [acceptance and final build evidence](docs/test-results/M1-closure.md). M2 now adds a small North Finchley offline-map preview alongside the existing three-stop lifecycle lab. **Implemented; offline map and desk regressions verified, outdoor checks pending.** The six-stop product, verified itinerary and general package importer remain later work.

The original [brief](ai_self_guided_tour_project_brief.md) is unchanged. [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [AGENTS.md](AGENTS.md) and [ROADMAP.md](ROADMAP.md) are the maintained project contract. The owner's latest instructions override conflicting brief recommendations.

## Install and take the first walk

**Use the self-contained APK for recording paths and using the app away from the Mac.** The engineer should leave this variant installed between assisted test sessions and verify reopening with Metro stopped. The development APK needs Metro again on a cold start; a “Failed to connect to /127.0.0.1:8081” launcher error means its development server is unavailable. Switch variants with `adb install -r`, preserving saved app data; do not uninstall or clear storage. The required development-build walk is a separately prepared M1 test, followed by restoring the self-contained variant.

The [first-walk procedure](docs/FIRST-WALK.md) and [completed phone checklist](docs/PHONE-CHECKS.md) remain available for targeted regression checks. No further M1 walk is requested. The full physical acceptance matrix remains in [ROADMAP.md](ROADMAP.md#physical-phone-procedure-for-m1); an initial successful walk does not complete M1. Recorded verification is in [docs/test-results/M1.md](docs/test-results/M1.md).

Local build outputs (ignored by Git):

Current `walking-tour-*` outputs include the M2 preview. The accepted M1 APKs are retained under `artifacts/m1-accepted/`; the corrected self-contained preview is now installed and cold opening without Metro is verified. See the [M2 map record and handset procedure](docs/test-results/M2-offline-map.md).

| File | Purpose |
| --- | --- |
| `artifacts/walking-tour-development.apk` | Installed Expo development client; load JavaScript from Metro before the walk |
| `artifacts/walking-tour-offline.apk` | Self-contained release variant with embedded JavaScript, three standard clips and optional long A; no Metro needed |
| `artifacts/walking-tour-m1a-development.apk` | Earlier vertical-slice checkpoint; prefer the final development build |

The APKs target ARM64 Android, minimum API 24, target/compile API 36. USB installation and development-app launch are verified on Sidi's Pixel 6 (Android 17/API 37, ARM64). The repeated locked-screen walking and planned failure-path matrix have passed within their recorded device/build scopes. See the result record. Both final APKs use the same package ID (`uk.sidi.walkingtourlab`) and development signing certificate. Installing one replaces the other without needing to uninstall; never clear app data during recovery testing.

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

## Offline test guide on the phone

Open **Offline test guide / saved results** near the top of Walking Tour Lab. Read the setup/export instructions, choose a case and use **Begin attempt — save a record** before testing. Return to the player for Start/Pause/Resume/End. Conditions and observations save as you type and survive closing or terminating the app. After the test, End in the player, save an observed pass/fail/inconclusive result and export **test results JSON** plus **private diagnostics**. Save both locally together; the first records your observations, the second records player/location behavior.

**Saving JSON:** each Export button opens **Save or share JSON** with a new timestamped filename. Keep it or edit it, then choose **Save to folder**. Select or create a local **Walking Tour Tests** subfolder under Documents or Downloads, tap **Use this folder**, then **Allow**. Wait for **Saved and verified**. Android may block Downloads itself; use a subfolder. Repeated custom names create separate documents (the provider may add a number). **Share instead** remains available, but closing its chooser is not confirmation of a save. Cancelled/failed exports leave original records intact.

All 19 procedures are embedded and readable offline (18 retained M1 cases and one prepared M2 map case). Cases needing the development build, a prepared long-A timing fixture or an engineer-controlled process kill are labelled; they are not silently substituted with easier tests. The guide never starts a tour or automatically certifies acceptance. Older observations remain tied to their original build/route. No historical pass is pre-ticked.

The [full guide text](docs/TEST-GUIDE.md) is generated from the same content as the phone. The [working checklist](docs/PHONE-CHECKS.md) and [M1 result record](docs/test-results/M1.md) remain the human-reviewed status. New guide delivery evidence is recorded in [M1 guide results](docs/test-results/M1-guide.md); the direct-save follow-up is in [M1 export results](docs/test-results/M1-exports.md).

## Configure a walking fixture

Use **Configure / load fixture** in the app:

- **Record a path:** keep the preparation screen open, capture A, walk a known path for roughly four minutes, capture B, then another roughly four minutes to C. The recorder retains intermediate geometry. Check access and standing areas yourself; GPS capture is not physical verification. Stop moving before tapping.
- **Import or paste JSON:** validate and load a three-stop fixture, then export a copy if desired. The [synthetic example](fixtures/synthetic-three-stop.json) documents the format and is only for desk/replay tests, never a real walk.

Standings, optional landmark coordinates, approach, viewpoint and access remain separate fields. Changed content under an existing ID/version is rejected: increment its version. A new fixture gets separate progress; previously loaded fixture progress is archived locally. Export logs before changing fixtures; an export includes events for the current fixture only.

**Friary Park, North Finchley** is the proposed nearby test area; [Barnet Council](https://www.barnet.gov.uk/directories/parks/friary-park) lists it at Friary Road, N12. No geographically invented route or claim of field verification is bundled. The recorder allows Sidi to choose actual paths and standing positions there or elsewhere.

Start, Pause, Resume, manual clip play, Skip, End, automatic playback on/off and New walk/reset are available. Start after recovery restores tracking but keeps the saved hold; use Resume deliberately. End stops tracking. Manual Play intentionally plays one selection without clearing an automatic hold. Diagnostics explain eligible stop, GPS age/accuracy, route distance, dwell, pauses and audio requests/status. Active tours now request updates even while stationary so a paused arrival can be revalidated on Resume. Old locations still cannot release automatic narration; the app explains when it is waiting for a fresh fix. See the [stationary-location correction](docs/test-results/M1-stationary-location.md).

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

`build:android` regenerates native projects from committed Expo config, builds both ARM64 variants and verifies their signatures. Native `/android` and `/ios` directories are generated/ignored. Keep customizations in committed scripts/config/owned modules before regenerating. Android autolinking explicitly builds `expo-audio` from source in `package.json`; Expo's stock precompiled artifact omits our changes. The build checks native APK markers and required location-job permissions (including RECEIVE_BOOT_COMPLETED), and playback checks the adapter revision at runtime. The only native library patch is the version-guarded [audio adapter patch](tools/patch-expo-audio.cjs), applied by `npm ci`'s postinstall and the build script. Rebuild after native changes; JavaScript-only changes use Metro. Rebuild the self-contained APK after any application change.

No backend, paid TTS, AI provider, map key, full Xcode or store membership is needed for M1. Sidi's Pixel 6 is authorized over USB and the app has launched. There is no remaining local installation blocker. The closure-time online Expo check recommends newer SDK-57 patches; the physically tested lockfile is retained, with the exact maintenance recommendations recorded in [M1 closure](docs/test-results/M1-closure.md). For later connections, use a data cable, enable USB debugging and accept this Mac on the handset. The engineer can run installation/build commands; Sidi supplies phone/OS prompts and walking observations.

## Verification and diagnostics

```sh
npm run typecheck
npm run lint
npm test
npm run docs:check
npx expo install --check
npx expo-doctor
npm run replay -- diagnostics/walking-diagnostics.json
```

Tests use deterministic timestamps, real Node SQLite files, failed transactions and a killed subprocess. They do not simulate proof of Android service survival, audible sound, lock-screen controls or real walking GPS. APK inspection verifies embedded assets and configuration, not successful device execution.

Use **Export private diagnostics** after the walk. Up to 10,000 locally stored events include build/source identity, state before/after, reasons and (when explicitly enabled) precise fixes. New walk resets progress but retains logs. The replay runner checks recorded state/effect results and reports discontinuities as separate segments. It allows at most one nanometre of phone/Mac rounding difference in derived distance, cross-track and along-route values; raw fixes, intent, timestamps, arrival decisions and playback effects must match exactly. A source/policy revision may deliberately change replay outcomes; preserve the original export for diagnosis.

```sh
mkdir -p diagnostics
sh tools/android-env.sh adb logcat -d -v threadtime > diagnostics/android-logcat.txt
```

Raw exports stay ignored/private. Logcat may include unrelated device information. Review and sanitize before sharing or committing a fixture. Synthetic fixtures are labeled accordingly. No precise location telemetry or automatic upload exists.

## Independent content preparation

With M1 accepted, the [Finchley six-stop editorial draft](docs/content/FINCHLEY-DRAFT.md) and [two supervised listening briefs](docs/content/E1-BRIEFS.md) can be reviewed independently. They do not replace the phone fixture or establish a walk-ready route. [Map/routing decision notes](docs/content/MAPS-AND-ROUTING.md) prepare the next native experiment.

```sh
npm run check:package -- content/finchley/manifest.json
# Expected to fail until field verification and all real offline assets exist:
npm run check:package -- content/finchley/manifest.json --ready
# Mac-only, installed local Daniel voice; no paid TTS:
node --import tsx tools/render-listening-samples.ts
```

[Package preflight](docs/content/PACKAGES.md) checks structure, evidence references and asset integrity on the Mac. It is not yet a mobile importer or factual/access verifier. The listening renderer saves six private draft AIFF files under ignored `artifacts/listening-drafts/`. See the [preparation result record](docs/test-results/M2-preparation.md) for automated results and outstanding work.

## Code layout

- `App.tsx`: controls, fixture recorder/import and diagnostics UI.
- `src/domain/`: fixture validation, geometry and deterministic state transitions.
- `src/session/`: live Expo location/audio adapters, task registration and serialized coordination.
- `src/map/`: fixed local-map resources, verified staging and a read-only session-position view; no map-owned location or playback.
- `src/storage/`: shared SQL transaction policy used by Expo SQLite and Node tests.
- `src/export/`: named JSON snapshots, editable export dialog and scoped Android folder saving.
- `src/testing/`: embedded guide and durable test journal, independent of tour progress.
- `tests/`, `fixtures/`: automated cases and synthetic input data.
- `tools/`: scoped build/setup, guarded audio patch, source identity, replay and local content preflight/listening tools.
- `content/finchley/`: public-source editorial inputs; separate from the private device route.
- `assets/audio/`: three short local clips; [provenance/transcripts](assets/audio/README.md).

The Expo blank template's license is retained in [TEMPLATE-LICENSE](TEMPLATE-LICENSE). The project is private and no distribution license has been granted.

## M2 offline-map preview

Open **North Finchley offline map**. The preview has roads, paths, railways, buildings, water and local street/place labels; it does not yet draw a selected tour. Grey outside coverage is deliberate. The position dot uses only the existing active session's recent usable fix and disappears when stale, stopped or outside the area. Opening/closing the map never starts a tour or changes a playback hold.

The self-contained APK embeds every map/font resource. The app copies them to a versioned document directory because native PMTiles needs random access to a real local file. Every open checks size and MD5; missing/corrupt copies show an error and **Rebuild local map copy**. The build verifies SHA-256 and decodes every tile. Network access is disabled for the Android renderer, and the style contains only local sources. A development session must load/copy the resources with Metro available before disconnecting; this does not make development cold reopening independent of Metro.

```sh
npm run check:map
python3 tools/verify-map-apk.py artifacts/walking-tour-development.apk artifacts/walking-tour-offline.apk
```

MapLibre RN 11.3.10/native Android 13.2.0 are pinned without upgrading the accepted Expo/audio/location stack. Guide revision 7 adds the prepared map check. Native offline drawing, repair, short memory measurements, remote/focus controls and recovery now have recorded device evidence. The self-contained audio/map-navigation follow-up passed; live position display and targeted offline locked arrival remain pending; see the [desk results and remaining gates](docs/test-results/M2-offline-map.md). See [map source/licence details](assets/maps/north-finchley/README.md).

## Preparing the next checks and milestone

Use the [batch evidence review tool](docs/TEST-EVIDENCE-REVIEW.md) to deduplicate saved attempts and replay candidate diagnostics locally. It never certifies physical acceptance. The [M2 implementation plan](docs/content/M2-IMPLEMENTATION.md) orders the offline-map proof, verified content, durable import and cue/player work after the M1 gate; the [field worksheet](docs/content/FINCHLEY-FIELD-WORKSHEET.md) prepares actual visitor/leg verification. None of this changes the installed phone build.

[Arrival calibration research](docs/ARRIVAL-CALIBRATION.md) compares official location guidance, capture/trigger code and the two initial walks, with follow-ups for stationary delivery and corrected route geometry. It proposes improving stop capture before changing radii; the phone build and current test procedure are unchanged.

### Completed outdoor batch and regression preparation

See [the completed outdoor procedures](docs/FOUR-REMAINING-WALKS.md). The accepted M1 closure used guide revision 6; the M2 preview embeds revision 7 and retains those procedures as a reference. The optional M1 fixture field `audioProfile: "edge-long-a"` selects one 3:30 local A recording; omitted means the original short clips. `node --import tsx tools/testing/prepare-field-fixtures.ts <private-original.json> <new-private-folder>` writes standard and edge fixtures without changing geometry or verification. Keep these precise-coordinate files ignored; never commit them. Import through the existing Configure / load fixture flow, export each attempt before switching, and verify the visible STANDARD CLIPS / EDGE TEST label. Distinct durable audio filenames prevent the long recording from contaminating normal baselines.

The development baselines and [final stay-at-B and Battery Saver cases](docs/test-results/M1-final-outdoor-report.md) are accepted. The outdoor batch and [final connected checks](docs/test-results/M1-closure.md) are complete. The final loading-checkpoint correction passed 79 automated tests and a short installed-device recovery check; no arrival or native-audio policy changed. The completed final cases used the self-contained APK and corrected files in Documents / Walking Tour Remaining. After the long-A update, use New walk rather than resuming an old 6:21 offset. Any future development regression session still needs immediate preparation; overnight survival is not promised.

On the pinned Android stack, the React Native developer menu’s **Disable Fast Refresh** action raised a null-argument exception after saving the setting. Reloading with the persisted setting already false worked. Avoid that menu action during a prepared session; verify the saved setting and record the issue rather than treating setup as crash-free. See [field preparation evidence](docs/test-results/M1-field-preparation.md).
