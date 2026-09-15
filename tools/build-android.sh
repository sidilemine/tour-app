#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --import tsx tools/guide-docs.ts --check
node --import tsx tools/maps/check.ts
node tools/patch-expo-audio.cjs
node tools/build-info.cjs
# Only ARM64, physical-device builds. Never installs emulator images.
sh tools/android-env.sh npx expo prebuild --platform android --no-install
sh tools/android-env.sh sh -c 'cd android && ./gradlew :app:assembleDebug :app:assembleRelease --no-daemon --max-workers=2 -PreactNativeArchitectures=arm64-v8a'
mkdir -p artifacts
cp android/app/build/outputs/apk/debug/app-debug.apk artifacts/walking-tour-development.apk
cp android/app/build/outputs/apk/release/app-release.apk artifacts/walking-tour-offline.apk
sh tools/android-env.sh apksigner verify artifacts/walking-tour-development.apk
sh tools/android-env.sh apksigner verify artifacts/walking-tour-offline.apk
python3 tools/verify-android-apk.py artifacts/walking-tour-development.apk artifacts/walking-tour-offline.apk
python3 tools/verify-map-apk.py artifacts/walking-tour-development.apk artifacts/walking-tour-offline.apk
