"""Verify the native audio adapter and background-location permissions in built APKs."""
import sys
import re
import subprocess
from pathlib import Path
import zipfile

for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as apk:
        dex = b''.join(apk.read(name) for name in apk.namelist() if name.endswith('.dex'))
        if Path(path).name == 'walking-tour-offline.apk':
            bundle = apk.read('assets/index.android.bundle')
            for marker in (b'Offline test guide', b'walking-tests.db', b'pause-silence', b'process-kill'):
                if marker not in bundle:
                    raise SystemExit(f'{path}: bundled guide marker missing: {marker!r}')
            if len([name for name in apk.namelist() if name.endswith('.m4a')]) < 3:
                raise SystemExit(f'{path}: missing embedded test clips')
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
