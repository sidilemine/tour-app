"""Focused actual Pyosmium regression; run with the pinned map environment."""
import importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location("extract_map", Path(__file__).parents[1] / "tools/generation/factory/extract-map.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
handler = module.Extract([-0.16, 51.56, -0.13, 51.59])
handler.apply_buffer(b'''<osm version="0.6"><node id="1" lat="51.5775" lon="-0.1468"><tag k="highway" v="crossing"/></node><node id="2" lat="51.60" lon="-0.1468"/><way id="3"><nd ref="1"/><nd ref="2"/><tag k="highway" v="footway"/></way><relation id="4"><member type="way" ref="3" role=""/><tag k="type" v="route"/></relation></osm>''', 'osm', locations=True)
assert [e['id'] for e in handler.elements] == [1, 3]
assert handler.elements[1]['geometry'] == [dict(lat=51.5775, lon=-0.1468), None]
print('Actual Pyosmium node/way identity and outside-extent gap regression passed; relations excluded.')
