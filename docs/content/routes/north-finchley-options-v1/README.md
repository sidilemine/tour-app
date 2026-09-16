# North Finchley option routing evidence

16 September 2026. Authoring-time discussion evidence for [two tour proposals](../../NORTH-FINCHLEY-TOUR-OPTIONS.md), not a playable route or a physical record.

- `points.json`: named approximate public-landmark/street points and order. Coordinates are desk selections, not verified visitor positions or private GPS traces.
- `A-request.json`, `B-request.json`: actual requests to `https://valhalla1.openstreetmap.de/route`, JSON POST, pedestrian costing, walking speed 4.5 km/h, kilometres and British-English instructions.
- `A-response.json`, `B-response.json`: unmodified successful responses, including polyline6 geometry, leg summaries and manoeuvres. Engine/data revision was not supplied; request date is known, routing graph age is not.
- `A-map.svg`, `B-map.svg` and PNG copies: original proposal graphics from saved geometry and a bounded OSM street extract. Map scales differ; each has a 100 m scale bar. Markers show provisional input points and may sit off the snapped line. Source graphics are not copied from a tile service.

## Results

| Option | Route length | Router moving time | Leg lengths including initial approach |
| --- | --- | --- | --- |
| A | 1.391 km | 1131.418 s / 18.857 min | 126, 106, 257, 301, 468, 131 m |
| B | 1.918 km | 1605.590 s / 26.760 min | 126, 211, 603, 487, 217, 272 m |

Leg lengths are individually rounded by the provider and may differ from the rounded total by a few metres. Proposal budgets add stationary audio and an explicit margin; they are not provider tour estimates. Full routes fit the existing map coverage bounds [-0.196, 51.600, -0.159, 51.626].

## Method and limits

The [official Valhalla project](https://github.com/valhalla/valhalla) identifies the FOSSGIS public demonstration API; the [route reference](https://valhalla.github.io/valhalla/api/route/api-reference/) documents pedestrian speed and waypoint snapping. Three successful, cached public-landmark requests were made: initial A, B and revised A. The initial A put the arcade before the finish and retraced into it; the retained A moves it to the outward leg and passes through it. Two earlier request attempts failed before a successful JSON POST; no production service dependency or provider commitment follows.

Public OSM data came from a single API map request for bbox -0.190,51.608,-0.173,51.621, after Overpass rejected a request. The raw public extract remains a temporary authoring input, not a phone trace. Point anchors include OSM Arts Depot way 20794099, Grand Arcade footway 7744647, Torrington-site address 811 High Road, Trinity way 509100125, Elephant node 448921712 and Moss Hall Crescent way 3403277. Stanhope uses the researched address and approximate nearby mapped approach; Meeting House uses the published address and [published coordinate](https://en.wikipedia.org/wiki/Finchley_Meeting_House), adjusted towards the street. Neither establishes a useful standing area.

The maps expose repeated pavement: A goes north and returns along the High Road, with side visits; B has a larger western circuit, a Tally Ho opening spur and a short Crescent return. A's close first two stops need suitable separated visitor areas. Some paths near Tally Ho are mapped separately from carriageways, while other legs follow street centrelines. Never interpret the line as instructions to walk in the road.

No route here establishes pavement width, safe crossings, current construction, private/public boundary, unrestricted arcade hours, step-free access or what can be seen. In particular, review the Stanhope final approach and Meeting House snap/sightline before producing directions. Do not reuse raw manoeuvres as spoken tour instructions. A response saying no time restrictions is not an access check.

## Attribution and rights

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under ODbL. The SVG/PNG maps are produced works with visible attribution; the saved OSM-derived routing geometry retains that source/licence context. These are local review artifacts. No source photographs, performance recordings or copyrighted basemap tiles were downloaded or embedded.
