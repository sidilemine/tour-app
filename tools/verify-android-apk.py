"""Verify the native audio adapter and background-location permissions in built APKs."""
import sys
import re
import subprocess
from pathlib import Path
import zipfile

for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as apk:
        dex = b''.join(apk.read(name) for name in apk.namelist() if name.endswith('.dex'))
    missing = [marker for marker in (b'tourAdapterVersion', b'tourGeneration', b'tourCommand') if marker not in dex]
    if missing:
        raise SystemExit(f'{path}: required native audio markers missing: {missing}. Check Android buildFromSource.')
    output = subprocess.check_output([
        'sh', str(Path(__file__).with_name('android-env.sh')),
        'aapt2', 'dump', 'permissions', path,
    ], text=True)
    permissions = set(re.findall(r"uses-permission: name='([^']+)'", output))
    required = {
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
        'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    }
    missing_permissions = required - permissions
    if missing_permissions:
        raise SystemExit(f'{path}: required Android permissions missing: {sorted(missing_permissions)}')
    print(f'{path}: native audio markers and location-job permissions present; device tests still required')
