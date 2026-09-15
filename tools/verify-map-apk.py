"""Verify the release embeds every map resource, and both variants have the renderer."""
import hashlib
import json
import sys
import zipfile
from pathlib import Path

catalog = json.loads(Path('src/map/catalog.json').read_text())
for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as apk:
        names = apk.namelist()
        if 'lib/arm64-v8a/libmaplibre.so' not in names:
            raise SystemExit(f'{path}: missing ARM64 MapLibre library')
        if Path(path).name == 'walking-tour-offline.apk':
            hashes = {hashlib.sha256(apk.read(name)).hexdigest() for name in names
                      if name.startswith(('assets/', 'res/')) and not name.endswith('/')}
            missing = [f['path'] for f in catalog['files'] if f['sha256'] not in hashes]
            if missing:
                raise SystemExit(f'{path}: {len(missing)} missing/changed embedded map files; first: {missing[:3]}')
            print(f'{path}: all {len(catalog["files"])} map files embedded byte-for-byte; native drawing still unverified')
        else:
            print(f'{path}: native map library present; development assets require Metro preparation')
