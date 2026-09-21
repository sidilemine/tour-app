# Known issues and follow-ups

Updated 21 September 2026. Read this alongside the [roadmap](../ROADMAP.md) before relevant work. The technical lead maintains it. This is a short index of material defects, unresolved questions and deliberate deferrals, initially consolidated from recent M2 work; it is not an exhaustive audit of every historical record. Detailed evidence stays in the linked records.

## How an issue is handled

1. Record the observed symptom and affected build/content, separately from a suspected cause. Give it an ID and a clear status: open, implemented awaiting a specific check, fixed with evidence, monitoring, or deferred.
2. Fix a shared cause where practical. For a repeatable logic/storage failure, keep a focused automated regression or replay that catches the original failure. For a visual/native issue, retain a reproducible example and the smallest useful inspection. Passing unrelated tests is not evidence for that issue.
3. Record what was actually checked, the fix/commit, and any remaining limit. A desk success does not explain an earlier unexplained field failure.
4. If postponing, state the fallback and the event or milestone that makes it worth revisiting. “Later” alone is insufficient. No physical test is implied by an open row.
5. Before a relevant implementation, new-area handoff or milestone review, revisit applicable entries and carry their constraints into the responsible agent's brief. Before finishing, update changed statuses and links. Do not repeatedly add the same issue or close it merely because code was committed.

Fix problems blocking ordinary use, saved data, privacy or usable physical directions before the affected use. Prefer normal-use reports, automation and existing evidence for the rest, under the [personal testing policy](../AGENTS.md#testing-policy-for-the-personal-prototype). Minor drafting corrections need no separate ticket. Editorial preferences and general craft lessons belong in the [editorial record](content/EDITORIAL-REVIEW-RECORD.md) and maintained briefs; they do not automatically commission rewrites of installed tours.

## Current index

| ID | Issue / question | Status | Next action or revisit trigger |
| --- | --- | --- | --- |
| MAP-001 | New-area map opened away from its tour | Fixed; representative phone evidence | Preserve route-based opening; inspect the actual view when camera behavior or materially different route extent changes |
| AUDIO-001 | Poor EarFun field capture / Spotify not stopping | Monitoring; cause unconfirmed | Investigate if it recurs in ordinary use or an audio-routing dependency changes |
| WALK-001 | Natural automatic walking-chapter launches not established | Open evidence question; manual fallback works | Use the next ordinary outing report, then diagnose only an affected launch if needed; revisit at M2 closure |
| ROUTE-001 | Confusing Moss Hall Crescent approach in Finchley B | Known instruction issue; existing package unchanged | Correct and verify before reusing that instruction or issuing a relevant revised package |
| MAINT-001 | Expo patch updates recommended by compatibility check | Deferred maintenance | Review when scheduling SDK/native maintenance or when a relevant bug makes an update useful |

### MAP-001 — opening map omitted the route

**Observed:** Highgate/Hampstead source `03d87e38b7e80ca8`, extract-centre view at zoom 15.5: map rendered, but the route was off-screen. The retained Highgate package is the reproduction input.

**Fix:** shared authored-map code uses route bounds with padding, permitting zoom 13 for the overview; no special Highgate camera coordinates. Commit `ec04275`, installed source `1bd3e861342b27e4`. This is inherited by future authored tours using that component.

**Evidence / limit:** actual offline opening showed the complete Highgate route and five markers, and retained Finchley A's route/five markers. [Device result](test-results/M2-hampstead-tour.md#connected-session-correction). The 161-test suite passed but contains **no dedicated camera-opening regression test**; it would not itself detect a return to the old view. A native frame-complete event is not proof of usable orientation.

**Recurrence safeguard:** on a relevant camera or route-extent change, inspect the opening screenshot for route, stop markers and start/finish in view, with readable detail on zooming. Reuse previous evidence when this boundary is unchanged. If this logic becomes more complex or is refactored, add a focused automated check against the displaced-route example; a calculation test still would not establish actual native drawing. No new phone session is requested now.

### AUDIO-001 — headset field failure remains unexplained

Sidi reported poor headset capture and Spotify continuing during the 18 September outing. The [20 September EarFun check](test-results/M2-clerkenwell-phone-handoff.md#earfun-recording-and-spotify) produced clear audio, stopped Spotify and restored normal output. That supports ordinary use but does not establish the original failure's cause or a newly demonstrated fix.

Fallback: phone microphone near the mouth or a written note. If it recurs, keep the original recording, note the selected input and whether Spotify stopped, then inspect the affected native route/focus behavior. No precautionary repeat walk or exhaustive headset matrix.

### WALK-001 — manual completion is not an automatic-launch pass

Tour B's walking chapter reportedly needed manual start; the available field record does not establish the cause. Review-close continuation subsequently passed, and prepared-tour replays cover arrivals, holds, missed windows and measured timing. [M2 evidence review](test-results/M2-closure-review-2026-09-20.md), [current Highgate limits](test-results/M2-hampstead-tour.md#ordinary-use-limits).

Use normal Highgate/Clerkenwell feedback about whether the passages started naturally. Manual Play remains available; do not retrace or repeat a whole walk to collect a pass. A reported miss should lead to a specific diagnosis and, only if needed, a short affected-segment check. Do not silently attribute all earlier misses to the old review hold.

### ROUTE-001 — approach directions need the actual pedestrian layout

The reported Alexandra Grove → Moss Hall Crescent turn was confusing because the useful approach continues to Ballards Lane. [Owner report and general lesson](content/EDITORIAL-REVIEW-RECORD.md#13-explain-who-acted-and-check-directions-from-the-actual-approach), [remaining route scope](test-results/M2-closure-review-2026-09-20.md#practical-blockers-limitations-and-decisions).

The installed Finchley package has not been rewritten. Sidi asked for general learning, not a polishing backlog. Before reusing this instruction, verify the approach with map/imagery and prepare a versioned correction. The existing map is a fallback, not evidence that the wording is correct. Later route briefs/reviews must examine crossings and parallel streets explicitly; do not infer a pedestrian turn from a road name or provider maneuver alone.

### MAINT-001 — recommended dependency patches

The compatibility check recommended newer Expo patches; the tested stack remains pinned. [M1 closure](test-results/M1-closure.md) and [current build scope](test-results/M2-hampstead-tour.md#automated-and-desk-evidence) retain that limitation. Do not describe the recommendation as a clean current compatibility pass or casually upgrade during tour preparation.

At relevant maintenance, inspect official compatibility guidance, the version-guarded audio patches and affected behavior. Run appropriate automated/build checks and only the device observations warranted by the actual changes. This is not authorization to upgrade now or repeat M1 wholesale.
