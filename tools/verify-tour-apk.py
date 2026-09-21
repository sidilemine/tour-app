"""Verify all four authored tours and their exact audio are in the offline APK."""
import base64
import binascii
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FINCHLEY_MAP = 'north-finchley-abc1a7e4d563d305'
CLERKENWELL_MAP = 'clerkenwell-8f45f13ad1755318'
HAMPSTEAD_MAP = 'hampstead-0abcc26a600e0718'
PACKAGE_SPECS = (
    ('A', 'content/north-finchley/packages/A.json', 5, 0, FINCHLEY_MAP),
    ('B', 'content/north-finchley/packages/B.json', 6, 1, FINCHLEY_MAP),
    ('Clerkenwell', 'content/clerkenwell/packages/working-lives.json', 8, 2, CLERKENWELL_MAP),
    ('Highgate–Hampstead', 'content/hampstead/packages/room-to-breathe.json', 5, 2, HAMPSTEAD_MAP),
)


def load_packages():
    packages = []
    for label, relative_path, stop_count, chapter_count, map_id in PACKAGE_SPECS:
        path = ROOT / relative_path
        if not path.is_file():
            raise SystemExit(f'{label}: required authored package is missing: {relative_path}')
        package = json.loads(path.read_text())
        fixture = package['fixture']
        narration = fixture['narration']
        if package['mapId'] != map_id:
            raise SystemExit(f'{label}: expected map {map_id}, got {package["mapId"]}')
        if len(fixture['stops']) != stop_count or len(narration['stories']) != stop_count or len(narration['chapters']) != chapter_count:
            raise SystemExit(f'{label}: expected {stop_count} stops/stories and {chapter_count} walking chapters')
        clips = narration['stories'] + narration['chapters']
        audio_by_key = {clip['audio']['key']: clip['audio'] for clip in clips}
        assets = package['assets']
        asset_keys = [asset['key'] for asset in assets]
        if len(audio_by_key) != len(clips) or len(asset_keys) != len(set(asset_keys)) or set(asset_keys) != set(audio_by_key):
            raise SystemExit(f'{label}: audio assets must match every story/chapter exactly once')
        for asset in assets:
            audio = audio_by_key[asset['key']]
            try:
                raw = base64.b64decode(asset['base64'], validate=True)
            except (binascii.Error, ValueError) as error:
                raise SystemExit(f'{label}: invalid base64 audio {asset["key"]}: {error}') from error
            if len(raw) != audio['bytes'] or hashlib.md5(raw).hexdigest() != audio['md5']:
                raise SystemExit(f'{label}: authored audio bytes/hash mismatch: {asset["key"]}')
        packages.append((label, package))
    ids = [package['fixture']['id'] for _, package in packages]
    if len(set(ids)) != len(ids):
        raise SystemExit('Authored packages must have four distinct tour IDs')
    clip_count = sum(len(package['assets']) for _, package in packages)
    if clip_count != 29:
        raise SystemExit(f'Expected 29 authored clips across four tours, got {clip_count}')
    return packages


def main(paths):
    if not paths:
        raise SystemExit('Usage: python3 tools/verify-tour-apk.py <offline.apk> [<offline.apk> ...]')
    packages = load_packages()
    source_id = json.loads((ROOT / 'src/buildInfo.json').read_text())['sourceId']
    if not isinstance(source_id, str) or not source_id:
        raise SystemExit('src/buildInfo.json must contain a nonempty sourceId')
    for path in paths:
        with zipfile.ZipFile(path) as apk:
            if 'assets/index.android.bundle' not in apk.namelist():
                raise SystemExit(f'{path}: missing embedded JavaScript bundle; use a self-contained APK')
            bundle = apk.read('assets/index.android.bundle')

            def embedded(value):
                return value.encode('utf-8') in bundle or value.encode('utf-16le') in bundle

            if not embedded(source_id):
                raise SystemExit(f'{path}: APK source identity does not match current source {source_id}')
            clips = 0
            for label, package in packages:
                fixture = package['fixture']
                if not embedded(fixture['id']):
                    raise SystemExit(f'{path}: missing {label} tour: {fixture["id"]}')
                for asset in package['assets']:
                    if not embedded(asset['base64']) or not embedded(asset['key']):
                        raise SystemExit(f'{path}: {label} audio not embedded byte-for-byte: {asset["key"]}')
                    clips += 1
            for marker in ('walking-feedback.db', 'Record voice note', FINCHLEY_MAP, CLERKENWELL_MAP, HAMPSTEAD_MAP):
                if not embedded(marker):
                    raise SystemExit(f'{path}: missing feature/map marker: {marker}')
            print(f'{path}: exact source {source_id}, four tours / {clips} audio entries, feedback and all three pinned map IDs embedded')


if __name__ == '__main__':
    main(sys.argv[1:])
