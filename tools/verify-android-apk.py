"""Verify the native audio adapter and background-location permissions in built APKs."""
import sys
import re
import subprocess
from pathlib import Path
import zipfile
import json
import hashlib

for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as apk:
        dex = b''.join(apk.read(name) for name in apk.namelist() if name.endswith('.dex'))
        if Path(path).name == 'walking-tour-offline.apk':
            bundle = apk.read('assets/index.android.bundle')
            source_id = json.loads(Path('src/buildInfo.json').read_text())['sourceId']
            # Hermes can store a string containing Unicode as UTF-16, including
            # its otherwise ASCII substrings. Check both representations.
            for marker in ('Offline test guide', 'walking-tests.db', 'pause-silence', 'process-kill',
                           'Walking Tour Remaining', 'edge-long-a', 'edge-a-v2', '3:30', source_id):
                if marker.encode('utf-8') not in bundle and marker.encode('utf-16le') not in bundle:
                    raise SystemExit(f'{path}: bundled guide marker missing: {marker!r}')
            audio_hashes = {hashlib.sha256(apk.read(name)).digest() for name in apk.namelist() if name.endswith('.m4a')}
            for clip in ('a', 'b', 'c', 'edge-a'):
                if hashlib.sha256(Path(f'assets/audio/{clip}.m4a').read_bytes()).digest() not in audio_hashes:
                    raise SystemExit(f'{path}: missing or changed embedded {clip} clip')
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
        'android.permission.RECORD_AUDIO',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
        'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    }
    missing_permissions = required - permissions
    if missing_permissions:
        raise SystemExit(f'{path}: required Android permissions missing: {sorted(missing_permissions)}')
    print(f'{path}: native audio markers and location-job permissions present; device tests still required')
