#!/bin/sh
# Scoped, pinned macOS ARM64 toolchain; no shell-profile edits or emulator images.
set -eu
cd "$(dirname "$0")/.."
[ "$(uname -m)" = arm64 ] || { echo 'This setup script targets an Apple Silicon Mac.'; exit 1; }
df -h .
mkdir -p .toolchain/downloads .toolchain/android-sdk/cmdline-tools .cache/android
if [ ! -f .toolchain/downloads/jdk.tar.gz ]; then
  curl -fL --retry 2 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.20.1_1.tar.gz' -o .toolchain/downloads/jdk.tar.gz
fi
if [ ! -f .toolchain/downloads/android-cli.zip ]; then
  curl -fL --retry 2 'https://dl.google.com/android/repository/commandlinetools-mac_arm64-15859902_latest.zip' -o .toolchain/downloads/android-cli.zip
fi
node - <<'NODE'
const fs=require('node:fs'),crypto=require('node:crypto');
for(const [file,expected] of [['jdk.tar.gz','196d13ba5f10414bef7f6a05a9b3f00edacb18ebacef2b99485db9e2ee18f0e8'],['android-cli.zip','835b62a26162b229b441d1f6d4680383815a270809eb33522c0d480fa5002c4e']]) {
 if(crypto.createHash('sha256').update(fs.readFileSync(`.toolchain/downloads/${file}`)).digest('hex')!==expected) throw Error(`Checksum mismatch: ${file}. Inspect/remove only this generated download before retrying.`);
}
NODE
if [ ! -d .toolchain/jdk-17.0.20.1+1 ]; then LC_ALL=C tar -xzf .toolchain/downloads/jdk.tar.gz -C .toolchain; fi
if [ ! -e .toolchain/jdk ]; then ln -s jdk-17.0.20.1+1 .toolchain/jdk; fi
if [ ! -d .toolchain/android-sdk/cmdline-tools/latest ]; then
  unzip -q .toolchain/downloads/android-cli.zip -d .toolchain/android-sdk/cmdline-tools
  mv .toolchain/android-sdk/cmdline-tools/cmdline-tools .toolchain/android-sdk/cmdline-tools/latest
fi
# This accepts the SDK package licenses for the requested local development tools.
yes | sh tools/android-env.sh sdkmanager --sdk_root="$PWD/.toolchain/android-sdk" 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0' 'ndk;27.1.12297006' 'cmake;3.22.1'
sh tools/android-env.sh java -version
