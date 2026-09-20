#!/bin/sh
# Explicit, read-only phone inspection. No playback, recording, UI or installation.
set -eu
TOUR_CAPTURE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
exec python3 - "$TOUR_CAPTURE_ROOT" "$@" <<'PY'
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time

root = Path(sys.argv[1]).resolve()
parser = argparse.ArgumentParser(description=(
    "Read selected Pixel audio state into ignored diagnostics. Never starts sound "
    "or recording. A dry run does not contact adb."))
parser.add_argument("--serial", required=True, help="Explicit adb device serial; never printed")
parser.add_argument("--label", required=True, help="Short phase name, e.g. headset-before")
parser.add_argument("--samples", type=int, default=1, help="1–12 audio snapshots (default 1)")
parser.add_argument("--interval", type=float, default=0.5, help="0.25–2 seconds between snapshots")
parser.add_argument("--dry-run", action="store_true", help="Validate preparation without contacting a device")
args = parser.parse_args(sys.argv[2:])

def fail(message):
    print("Capture not completed: " + message, file=sys.stderr)
    raise SystemExit(1)

if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,160}", args.serial):
    fail("invalid serial syntax.")
if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,39}", args.label):
    fail("label must contain only lowercase letters, digits and hyphens (max 40).")
if not 1 <= args.samples <= 12 or not 0.25 <= args.interval <= 2:
    fail("samples must be 1–12 and interval 0.25–2 seconds.")
adb = root / ".toolchain/android-sdk/platform-tools/adb"
if not adb.is_file() or not os.access(adb, os.X_OK):
    fail("project-local adb is unavailable; use the existing Android setup instructions.")
if args.dry_run:
    print("Dry run OK: explicit Pixel 6 selection, installed-app/UID checks, then "
          "bounded audio excerpts under ignored diagnostics. No adb command ran.")
    raise SystemExit(0)

def run(arguments, *, selected=True, allow_failure=False):
    command = [str(adb)] + (["-s", args.serial] if selected else []) + arguments
    try:
        result = subprocess.run(command, text=True, capture_output=True, timeout=8)
    except (OSError, subprocess.TimeoutExpired):
        fail("an inspection command failed or timed out; no phone action was issued.")
    if result.returncode and not allow_failure:
        fail("a read-only adb query failed; raw device errors were withheld.")
    return result

# Do not silently choose another attached phone or wait for authorisation.
devices = run(["devices"], selected=False).stdout.splitlines()
states = [row.split()[1] for row in devices if len(row.split()) >= 2 and row.split()[0] == args.serial]
if len(states) != 1:
    fail("the explicitly selected device is absent or ambiguous.")
if states[0] != "device":
    state = states[0] if states[0] in ("unauthorized", "offline") else "unavailable"
    fail("the selected device is " + state + ".")
if run(["get-state"]).stdout.strip() != "device":
    fail("selected-device verification failed.")
model = run(["shell", "getprop", "ro.product.model"]).stdout.strip()
if model != "Pixel 6":
    fail("the selected device is not the prepared Pixel 6.")
sdk = run(["shell", "getprop", "ro.build.version.sdk"]).stdout.strip()
package = "uk.sidi.walkingtourlab"
packages = (package, "com.spotify.music")
uids = {}
for name in packages:
    listing = run(["shell", "cmd", "package", "list", "packages", "-U", name]).stdout
    match = re.search(r"^package:" + re.escape(name) + r"\s+uid:(\d+)\s*$", listing, re.M)
    if match:
        uids[name] = match.group(1)
if package not in uids:
    fail("Walking Tour Lab is not installed for this inspection context.")
pids = run(["shell", "pidof", package], allow_failure=True).stdout.split()
if not pids or any(not value.isdigit() for value in pids):
    fail("Walking Tour Lab is not running; capture does not launch it.")

os.umask(0o077)
private = root / "diagnostics"
if private.is_symlink():
    fail("diagnostics must be a local directory, not a symlink.")
private.mkdir(mode=0o700, exist_ok=True)
ignored = subprocess.run(["git", "check-ignore", "-q", "diagnostics/recording-state-check.txt"], cwd=root)
if ignored.returncode != 0:
    fail("diagnostics is not ignored by Git.")
stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
destination = Path(tempfile.mkdtemp(prefix=f"recording-state-{stamp}-{args.label}-", dir=private))

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()

metadata = {"startedUtc": now(), "serial": args.serial, "model": model, "sdk": sdk,
            "packages": uids, "tourPidsAtStart": pids, "label": args.label,
            "samplesRequested": args.samples, "intervalSeconds": args.interval,
            "limit": "Filtered snapshots, not complete native event history or audible evidence."}
(destination / "context.json").write_text(json.dumps(metadata, indent=2) + "\n")
details = run(["shell", "dumpsys", "package", package]).stdout
(destination / "package-version.txt").write_text("\n".join(
    line for line in details.splitlines()
    if re.match(r"\s*(versionCode=|versionName=|firstInstallTime=|lastUpdateTime=)", line)
) + "\n")

package_pattern = re.compile(r"(?<![\w.])(?:" + "|".join(map(re.escape, packages)) + r")(?![\w.])")
uid_pattern = re.compile(r"\b(?:uid(?:/pid)?|u/pid)\s*[:=]?\s*(?:" +
                         "|".join(uids.values()) + r")(?=\D|$)", re.I)
pid_pattern = re.compile(r"\bpid\s*[:=]\s*(?:" + "|".join(pids) + r")(?=\D|$)", re.I)
# Only isolated scalar routing fields are retained globally. No device inventory,
# Bluetooth addresses, playlists, full media-session dump or general logcat.
scalars = re.compile(r"\b(?:mMode|mActualMode|mRequestedMode|mBluetoothScoOn|"
                     r"mScoAudioState|mCurCommunicationPortId)\s*[:=]\s*"
                     r"(?:MODE_[A-Z_]+|true|false|-?\d+)\b")
matched = 0
try:
    for index in range(args.samples):
        started = now()
        result = run(["shell", "dumpsys", "audio"], allow_failure=True)
        if result.returncode or not result.stdout.strip() or re.search(
                r"Permission Denial|Can't find service|DUMP TIMEOUT", result.stdout, re.I):
            fail("audio inspection was denied, unavailable or timed out; earlier excerpts are retained.")
        lines = []
        for line in result.stdout.splitlines():
            if package_pattern.search(line) or uid_pattern.search(line) or pid_pattern.search(line):
                lines.append(line)
                matched += 1
            else:
                lines.extend("global: " + value.group(0) for value in scalars.finditer(line))
        (destination / f"audio-{index + 1:02d}.txt").write_text(
            f"hostQueryStartUtc={started}\nhostQueryEndUtc={now()}\n"
            "scope=matching tour/Spotify package, UID or tour PID lines; selected global scalars\n"
            "Unmatched lines were discarded; absence is not proof of absent focus/routing.\n" +
            "\n".join(lines) + "\n")
        if index + 1 < args.samples:
            time.sleep(args.interval)
except KeyboardInterrupt:
    fail("capture interrupted; completed private excerpts are retained. Stop any manual test separately.")
if not matched:
    fail("no target audio lines were recognised; treat saved scalar snapshots as inconclusive.")
print(f"Saved {args.samples} private audio excerpt(s) in {destination.relative_to(root)}")
print("No sound, recording, UI, permission or app-data action was issued. Inspect locally; do not commit raw evidence.")
PY
