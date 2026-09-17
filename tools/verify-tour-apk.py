"""Verify authored tour audio/data is actually embedded in the offline APK."""
import base64
import hashlib
import json
import sys
import zipfile
from pathlib import Path

for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as apk:
        bundle = apk.read('assets/index.android.bundle')
        def embedded(value):
            return value.encode('utf-8') in bundle or value.encode('utf-16le') in bundle
        source_id = json.loads(Path('src/buildInfo.json').read_text())['sourceId']
        if not embedded(source_id):
            raise SystemExit('APK has a different source identity')
        clips = 0
        for variant in ('A', 'B'):
            package = json.loads(Path(f'content/north-finchley/packages/{variant}.json').read_text())
            fixture = package['fixture']
            if not embedded(fixture['id']):
                raise SystemExit(f'Missing tour: {variant}')
            stories = fixture['narration']['stories'] + fixture['narration']['chapters']
            for asset in package['assets']:
                story = next(s for s in stories if s['audio']['key'] == asset['key'])
                raw = base64.b64decode(asset['base64'], validate=True)
                if len(raw) != story['audio']['bytes'] or hashlib.md5(raw).hexdigest() != story['audio']['md5']:
                    raise SystemExit(f'Invalid authored asset: {asset["key"]}')
                if not embedded(asset['base64']) or not embedded(asset['key']):
                    raise SystemExit(f'Audio not embedded in APK: {asset["key"]}')
                clips += 1
        for marker in ('walking-feedback.db', 'Record voice note', 'north-finchley-abc1a7e4d563d305'):
            if not embedded(marker):
                raise SystemExit(f'Missing feature: {marker}')
        print(f'{path}: exact source {source_id}, two tours / {clips} audio entries, feedback and pinned map embedded')
