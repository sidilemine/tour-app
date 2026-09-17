# North Finchley review routes — 17 September 2026

These are public-landmark authoring requests, not private traces or physical walking results.

- `A-request.json` / `A-response.json`: removes the rejected Stanhope detour, retaining five stops; 1.222 km, 995.265 seconds of provider moving time.
- `A-exterior-request.json` / `A-exterior-response.json`: then moves Grand Arcade to its Ballards Lane entrance so a closed passage does not interrupt the walk. **Selected A:** 1.158 km, 951.833 seconds. The short return towards Tally Ho and High Road remains intentional.
- B reuses the [saved 16 September response](../north-finchley-options-v1/B-response.json): 1.918 km, 1,605.590 seconds. No extra request or new physical acceptance is implied.

Requests use the public FOSSGIS Valhalla demonstration service, pedestrian costing at 4.5 km/h, British-English instructions. Responses are retained unmodified. Public OpenStreetMap street/footway data for bbox `-0.186,51.609,-0.174,51.618` was also inspected on 17 September; the temporary XML is not a private trace. Map data © OpenStreetMap contributors, ODbL. Routing is authoring-only; the phone never calls this service.

## Interpretation and limits

The first provider leg is the bus-station/artsdepot approach to Tally Ho. Each subsequent endpoint is a story stop; it must not be mistaken for an extra start stop. The app begins narration deliberately at Tally Ho and shows the complete approach and return geometry.

Some geometry follows road centres. Mapped pavement points are selected separately where available, and the written directions explicitly keep the visitor on pavements and pedestrian crossings. Sources include OSM footway 188279731 (Tally Ho), 1432526632/7744647 (Arcade street entrance), 1533817137 (Torrington vicinity), 1432659144 (Trinity), 1432661877 (Elephant) and 3400191 (artsdepot). Map nodes establish a desk candidate, not today's obstruction-free standing space. The [exterior checks](EXTERIOR-CHECKS.md) document dated imagery and the remaining first-use observations.

A requires no passage opening, pub admission or rehearsal. B requires no Meeting House, garden or pub entry. Keep every instruction tied to the named street or exterior; a mapped line through a road is not a request to walk in it. If current works prevent a comfortable view, skip rather than enter closed/private space.

## Timing and walking chapter

Use the measured [preparation record](../../../../content/north-finchley/preparation.json), not the earlier proposal's estimates. Ordinary time adds stationary recordings and a modest crossing/looking allowance to provider walking time. Ratings and voice notes are additional and optional. B's walking chapter overlaps the residential leg; it is not added again as stationary listening.

B's chapter starts only after onward departure from the Meeting House and three usable fixes over at least four seconds in its reviewed launch interval. The interval begins about 75 metres after that stop; the 160-metre threshold falls at an actual geometry point about 172 metres along. At the latest launch point there are about 242 metres before the Moss Hall Crescent turn: approximately 194 seconds at the request speed against 141 seconds of measured audio. That leaves roughly 53 seconds. Faster walking, detours and pauses alter timing; Pause and manual chapter/stop controls remain available. An unstarted chapter expires after its window so it cannot arrive as a late speech backlog.

Full-geometry replays verify sequence and chapter timing; they do not establish actual GPS delivery or current access. The accepted unchanged M1 location/audio baseline is reused. First tour use supplies actual route quality and enjoyment, without a separate long baseline campaign.
