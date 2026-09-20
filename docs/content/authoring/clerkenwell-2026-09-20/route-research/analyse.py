"""Recompute saved public authoring routes; never treats geometry as safe pavement."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).parent


def decode(encoded):
    i = lat = lon = 0
    points = []
    while i < len(encoded):
        deltas = []
        for _ in range(2):
            value = shift = 0
            while True:
                byte = ord(encoded[i]) - 63
                i += 1
                value |= (byte & 31) << shift
                shift += 5
                if byte < 32:
                    break
            deltas.append(~(value >> 1) if value & 1 else value >> 1)
        lat += deltas[0]
        lon += deltas[1]
        points.append((lat / 1e6, lon / 1e6))
    return points


def distance(a, b):
    p1, p2 = map(math.radians, [a[0], b[0]])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    return 6371000 * 2 * math.asin(math.sqrt(
        math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))


for name in ('compact', 'main', 'charterhouse', 'charterhouse-first', 'park-edge', 'gate-signals', 'charterhouse-front', 'return-farringdon', 'return-angel', 'selected-south', 'selected-north'):
    trip = json.loads((ROOT / f'{name}-response.json').read_text())['trip']
    features, summary = [], []
    for index, leg in enumerate(trip['legs']):
        points = decode(leg['shape'])
        along = [0]
        for a, b in zip(points, points[1:]):
            along.append(along[-1] + distance(a, b))
        properties = dict(leg=index, polylineMetres=round(along[-1], 2),
                          providerKm=leg['summary']['length'], providerSeconds=leg['summary']['time'])
        features.append(dict(type='Feature', properties=properties,
                             geometry=dict(type='LineString', coordinates=[[lon, lat] for lat, lon in points])))
        summary.append(dict(**properties, points=[dict(index=i, latitude=p[0], longitude=p[1],
                           alongMetres=round(along[i], 2)) for i, p in enumerate(points)],
                           maneuvers=[dict(instruction=m['instruction'], beginIndex=m['begin_shape_index'],
                           alongMetres=round(along[m['begin_shape_index']], 2)) for m in leg['maneuvers']]))
    (ROOT / f'{name}-geometry.geojson').write_text(json.dumps(dict(type='FeatureCollection', features=features), indent=2) + '\n')
    (ROOT / f'{name}-analysis.json').write_text(json.dumps(dict(providerSummary=trip['summary'], legs=summary), indent=2) + '\n')
    print(name, trip['summary']['length'], round(trip['summary']['time'] / 60, 2))
