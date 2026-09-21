# Final navigation check

Reviewed 21 September 2026 by `hampstead_route`. Scope: the actual assembled `content/hampstead/plan.json` and `stories.json`, against [route-selected.json](route-selected.json), [ROUTE-DIRECTIONS.md](ROUTE-DIRECTIONS.md) and the retained desk evidence. No frozen input, recording, package or phone state was changed.

**Result: no material navigation mismatch found.** The assembled route, physical stops, spoken summaries, detailed directions and chapter bounds agree. This establishes consistency with the desk-reviewed route; it does not establish today's physical clearance or observed GPS/audio behavior.

## Exact inputs reviewed

| Input | SHA-256 |
| --- | --- |
| `content/hampstead/plan.json` | `17881fdf9bb2880db44754d3002125a55d108ae6661a8fe8730e64f9870d0f4c` |
| `content/hampstead/stories.json` | `7d363209c1bf53408019fcfef5e1125c77f8d392c3470d5c95ddca0c39a0d39f` |
| `route-selected.json` | `48a46f827e5fbbb38fe32cf37cd4821bc6f6bb739ae15e8b2005b91d5d7783ca` |
| `ROUTE-DIRECTIONS.md` | `406fe328cb5c338a7b5130da397828a780584de63a80a431724af70e143b46bf` |

The plan's recorded source/directions hashes match these files. Its entire 239-point route equals the reviewed route input, including the explicit East Heath Road south-landing/pavement correction.

## Stops, approach and viewpoint

| Stop | Route index | Standing-to-route distance | Review |
| --- | ---: | ---: | --- |
| Highgate station | 0 | 2.89 m | Actual Archway Road exit 3 start, before the signalised crossing; no old-platform visit implied. Intro tells the owner that Start plays here immediately. |
| Pond Square | 61 | 7.69 m | Northern public connection/steps and pause inside western edge are consistent. Historic ponds are not presented as still visible. |
| Highgate ponds | 130 | 0 m | Pause about 170 m after the Millfield turn, before the side-path branch. No bathing enclosure entry, island sightline or visible swimmer required. |
| 2 Willow Road | 201 | 7.91 m | East Heath zebra precedes Downshire/Willow approach. Building-side public pavement, with driveway clearance; no mandatory opposite-bench crossing or interior entry. |
| Keats House | 214 | 2.28 m | Keats Grove public gate frontage. Partial view and garden closure are explicitly accommodated. |

Story IDs/order, standing coordinates, landmark coordinates and route indices all match the reviewed input. Every standing association satisfies the existing 10 m rule; no threshold was relaxed.

## Crossings and connected directions

- **Station/village:** the spoken and written instructions use Archway Road's nearby pedestrian signals, then Southwood Lane and Highgate High Street's zebra before the square. They do not invite an arbitrary A1 crossing. The route's street-centreline data is not a requirement to walk along the centre of Southwood Lane.
- **Highgate West Hill:** eastern pavement on the descent, uncontrolled refuge just beyond Merton Lane, then a short return to the lane mouth. The voice says to cross each half when clear. It does not call this refuge a zebra/signals or recite the provider's misleading “U-turn” instruction.
- **Merton/Millfield:** the narrow lane and its lack of continuous footway are disclosed. Directions lead through Merton, left onto Millfield, then right onto the main shared Heath path. The first walking chapter is placed after that last turn, not while crossing or in the narrow lane.
- **Heath:** the spoken summary is deliberately supplemented by the saved steps and offline line. The 490 m first turn, subsequent 120 m/right/40 m/keep-left sequence, northern Mixed Pond approach and onward western pond-chain path agree with the selected geometry. None of the unnamed forks is given an invented sign or landmark. Bathing enclosures remain outside the route.
- **East Heath Road:** the detailed steps turn to the zebra before the direct road mouth, complete the crossing, turn left along the far pavement and right into Downshire Hill. This agrees with the authored correction and avoids the initial provider shortcut across the road mouth.
- **Willow/Keats:** return along Willow, right down Downshire and left into Keats Grove is consistent with the route. The green garden gate is an observed orientation cue; entering it is not required.
- **Finish:** Keats is the final narrated stop; the map continues to Hampstead Heath station at index 238. Four minutes to that station and about fourteen minutes to the written Hampstead Underground alternative are consistent with the router measurements. End stops location; the saved route/directions remain the means of following the short final connection.

## Walking-chapter bounds

| Chapter | Launch indices | Next navigation index | Distance after latest launch | Time at 6 km/h | Audio cap | Reserve at cap |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `walking-conversation` | 121–122 | 130 | 128.94 m | 77.36 s | 60 s | 17.36 s |
| `keeping-the-heath` | 138–140 | 152 | 269.61 m | 161.76 s | 90 s | 71.76 s |

The frozen text has 122 and 166 words respectively. Neither chapter has acquired appended navigation that would change the placement logic. The final generated audio duration must still satisfy the caps/margin check in the preparation tool; text length alone is not duration evidence. Both windows are beyond the relevant preceding stop and before the next required navigation decision.

## Limits retained

Pond sightlines, exact clear standing width and temporary works remain unobserved. Street imagery is dated; the short East Heath pavement connector is explicitly approximate, supported by observed layout rather than a surveyed coordinate trace. The introduction/verification notes retain those limits and tell the owner to keep the offline map available at unnamed forks. No additional physical test is requested by this review.
