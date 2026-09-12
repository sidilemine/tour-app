#!/bin/sh
# Project-local tools only; this file does not modify the caller's shell.
set -eu
TOUR_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
export JAVA_HOME="$TOUR_ROOT/.toolchain/jdk/Contents/Home"
export ANDROID_HOME="$TOUR_ROOT/.toolchain/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export GRADLE_USER_HOME="$TOUR_ROOT/.cache/gradle"
export ANDROID_USER_HOME="$TOUR_ROOT/.cache/android"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/build-tools/36.0.0:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
exec "$@"
