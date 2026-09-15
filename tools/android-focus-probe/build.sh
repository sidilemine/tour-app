#!/bin/sh
# Run through tools/android-env.sh. No downloads or main-app changes.
set -eu
TOUR_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
PROBE_OUT=$(mktemp -d "$TOUR_ROOT/artifacts/focus-probe-build.XXXXXX")
PROBE_SOURCE="$TOUR_ROOT/tools/android-focus-probe"
PROBE_ANDROID="$ANDROID_HOME/platforms/android-36/android.jar"
mkdir -p "$PROBE_OUT/classes" "$PROBE_OUT/dex"
javac --release 8 -classpath "$PROBE_ANDROID" -d "$PROBE_OUT/classes" "$PROBE_SOURCE/FocusActivity.java"
d8 --lib "$PROBE_ANDROID" --min-api 26 --output "$PROBE_OUT/dex" "$PROBE_OUT/classes/uk/sidi/walkingtour/focusprobe/FocusActivity.class"
aapt2 link -I "$PROBE_ANDROID" --manifest "$PROBE_SOURCE/AndroidManifest.xml" -o "$PROBE_OUT/unsigned.apk"
zip -q -j "$PROBE_OUT/unsigned.apk" "$PROBE_OUT/dex/classes.dex"
zipalign -p 4 "$PROBE_OUT/unsigned.apk" "$PROBE_OUT/aligned.apk"
# The generated app's standard debug keystore is test-only, never a release key.
apksigner sign --ks "$TOUR_ROOT/android/app/debug.keystore" --ks-pass pass:android --key-pass pass:android --out "$PROBE_OUT/focus-probe.apk" "$PROBE_OUT/aligned.apk"
apksigner verify "$PROBE_OUT/focus-probe.apk"
cp "$PROBE_OUT/focus-probe.apk" "$TOUR_ROOT/artifacts/tour-focus-probe.apk"
printf '%s\n' 'Built artifacts/tour-focus-probe.apk (engineer-only companion; not installed).'
