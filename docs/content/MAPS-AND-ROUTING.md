# Offline map and routing decision preparation

Original comparison: 13 September 2026. **Update, 15 September:** the authorized prototype now uses MapLibre RN 11.3.10 / Android 13.2.0 with a fixed local PMTiles extract. Native builds and local resource checks pass; actual drawing and session coexistence remain pending. See [current results](../test-results/M2-offline-map.md) and [source/rights](../../assets/maps/north-finchley/README.md). The comparison below is retained as the earlier decision preparation.

Official documentation checked 13 September 2026. Recommendation: after M1 passes, prove a small MapLibre React Native offline region on the phone, using a map source with explicit offline rights. Keep routing an authoring-time operation and store reviewed geometry/directions in the package. This is a recommended experiment, not a selected data contract or an installed dependency.

| Option | Practical benefit | Unresolved issue / disposition |
|---|---|---|
| MapLibre Native offline database | The React Native offline manager documents region creation and database merging; promising for a self-contained local import | Must prove SDK 57 integration and a cold offline render with every required style, glyph, sprite and tile. Recommended first adapter experiment |
| MBTiles / PMTiles archive | A convenient portable local data artifact in principle | An archive is not automatically supported by the React Native renderer. URL protocols, decoder, style resources and offline rights need an explicit prototype; do not promise drop-in support |
| Static local image plus route overlay | Small dependency footprint for a limited diagnostic overview | Insufficient by itself for the intended navigable local map; keep only as a scoped fallback proposal if native mapping fails |

[MapLibre setup](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/) requires the new React Native architecture for v11 and RN 0.80 or later. Our RN 0.86 project meets those declared prerequisites; that is not an integration test. The [offline manager](https://maplibre.org/maplibre-react-native/docs/modules/offline-manager/) exposes offline packs and `mergeOfflineRegions(path)`, which imports an offline database. It does not establish that arbitrary MBTiles or PMTiles files can be merged.

MapLibre is the renderer, not a grant of rights to any tile service. The standard [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/) prohibits offline bulk downloading/prefetching from its public tile server. Do not use that endpoint to assemble a package. Evaluate a small licensed offline extract or a provider explicitly permitting offline regions; record attribution, permitted redistribution, expiry, cost and all renderer-resource licences before committing to it. No tiles were downloaded and no account/key was created in this preparation.

## Planned routing boundary

[Valhalla](https://github.com/valhalla/valhalla) is a candidate for pedestrian routing at authoring time. Its project documents a public demonstration service; that is not a production availability agreement. We have not yet run a six-stop routing request because the visitor waypoints are unknown. Routing between building centroids would not resolve that gap.

Once the visitor points are reviewed, request a walking route and preserve input waypoints/constraints, provider/version where available, generation date, actual output geometry, maneuvers, distances and timing. Review road crossings, private access, steps and garden closures independently. Derived duration is a planning estimate until timed in person. Playback reads the saved route and directions without contacting the router. Arbitrary offline rerouting remains out of scope.

The bounded public landmark searches used [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) with an identifying user agent, caching and more than a second between requests. No private device trace was sent. Future private waypoint uploads require the project's privacy/authorization review; the default remains on-device location.

## Concrete M2 proof before commitment

- Choose one permitted small-area dataset with documented cost/rights. Ask Sidi before any meaningful charge or hard-to-reverse provider commitment.
- Add one renderer adapter on an isolated implementation change after the lifecycle gate. Sideload the data into durable storage, cold-launch with all networking off and pan/zoom the whole route area.
- Exercise missing tiles/glyphs/sprites, corrupted data, outside-coverage behavior and interrupted import. Record storage size, peak memory, load time and exact SDK/provider versions.
- Add planned geometry and actionable local direction cues. Cue arbitration must respect manual pause, including a pause arriving during a cue; visual-only directions are insufficient when a story runs long.
- Only then settle the package map format and import mechanism. No backend, production routing API or reusable city database is needed for this proof.
