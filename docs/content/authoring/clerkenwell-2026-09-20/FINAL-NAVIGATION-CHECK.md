# Final navigation check — Clerkenwell

Checked 20 September 2026 after [ROUTE-RESEARCH.md](ROUTE-RESEARCH.md) and the selected geometry were complete. Scope: actual `content/clerkenwell/plan.json` visitor instructions, `content/clerkenwell/stories.json` directions and the final spoken navigation paragraphs. Content files were read only.

**Result: no directional mismatch found in the checked versions.** This is a desk consistency check, not a claim of current field access or acoustic quietness.

## Geometry and indices

- All **333 plan vertices** exactly match the selected Farringdon approach followed by the selected tour, without repeating their shared endpoint.
- Both selected-file SHA-256 values retained in the plan match the actual files.
- All **eight visitor candidate positions** match the research record. Stop indices correctly add **61** to tour-only indices: **61, 92, 139, 150, 191, 246, 278, 332**.
- Chapter indices correctly add 61: **many-hands 199–204, navigation 220**; **next-days-stock 294–298, navigation 315**.
- At the reported measured George PCM durations of **65.8 / 64.775 seconds**, latest-launch reserves at 6 km/h are **15.31 / 40.91 seconds**. The Close clip's ceiling for a 15-second reserve is approximately **66.11 seconds**; final encoded duration should remain within it. This check does not substitute for the packaging duration/decode check.

## Directions checked against the selected route

| Section | Result |
| --- | --- |
| Farringdon → Charterhouse | Cowcross Street → St John Street/Charterhouse Street → public western square edge → north frontage. Start-at-Charterhouse instruction is present. Private Mews passage and university campus are excluded. |
| Charterhouse → Smithfield | Returns along the square's western edge and Charterhouse Street to the northern market view. No museum construction circuit or interior access is implied. |
| Smithfield → Booth reliefs | North on St John Street/St John's Lane, left/west into Briset, right/north into Britton. Opposite/east-pavement view of No 25 agrees with the facade orientation; foliage limit remains explicit. |
| Booth reliefs → Gate | Retraces to Briset, turns east and approaches the Gate from the south. Standing to one side of the apron is consistent with the candidate view. |
| Gate → Green | Through the arch, west by St John's Square/Path, north on Britton, west along Clerkenwell Road's southern pavement to the Old Sessions signals, then around to the Green. Corrected signal crossing is retained. |
| Green → Woodbridge | Close follows the outside of the churchyard; the Three Kings branch is left while the selected route follows the Close's rightward bend. Right into Sans, right into Woodbridge, continuing past the Sekforde junction to the chapel. The provider's tiny Scotswood/Sans corner movements do not represent an intended detour down Scotswood Street. |
| Close obstruction fallback | Green east/northeast to Sekforde at Aylesbury, left/north on Sekforde, right into Woodbridge. Uses public street pavements, skips the walking chapter, and keeps manual chapel playback available. It does not substitute the compact router's Hayward's Place shortcut. |
| Woodbridge → Ingersoll | Northwest back to Sekforde, north to St John Street; use signals to the opposite/east pavement, then south a short distance. This agrees with the selected route's crossing approach and view back towards the western frontage. |
| Ingersoll → Exmouth | Complete St John Street and Skinner signal crossings before taking Skinner's north pavement west. Cross Rosoman at the mapped zebra, **right for a few steps, then left into Exmouth**. Continue southwest to the church/Spafield area opposite the green Exmouth Arms. This corrects the earlier tempting but wrong shorthand “turn left into Rosoman”. |
| Finish and station returns | End-tour action is explicit. Farringdon via Vineyard Walk/Farringdon Road and Angel via Rosoman/Rosebery/St John Street agree with the measured public routes and are additional to the narrated outing. |

The two walking transcripts do not depend on a transient view or introduce a conflicting turn. “Many hands” uses neighbourhood context; “Next day's stock” refers back to the chapel while heading towards Exmouth. Skinner's bus traffic is stated in the written directions; two acoustically quiet corridors are not claimed.

Space EC1's No 25 and GAIL's 33–35 appear in the current stories with the parent researcher's source references. This navigation check did not independently repeat that business-address research. Neither business is made a required interior visit, and the reclaimed fountain is distinguished from the removed original lamp.

## Checked file versions

- `content/clerkenwell/plan.json`: SHA-256 `28c1f3758e8d8010ef0ba03bf77e85fe4bb8724404ccd32242b8a3bf580b49a2`
- `content/clerkenwell/stories.json`: SHA-256 `e56e49d924dc71fdbd5e1de9dc6a80ca28f2eaad4dd870d8adb7dc4c8b6fb64e`

The check applies to these versions. Current works, street furniture, queues and external opening remain the ordinary-use limitations recorded in the route research; no full-route field certification is implied.
