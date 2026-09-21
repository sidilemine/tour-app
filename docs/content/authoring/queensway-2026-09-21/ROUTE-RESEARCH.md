# Queensway evening demo — route research

Researched 21 September 2026 by the route/navigation agent. Owner selected a **20–25 minute** outing, three stops and one George walking story. Root selected **QUEENS → Whiteleys → Leinster Gardens**, ending near **46 Queensborough Terrace**. This is a desk-reviewed public-street route, not a field clearance or a promise about tonight’s lighting, works, crowds or parked vehicles.

## Selected route and files

- [route-selected.json](route-selected.json) is the frozen integration input: 61 points; stop indices **0, 16, 46**; finish **60**.
- [Final provider request](route-request-final.json) and [unchanged response](route-response-final.json) retain the pedestrian route before the explicit corrections recorded in the selected input. Each leg includes the response SHA-256 and original maneuver indices. Provider maneuvers are audit material; use the reviewed `onwardDirections` instead.
- Coordinates are latitude/longitude WGS84. Street-centre lines represent named public streets; the literal directions specify pavement sides. Authored crossing landings and standing points are approximate, not survey measurements.
- The provider reports **1,208 m / 990.241 seconds (16.5 minutes)** at 4.5 km/h. Corrected polyline length is **1,213.66 m**. Allow the remainder for the three short stationary stories, looking and crossings; the walking story overlaps movement. Queensway station to QUEENS adds about one minute. Personal pace can exceed the estimate.

| Leg | Provider metres | Provider time | Route indices |
|---|---:|---:|---:|
| QUEENS → Whiteleys | 333 | 4.36 min | 0–16 |
| Whiteleys → Leinster Gardens viewpoint | 514 | 6.97 min | 16–46 |
| Viewpoint → 46 Queensborough Terrace vicinity | 360 | 5.18 min | 46–60 |

Provider rounding explains the 1 m difference between rounded legs and trip total.

## Candidate choice and rejected shortcuts

The initial QUEENS–Whiteleys–fronts circuit routed at 1.258 km / 17.2 minutes, before the visitor pins were refined. Replacing Whiteleys with St Sophia produced **1.706 km / 23.2 minutes of movement**, leaving too little room for narration within the owner’s requested duration. The cathedral has an exterior option, but does not earn this additional distance for this demo. Root chose the compact trio; no interior entry is required at any stop.

The initial discovery coordinate for the false fronts was about 55–60 metres north of the actual numbered frontage. It was rejected before integration. OSM address nodes **600826221** and **600826224**, and October 2025 street imagery, put 23/24 opposite the Craven Hill Gardens junction. The final visitor viewpoint is on the **east pavement immediately north of that junction**, not the building, railway gap, a hotel forecourt or a Street View camera position.

The rear railway view over a high wall is omitted. Private gardens, Whiteleys interiors and the QUEENS basement are not needed. Queensborough Mews is not the return route: the public **Queensborough Passage** runs straight through.

## Visitor standing and what is actually visible

| Stop | Public standing coordinate | Landmark coordinate | View/access evidence and limit |
|---|---|---|---|
| QUEENS | 51.510945, -0.187255 | 51.5108972, -0.1873387 | West pavement beside the entrance at 17 Queensway, in the Queens Court parade. Keep the doorway and bus-stop space clear. September 2024 street imagery shows the frontage; the rink is below street level and cannot be seen from the pavement. |
| Whiteleys | 51.513930, -0.187670 | 51.5142258, -0.1880114 | East pavement just north of Porchester Gardens, looking across Queensway at the long restored frontage. August 2025 imagery supports the view. Stand clear of the crossing and shop entrances. No entry needed. |
| Leinster Gardens | 51.512700, -0.183310 | 51.5126154, -0.1836324 | East pavement just north of Craven Hill Gardens, looking southwest across the road at 23/24. October 2025 imagery shows the white terrace and screening trees/parked vehicles. Do not promise that all small details or the entire facade are unobstructed. |

A suitable final-stop locator is: “Across the road, look for the neighbouring doorways numbered twenty-three and twenty-four, in the white terrace between the hotels.” It locates the reveal before explaining it. Do not ask the visitor to touch doors, enter a forecourt, stand in the junction or look over a wall.

The requested finish address resolves in Google Maps to **Queens Park Premier, Hyde Park, 46 Queensborough Terrace, London W2 3SH**, building point **51.5117939, -0.1851326**. The finish **51.511794, -0.185260** stays outside on its east-side public pavement. This is an address-vicinity identification, not a claim about the owner’s accommodation or permission to enter.

## Literal navigation

Full text and short spoken summaries are in `onwardDirections` in the selected JSON.

### Station approach

From Queensway station’s Queensway-side exit, turn left away from Bayswater Road and continue along the west pavement to QUEENS at 17 Queensway, about 60 metres. An exit onto Bayswater Road requires first turning around the corner onto Queensway. Begin beside the entrance, clear of doors and bus-stop space.

### QUEENS → Whiteleys

Continue north with the shops on the left. Pass Bayswater station and cross the mouth of Moscow Road when clear. At Porchester Gardens use the pedestrian signals **across Queensway first**, then the pedestrian signals **across Porchester Gardens** to the northeast corner. Continue briefly along Queensway and pause clear of the corner, looking across at Whiteleys.

This is a two-stage crossing, not an instruction to walk diagonally across the carriageway. The authored route correction represents the two crossing axes. OSM signal nodes are **7330198938** and **7330165052**.

### Whiteleys → Leinster Gardens

Return a few steps to Porchester Gardens and turn left along its north pavement. Cross Inverness Terrace at the junction when clear. Continue past the mews/forecourt entrances. At Porchester Terrace turn left, use the **uncontrolled refuge** crossing to the opposite pavement, and turn right into Leinster Place. At its end cross Leinster Gardens when clear and turn right onto the **east pavement**.

The walking chapter launches on this straight stretch. Continue straight past the **bollarded pedestrian/cycle opening to Cleveland Square**; watch for people/cyclists joining the pavement. The chapter must finish before the **first** Queen’s Gardens road mouth. There are **two vehicle mouths of Queen’s Gardens** farther along; cross both while narration is silent. Stop on the pavement before the next junction, Craven Hill Gardens.

### Final viewpoint → finish

After the story, cross Leinster Gardens to the pavement beside the white terrace when clear. Turn left, continue past the hotel and turn right into the next westward street, also called Craven Hill Gardens. At Porchester Terrace, cross to its west pavement when clear and turn right. After about 70 metres turn left into the signed **Queensborough Passage**. Continue straight through, alert to access vehicles in its eastern section. Do not turn into Queensborough Mews. At Queensborough Terrace turn left and stay on the same pavement for about 100 metres to number 46.

## Walking chapter geometry and budget

Runtime ID: **bayswater-terraces**, after stop index **1**. The story is about the terrace street setting; imagery supports it on this stretch.

- Launch start **route[40]**, 51.514310, interpolated longitude.
- Latest permitted launch **route[41]**, 51.514200, interpolated longitude.
- Navigation guard **route[43]**, 51.513370, about 7 metres before the **first** Queen’s Gardens road mouth at 51.5133111, -0.1836142.
- Launch window **12.46 m** (about 7.5 seconds at 6 km/h).
- Latest launch → navigation guard **94.04 m**, **56.42 seconds** at 6 km/h.
- Entire audio cap **40 seconds**, leaving **16.42 seconds** before the guard, above the current 15-second reserve. Measure the actual rendered file, including any appended navigation; word count is not validation.

The small Cleveland Square opening is blocked to motor vehicles by bollards and crosses a continuous pavement, as seen in April 2022 imagery. It is a cycle/pedestrian join, not an absent junction: keep awareness and continue straight. This normal street attention requirement is disclosed. The launch window is relatively short; a missed automatic chapter remains recoverable by manual play while stopped. No retracing is needed.

### Rejected window and corrected guard

Porchester Gardens initially looked promising, but its north pavement crosses **Porchester Gardens Mews** and a forecourt drive. It was rejected for this clip. An early Leinster guard mistakenly used the second Queen’s Gardens mouth; the topology audit caught this before freezing. The final guard uses the first mouth. Do not restore the older latitude 51.51320 guard or the older 105.36 m budget.

## Queensborough Passage access evidence

The route uses an ordinary public connection, not a speculative hotel/estate shortcut:

- [Westminster’s 2019–20 infrastructure funding statement](https://www.westminster.gov.uk/media/document/infrastructure-funding-statement-2019-2020) records highway/public-realm work at Queensborough Passage and Queensborough Terrace.
- [Westminster’s published traffic-management drawing](https://www.westminster.gov.uk/sites/default/files/queensborough_terrace_da.pdf), signed 20 October 2017, depicts the passage/terrace connection. It is historical layout evidence, not a current clearance.
- OSM way **4779908** identifies the eastern passage as a lit residential road, with no separate pavement. The western connector is a public footway. No access restriction or gate is mapped on the selected through-line.
- **July 2025** Google imagery shows the signed, ungated eastern mouth off Porchester Terrace; **February 2022** imagery shows the open western path and public pavement at Queensborough Terrace.
- A [May 2025 visit report](https://www.ianvisits.co.uk/articles/londons-alleys-queensborough-passage-w2-80588/) corroborates the through-passage as used publicly. This supplements the council/map/layout evidence; it is not permission to enter adjacent mews.

Keep this passage silent and watch for vehicles. No evidence of a nightly gate was found; today’s unexpected temporary obstruction remains unverified. If blocked, the ordinary-street fallback is north along Porchester Terrace, left into Porchester Gardens, then left down Queensborough Terrace, adding several minutes. Do not climb a barrier or cut through an estate.

## Dated imagery register

Google imagery was inspected in the browser; images are not copied into the repository. Camera coordinates are evidence locations, not visitor standing coordinates. Each link opens the recorded panorama.

| Subject | Capture | Camera coordinate | Panorama / observation |
|---|---|---|---|
| QUEENS parade / frontage | Sep 2024 | 51.5110096, -0.1871653 | [GUqRXqn3wQbX5231ICL_9Q](https://www.google.com/maps/@?api=1&map_action=pano&pano=GUqRXqn3wQbX5231ICL_9Q&heading=245): west-side parade, entrance/doorways, paved footway. |
| Southern approach | Sep 2024 | 51.5107434, -0.1870884 | [xpwMzBVdrjghPF1v7FTG7g](https://www.google.com/maps/@?api=1&map_action=pano&pano=xpwMzBVdrjghPF1v7FTG7g&heading=295): public west pavement and bus-stop furniture. |
| Whiteleys corner | Aug 2025 | 51.5138487, -0.1877460 | [rrZT4dTOHTndm4qTfKphmA](https://www.google.com/maps/@?api=1&map_action=pano&pano=rrZT4dTOHTndm4qTfKphmA&heading=345): long frontage and opposite pavement. |
| Inverness / Porchester junction | Jul 2024 | 51.5138901, -0.1867891 | [1v_Qcb9tBhdWfkEPAWXWLQ](https://www.google.com/maps/@?api=1&map_action=pano&pano=1v_Qcb9tBhdWfkEPAWXWLQ&heading=80): north footway and junction layout. |
| Porchester Gardens | Feb 2022 | 51.5139342, -0.1860817 | [bX8CElULpxZV4F06aaAN5g](https://www.google.com/maps/@?api=1&map_action=pano&pano=bX8CElULpxZV4F06aaAN5g&heading=80): mews/forecourt entrances break proposed window. |
| Leinster corridor | Apr 2022 | 51.5142052, -0.1838853 | [1c29p9lfchJJw9VuJ1bHiw](https://www.google.com/maps/@?api=1&map_action=pano&pano=1c29p9lfchJJw9VuJ1bHiw&heading=170): terraces, public pavement. |
| Cleveland Square opening | Apr 2022 | 51.5138645, -0.1837909 | [KNVYZlMiW5NPXTrLVV9Fhg](https://www.google.com/maps/@?api=1&map_action=pano&pano=KNVYZlMiW5NPXTrLVV9Fhg&heading=85): continuous pavement, bollards, cycle join. |
| Actual 23/24 fronts | Oct 2025 | 51.5126701, -0.1833663 | [OLGrZZFkF2rKRoEd-rdUXA](https://www.google.com/maps/@?api=1&map_action=pano&pano=OLGrZZFkF2rKRoEd-rdUXA&heading=265): façade opposite Craven Hill Gardens, trees/parked vehicles partly screen. |
| Passage east entrance | Jul 2025 | 51.5128764, -0.1844900 | [8q6u_W_Upo7-h6Em-a4ukA](https://www.google.com/maps/@?api=1&map_action=pano&pano=8q6u_W_Upo7-h6Em-a4ukA&heading=240): signed open mouth. |
| Passage west exit | Feb 2022 | 51.5126522, -0.1855275 | [2CKm7EDFZdaGZCGePpTdiw](https://www.google.com/maps/@?api=1&map_action=pano&pano=2CKm7EDFZdaGZCGePpTdiw&heading=80): open footway between buildings, no gate visible. |

Two initially returned user-contributed panoramas were rejected: a 2019 QUEENS listing panorama with unreliable heading and a 2017 indoor panorama incorrectly offered near the passage. Neither establishes route access.

## Sources and present-day limits

Routing: [Valhalla public pedestrian service](https://valhalla1.openstreetmap.de/), requested 21 September 2026, costing pedestrian at 4.5 km/h. Raw requests/responses are in this folder. Geometry uses [OpenStreetMap contributors / ODbL](https://www.openstreetmap.org/copyright). OSM map data was retrieved on the same date for bbox -0.195,51.509,-0.180,51.5175; selected raw elements are in `route-osm-evidence.json`.

[Westminster’s Queensway North decision](https://westminster.moderngov.co.uk/ieDecisionDetails.aspx?Id=3122) approved implementation on 2 January 2026, effective 10 January, north of Porchester Gardens. [The consultation report](https://www.westminster.gov.uk/sites/default/files/media/documents/cabinet-member-report-queensway-north-public-realm-improvements-appendix-c-consultation-report-final.pdf) distinguishes earlier southern works from the northern scheme. No current all-clear is inferred. The selected Whiteleys viewpoint stays close to the southern corner and the tour does not continue through its northern frontage.

No extra owner reconnaissance is requested. Ordinary use can reveal a recoverable obstruction or missed automatic chapter. The engineer must still validate the final indices, immutable source/audio agreement and actual walking-clip duration. This route research does not certify those build results.
