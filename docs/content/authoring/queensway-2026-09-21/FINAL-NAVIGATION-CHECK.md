# Final navigation check — Queensway

21 September 2026. Route agent review of the actual assembled package inputs, against [route-selected.json](route-selected.json) and [ROUTE-RESEARCH.md](ROUTE-RESEARCH.md).

**Result: navigation is ready for package/build. No route blocker found.** The small introduction correction below is applied; it does not affect spoken audio or geometry. This is a desk review, not field validation or a current works clearance.

## Inputs reviewed

| Input | SHA-256 |
|---|---|
| `content/queensway/plan.json` | `8486487a1ecdb659b052e1a255367eb9b2b50fdda692f9d832df46667d33b6f6` |
| `content/queensway/stories.json` | `60482b5b442fcdbd7c025030cf59daed495f4f6f13733c4c37cf349fc40f72c8` |
| `route-selected.json` | `eb6513e1291a6531ce8fa37c22f32538c458c4bbf7151e46eb03d784b38bfb21` |

Direct comparison passed: plan geometry equals the frozen route, the recorded authoring SHA matches, stop/story IDs agree, and all three standing coordinates are their assigned route vertices. All `route-*.json` files parse. No app tests or phone checks were performed by this reviewer.

## Checked behavior and wording

- **Start:** actual welcome belongs beside QUEENS at 17 Queensway. Plan introduction correctly says Start plays immediately there; the station approach is about one minute, on the station/venue side. No rink visibility or basement entry is promised.
- **Stop 0 → stop 1:** northward departure with the shops on the left agrees with the west-pavement start. Detailed directions include Moscow Road and the two pedestrian-signal stages, across Queensway then across Porchester Gardens. Whiteleys standing point is on the east pavement beyond the corner, looking across the road at the frontage.
- **Stop 1 → stop 2:** quiet detailed navigation covers Porchester Gardens, the Inverness junction, mews/forecourt entrances, Porchester Terrace refuge and Leinster Place. The turn into Leinster Gardens explicitly puts the walker on the east pavement. The chapter directions disclose the bollarded Cleveland Square pedestrian/cycle opening and say continue straight, watching for joining cyclists.
- **Queen’s Gardens:** the corrected guard precedes the first mouth. Detailed stop directions identify **two** mouths to cross after the chapter; the old second-mouth guard is absent from the plan.
- **Final stop:** actual 23/24 façade location and public east-pavement standing point agree. The opening locator points across the road to the numbered doorways before the reveal. The route does not use the erroneous initial discovery pin, a private forecourt or the rear railway-wall view. Trees/vehicles are disclosed as possible visual screening.
- **Return:** cross back to the west pavement after the final story, then use the southern Craven Hill Gardens branch, Porchester Terrace and Queensborough Passage. The passage is the reviewed through-connection; adjoining Queensborough Mews is explicitly excluded. Its eastern shared vehicle section is disclosed. Left at the passage exit, about 100 metres on the same pavement to the public finish near number 46, agrees with geometry.
- **End:** the plan distinguishes the last narrated stop from the following five-minute mapped return, and gives an ordinary-street fallback for an unexpected passage closure. No interior, park-gate or hotel-entry dependency is introduced.

## Walking audio budget

`bayswater-terraces`, after stop index 1:

- Start index **40**, latest launch **41**, navigation guard **43**.
- **94.04 m / 56.42 seconds at 6 km/h** from latest launch to guard.
- Configured cap **40 seconds**, leaving **16.42 seconds**, above the required 15-second reserve.
- Root reports the actual final George file is **30.5 seconds**: this gives **25.92 seconds** at the latest launch. The reviewer has not independently measured the file; root subsequently reports package/media decode and latest-launch budget validation passed.
- Launch window is **12.46 m**, around 7.5 seconds at the fast pace. A missed automatic launch remains possible with sparse/noisy fixes and has a stopped manual-play fallback. This review does not establish natural automatic triggering on the street.

The final transcript fits the observed terrace setting. It does not require identifying a specific residence as converted flats, looking across traffic while walking, or taking a turn during the clip.

## Final wording correction — resolved

The initial review caught **“Everything uses public pavements”**, inconsistent with Queensborough Passage’s eastern section having no separate footway. Root changed this to **“The route uses public streets and passageways”** before packaging. The corrected introduction was re-read and the final plan hash above updated; spoken transcripts and route geometry are unchanged.

## Accepted limits

Street imagery is dated 2022–2025; current works, evening lighting/legibility, crowding, temporary barriers and parked vehicles are not observed. The north Queensway works approval remains noted. The route is a modest public-street demo with normal attention to crossings/cycle joins, not a traffic-free walk. Approximate authored crossing/standing connectors are clearly distinguished from raw provider geometry. Ordinary owner use and targeted reports can resolve recoverable issues without a separate reconnaissance outing.
