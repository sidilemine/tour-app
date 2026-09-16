# M2 offline map: outdoor regression review

16 September 2026. **The first offline-map slice passes its targeted regression on the recorded Pixel 6 / Android 17 configuration, using the combined evidence below. No repeat outing is requested.** The planned 60-second stationary wait at C was not performed and is not reported as a new pass. This closes the map experiment, not the six-stop M2 product.

## Build, route and observations

Development source **`a7c69f00e14e185a`**, guide **7**, standard short clips, existing corrected route version 2. All A/B/C positions and route geometry are unchanged; this does not upgrade their access or viewpoint verification. The [preparation record](M2-offline-map.md#outdoor-preparation--16-september) covers checked assets, stopped Metro, disabled Fast Refresh and a separate guide attempt. Start → End was **12:16:18.143–12:24:03.211 BST**, about **7 minutes 45 seconds**.

Sidi reports the location was “spot on”, confirms the other requested observations, and explicitly says the 60-second wait was forgotten. The map position agreed at A/B, B played automatically after the requested locked silence, C played on Resume, and the position dot disappeared after End. Sidi separately confirms **airplane mode**. Audio output was not recorded. These owner observations supply audibility, physical position and locking; background lifecycle events alone cannot prove those facts.

## Recorded behavior

| Observation | Evidence |
| --- | --- |
| A, B and C | Exactly three play requests in order; all three clips completed once. A followed Start, B followed `arrival-confirmed`, C followed one explicit Resume. No manual Play or Skip substitution |
| Silence before B | **227.141 s** from A completion to B's native playing status; **223.920 s** continuously backgrounded before that status, with no intervening foreground event |
| Automatic B | Native playing **0.442 s** after the automatic request; Sidi reports normal arrival. Request latency is not a surveyed physical-arrival delay |
| Manual hold | **197.202 s** from Pause after B to Resume at C; no play effects during that interval |
| C arrival while held | First recognised C arrival **19.920 s** before Resume. This is GPS arrival-zone recognition, not proof of physical stationary duration |
| Resume at C | Native C playing **0.329 s** after one Resume. Latest fix age **1.778 s**; fresh-position gating was preserved |
| Held background location | **90 callbacks**, fix ages **13–231 ms**, reported accuracy **2.9–12.1 m**, maximum callback gap **5.990 s** during the backgrounded held approach/wait |
| Fix rejection | 228 fix events in the walk; one stale fix and two poor-accuracy fixes rejected. No relaxed thresholds or fabricated fresh timestamps |
| Battery | Logged **94% → 93%**, Battery Saver off at Start. Rounded percentages from a short walk do not establish battery endurance |
| Completion | All stops completed, playback idle, tracking stopped and ended hold retained |

The owner's named diagnostic export showed **Saved and verified** in Documents / Walking Tour Tests and was pulled back unchanged. Production replay reproduced **287 new transitions / one segment**; the complete saved export reproduced **962 transitions / five segments**. No error/failure diagnostic appeared in the new walk. Inspected app-scoped native logs contain no fatal exception/ANR marker, and exit history has no termination during the walk; the morning low-memory exit predates preparation. Raw traces, exports, backups and screenshots remain ignored/private.

## Why the omitted minute does not require another outing

The extra wait would specifically recheck fresh location delivery while **both locked and motionless**, ensuring release does not depend on moving again. It would not add another kind of map rendering or automatic-arrival observation.

That behavior already has accepted M1 evidence: a [73.493-second native-confirmed locked stationary window](M1-stationary-location.md#connected-stationary-check--passed-with-limits), successful [held-arrival release retests](M1-pause-retests.md), and the [earbud walk with an explicitly confirmed physical 60-second wait](M1-remote-and-offline-walks.md). Keep each record's network/build/physical-confirmation limits; do not combine them into an invented single test.

Repository comparison from before the map addition through the current source shows **no changes in `src/session`, `src/domain`, `src/storage` or the native audio patch**. The earlier dependency audit also retained the accepted audio/location/Expo versions. Today's prepared-map check separately supplied stationary offline fresh fixes, and this outing supplied long locked silence, live background fixes, preserved pause and successful explicit release with the map dependency installed.

Under the repository's instruction to reuse accepted evidence when the relevant behavior is unchanged, those results are sufficient for this bounded map regression. The additional full-minute repeat is removed from the requested follow-up, while its omission stays explicit in the attempt. Revisit that case if location request cadence/displacement, freshness/hold policy, relevant native dependencies or a new observed failure changes the risk. The existing assertions and freshness thresholds are unchanged.

## Handoff and remaining scope

The self-contained APK is restored without clearing data. It cold-opened silently with Metro absent and airplane mode still enabled, retaining all three completed stops and ended hold. The offline map drew in **0.5 s** with no current-position dot while stopped. Guide observations are saved as **inconclusive for that individual full case**, because it did not repeat the desk checks or perform the planned stationary minute; this does not replace the engineer's combined-evidence assessment above.

Final journal and diagnostic exports both reported **Saved and verified** through the app's named local-save flow. Readback verified **seven completed attempts**, the **six previous attempts unchanged**, exact saved conditions/observations and no active attempt. The attempt retains its development start and self-contained finish contexts; the original development diagnostic export remains the field-build evidence. Every stored transition was unchanged after restoration, and the final export reproduced the same **962 transitions / five segments**. Metro remains stopped; the app is stopped with no remaining app services. Pre-test connectivity is restored: airplane mode off, Wi-Fi and active-subscription mobile data on, Battery Saver off.

No app code, APK contents or test assertion changed during this review. The original automated/build evidence is retained; new work verified exported-data preservation, full/isolated replay, native records, cold handoff, guide parity, local links and whitespace/diff. Precise/private data is excluded from the commit.

The broader M2 package importer, verified six-stop route, directions/cue player and curated content remain outstanding. The [compact North Finchley plan](../content/M2-TEST-PLAN.md) remains the next planning context; no new route survey, full-tour acceptance or M3 duration commitment is inferred from this result.
