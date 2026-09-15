# M1: three development walks and detour review

Historical record: this preserves the build, observations and open cases at the time of this check. M1 completed on 15 September 2026; use the [closure record](M1-closure.md) and [completed checklist](../PHONE-CHECKS.md) for current status.

15 September 2026. **The three consecutive locked-arrival baselines are accepted for the six required quiet-gap arrivals, with the procedural exceptions below explicitly retained. The detour exposed incorrect route geometry. M1 remains implemented; awaiting physical test.** Sidi reports three full walks with Wi-Fi/mobile network off, consistent with expectations, and a detour whose return to the route took roughly a minute to be recognised.

## Preserved evidence

Four exported diagnostic files were copied read-only from phone Documents. Local/phone SHA-256 values match. All identify source `bb0a0e3554c55ed7`, development variant, Pixel 6 / Android 17 and the original standard fixture. The route and standing coordinates are unchanged. Each cumulative export contains the exact preceding export as a prefix. No guide-results export was found for these four attempts; the owner observations come from conversation.

| Export suffix on 2026-09-15 | SHA-256 | Full replay / isolated new run |
|---|---|---|
| `T10-37-14-532Z-q41v7l.json` | `76f3d78aecda406433eea7b4313e05a7fab67e7356a22c69044986302c94984d` | 3,685 / 28 segments; 313 / one |
| `T10-48-02-668Z-q8nimi.json` | `219a32d251d6d068ab19bf250a8e5416c463afef5a8a958e5c9d1e6f381723bc` | 4,032 / 29; 347 / one |
| `T10-59-33-603Z-b8qub0.json` | `55ef3c863f982f93b6e70cadeb7e2fd6fbe282abb9bd80d0ded6ea25f7f9e25e` | 4,348 / 30; 316 / one |
| `T11-17-37-761Z-p1y5sy.json` | `c8bc7211f7b7eb7eb917da8eebafd474d6663a953b5d6a8e545632fc5986b96b` | 4,560 / 31; 212 / one |

All eight full/isolated production replays passed. The private source filenames begin `walking-diagnostics-2026-09-15`; original exports, metrics and candidate scripts remain ignored under `diagnostics/four-walks-2026-09-15/`. Replay does not independently prove audibility, physical position or screen locking. Native exit history has no termination during these walks; its latest exception is the already documented 09:23 developer-menu preparation crash. Native event retention begins at 11:57, so it cannot independently establish the first two walks' lock history.

## Three normal walks

Times are BST. All starts used standard A, all B/C arrivals were automatic and unique, with no manual Play, Pause/Resume, interruption, wrong ordering or audio errors. Low-power mode was false at every Start. Network off is owner-confirmed; unplugged/no-Metro/Fast-Refresh-off preparation is separately recorded in [the handoff](M1-field-preparation.md).

| Run | Start → End | Silence after A → B | Silence after B → C | Battery | Completion |
|---|---|---|---|---|---|
| 1 | 11:28:31 → 11:37:12 | 271.198 s (4:31) | 206.726 s (3:27) | 72% → 71% | A/B/C completed once |
| 2 | 11:38:21 → 11:47:59 | 331.331 s (5:31) | 198.910 s (3:19) | 71% → 69% | A/B/C completed once |
| 3 | 11:49:25 → 11:59:30 | 356.671 s (5:57) | 214.715 s (3:35) | 69% → 68% | A/B complete; C stopped by End |

The 256 / 290 / 260 callbacks had median intervals approximately 2 s and maximum gaps 6.567 / 3.743 / 7.859 s. B/C native playing followed their arrival requests in 0.377–0.438 s. That is software latency, not a surveyed physical-arrival timestamp. These short battery observations are not a long-tour consumption forecast.

Run 1 supports the reported full baseline: app backgrounded before A finished and foregrounded after C completed. Run 2 backgrounded at 11:40:08.662, briefly foregrounded at 11:40:51.479 and backgrounded again at 11:40:52.820. It still has approximately 191 seconds of uninterrupted app-background time before B starts, and over three minutes before C. Sidi confirms briefly unlocking to set a timer. The subsequent uninterrupted locked interval before B exceeds the three-minute minimum; no unlock enabled B or C. This establishes the required quiet-to-arrival interval, not continuous locking from the start of A.

Run 3 stayed app-backgrounded through both arrivals. Retained native events show a brief screen wake with keyguard retained before C; keyguard dismissal comes after C began. C started at 11:59:19.510, app foregrounded at 11:59:25.632, and End was pressed at 11:59:30.041. Its final native offset is 10.557 seconds, `finished=false`, against the approximately 11.737-second asset. This is an explicit End before completion, not a demonstrated automatic cutoff. C remains in-progress in saved tour state. Sidi recalls continuing to the originally recorded C point after C began and then pressing End, and is unsure whether speech had finished. The native record establishes that End preceded completion. All six required locked arrival transitions succeeded; the third recording was stopped by an explicit user action after the final arrival. The repeated-arrival gate is therefore accepted without another full walk. Do not claim three uninterrupted full-clip A/B/C completions: that narrower completion evidence exists for runs 1 and 2, while run 3 retains its in-progress C checkpoint. This acceptance rationale preserves the roadmap’s six-arrival requirement and records the deviation from the guide’s instruction to wait until C finishes.

## Detour: approximately one-minute false off-route status

Start 12:11:33.981; End 12:17:33.670. A completed; B started once at 12:17:27.507 after an arrival request at 12:17:27.186. End stopped B roughly six seconds later. C remained unplayed. The log has **no manual replay, Pause or Resume**, so it establishes route-status behavior and automatic re-entry arrival, not the instructed manual-fallback/held-return substeps. Sidi confirms doing only the leave/rejoin portion. The manual-fallback/held-return substeps remain untested in this case.

GPS was available throughout: 179 callbacks, median interval 1.9995 s, maximum gap 4.311 s, with no stale/poor-accuracy rejection. During the observed return, fix ages were tens to hundreds of milliseconds and reported accuracy approximately 4–5 m. There is no minute-long native delivery gap here.

Comparing with the A→B fix polylines from the three normal walks, the detour is back on their path around **12:16:05** and remains within a few metres. The existing matcher still calls it off-route until **12:17:07**, about **62 seconds later**, consistent with Sidi's physical estimate. At the earlier point, its distance from the *stored fixture's* A→B segment is approximately 103 m; it later crosses the configured 45 m corridor boundary. B arrival follows at 12:17:27 after radius/dwell checks. Nearest prior-trace proximity is supporting evidence, not a surveyed physical rejoin timestamp.

The original fixture contains only ten points, including long straight segments of approximately 160 m and 237 m. It cuts across the curved path represented consistently in the new walks. All three normal walks also acquire false off-route labels, with logged cross-track distances around 102–103 m. The matcher is evaluating the supplied geometry; changing GPS cadence or waiting longer does not repair that geometry. A global radius expansion would conceal the error and weaken real detour detection.

## Local corrected candidate; not installed or physically accepted

A private version-2 candidate was built from the first normal walk, anchored at the exact original A/B/C standing coordinates. The nearest trace anchors were within 1.1 / 3.3 / 1.3 m of those coordinates. The two walking legs were simplified with a 3 m maximum geometric deviation, yielding 19 points and a largest segment of 73.6 m. The other two normal walks and detour were used for comparison. The candidate is explicitly `unverified`; no new safe access or viewpoint is asserted and no stop was moved.

A counterfactual run of the existing reducer against the same recorded input events, using this candidate geometry, gives zero off-route decisions on the three normal walks and 38 on the actual detour, versus 124 on the old detour geometry. Every playback/pause effect and its timestamp stays identical in all four runs. The corrected corridor recognises return at 12:15:35, when the visitor is within 45 m of the walked path; that precedes the estimated physical rejoin by approximately 30 seconds, as a corridor is not the path centreline. This is model evaluation, not new physical evidence or an exact-rejoin guarantee.

Two synthetic-coordinate regression tests capture the straight-chord failure and fresh-fix rejoin without clearing a manual hold. TypeScript, lint and all 77 tests pass. No app/native code, radius, cadence, phone build, route, settings or saved progress was changed during this review. The original and candidate remain separate. Before using the candidate, review the reconstructed path, preserve the original fixture and pair any edge-test copy with the same corrected geometry. Retain the full M1 criteria. Remaining outdoor work is the untouched early-arrival and pass-pending cases, one battery-saver full walk, and the corrected detour including manual replay/paused return. The detour follow-up addresses the observed route-data failure and omitted existing steps; it is not a new test category. No further normal baseline repeat is requested.
