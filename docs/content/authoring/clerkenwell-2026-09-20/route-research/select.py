"""Compose the selected public authoring route and its auditable indices.

Coordinates are desk candidates, not a record of a visitor's location or field safety.
Run analyse.py first. Only consecutive identical vertices are deduplicated;
source-to-composed indices are retained. No interpolation or moved vertices.
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).parent


def read(name):
    return json.loads((ROOT / name).read_text())


def metres(a, b):
    p, q = math.radians(a[1]), math.radians(b[1])
    dp, dl = q - p, math.radians(b[0] - a[0])
    return 6371000 * 2 * math.asin(math.sqrt(
        math.sin(dp / 2) ** 2 + math.cos(p) * math.cos(q) * math.sin(dl / 2) ** 2))


sources = [('selected-south', i) for i in range(1, 4)] + [('gate-signals', 0)] + [
    ('selected-north', i) for i in range(3)]
stop_names = ['charterhouse', 'smithfield', 'booths', 'gate', 'green',
              'woodbridge', 'ingersoll', 'exmouth']
visitor_candidates = [[-.09970, 51.52103], [-.10190, 51.51983], [-.10388, 51.52154],
                      [-.10266, 51.52185], [-.10559, 51.52291], [-.10404, 51.52408],
                      [-.10395, 51.52551], [-.10953, 51.52566]]
route, legs, stops = [], [], []
for i, (name, source_leg) in enumerate(sources):
    feature = read(f'{name}-geometry.geojson')['features'][source_leg]
    points = feature['geometry']['coordinates']
    if route:
        assert route[-1] == points[0], (name, source_leg, route[-1], points[0])
    source_indices = []
    for point in points:
        if not route or route[-1] != point:
            route.append(point)
        source_indices.append(len(route)-1)
    begin = source_indices[0]
    legs.append(dict(source=name, sourceLeg=source_leg, beginIndex=begin,
                     endIndex=len(route)-1, sourceIndexMap=source_indices,
                     **feature['properties']))
    stops.append(dict(id=stop_names[i], routeIndex=begin, routedCoordinate=points[0],
                      visitorCandidate=visitor_candidates[i], verification='desk-candidate'))
stops.append(dict(id=stop_names[-1], routeIndex=len(route)-1, routedCoordinate=route[-1],
                  visitorCandidate=visitor_candidates[-1], verification='desk-candidate'))
along = [0.0]
for a, b in zip(route, route[1:]):
    along.append(along[-1]+metres(a, b))

chapters = []
for chapter_id, leg_index, start, latest, nav, max_seconds in [
    ('close', 4, 8, 13, 30, 65.8), ('skinner', 6, 16, 21, 39, 64.775)
]:
    index_map = legs[leg_index]['sourceIndexMap']
    a, b, c = [index_map[j] for j in (start, latest, nav)]
    clearances = [metres(route[j], visitor_candidates[k])
                  for j in range(a, b+1) for k in (leg_index, leg_index+1)]
    assert min(clearances) > 40, (chapter_id, min(clearances))
    chapters.append(dict(
        id=chapter_id, legIndex=leg_index, firstLaunchIndex=a, latestLaunchIndex=b,
        navigationPointIndex=c, firstLaunchCoordinate=route[a],
        latestLaunchCoordinate=route[b], navigationPointCoordinate=route[c],
        measuredAudioSeconds=max_seconds,
        launchWindowMetres=round(along[b]-along[a], 2),
        minAdjacentVisitorCandidateClearanceMetres=round(min(clearances), 2),
        latestLaunchToNavigationMetres=round(along[c]-along[b], 2),
        reserveAt6KmhAfterMaxClipMetres=round(along[c]-along[b]-max_seconds*6/3.6, 2),
        acousticStatus='quieter minor street, traffic possible' if chapter_id == 'close'
                       else 'B502 bus street; quietness not established',
        note='Indices apply only to this exact tour LineString. Latest launch is not an audio cutoff.'))

approach = read('selected-south-geometry.geojson')['features'][0]
approach['properties'].update(role='approach', fromStop='farringdon', toStop='charterhouse',
                              playback='Do not press Start until Charterhouse')
tour_feature = dict(type='Feature', properties=dict(role='tour', verification='desk-reviewed-candidate',
    attribution='OpenStreetMap contributors / Valhalla',
    providerKm=round(sum(x['providerKm'] for x in legs), 3),
    providerSeconds=round(sum(x['providerSeconds'] for x in legs), 3)),
    geometry=dict(type='LineString', coordinates=route))
(ROOT/'selected-route.geojson').write_text(json.dumps(dict(type='FeatureCollection',
    features=[approach, tour_feature]), indent=2)+'\n')
summary = dict(date='2026-09-20', coordinateOrder='longitude, latitude',
    routeFile='selected-route.geojson', tourFeatureIndex=1, approachFeatureIndex=0,
    approachIncludedInTourIndices=False, stops=stops, legs=legs, chapters=chapters,
    totalWithApproachKm=round(tour_feature['properties']['providerKm']+approach['properties']['providerKm'], 3),
    totalWithApproachSeconds=round(tour_feature['properties']['providerSeconds']+approach['properties']['providerSeconds'], 3),
    tourPolylineMetres=round(along[-1], 2),
    points=[dict(index=i, longitude=p[0], latitude=p[1], alongMetres=round(along[i], 2))
            for i, p in enumerate(route)])
(ROOT/'selected-route-index.json').write_text(json.dumps(summary, indent=2)+'\n')
print(json.dumps({k:summary[k] for k in ('totalWithApproachKm','totalWithApproachSeconds','chapters')}, indent=2))
