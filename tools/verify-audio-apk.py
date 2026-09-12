"""Reject Expo's stock audio binary even when Gradle assembly and signing succeed."""
import sys
import zipfile

for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as apk:
        dex = b''.join(apk.read(name) for name in apk.namelist() if name.endswith('.dex'))
    missing = [marker for marker in (b'tourAdapterVersion', b'tourGeneration', b'tourCommand') if marker not in dex]
    if missing:
        raise SystemExit(f'{path}: required native audio markers missing: {missing}. Check Android buildFromSource.')
    print(f'{path}: native audio adapter markers present; runtime/device tests still required')
