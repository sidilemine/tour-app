# Arrival accuracy and stop calibration

Research reviewed 13 September 2026 against source commit `e0b52d7`, installed `expo-location` 57.0.17 and the two recent completed walks. This is research and a proposed experiment: no phone build, recorded point, threshold or acceptance status changed. M1 remains **implemented; awaiting physical test**.

The present active-location approach is reasonable for an offline walking player. The simplest next improvement is better stop capture and verification, followed by measured, stop-specific arrival tuning. There is no evidence yet that we need another location SDK or a sophisticated navigation engine.

Follow-up, 14 September: [new pause-walk evidence](test-results/M1-four-pause-walks.md) shows B already recognised but unable to play promptly after a stationary wait because its last fix became stale. The [subsequent stationary-delivery correction](test-results/M1-stationary-location.md) takes priority over the capture/radius experiment below. This is separate from physical pin accuracy; the linked record distinguishes implementation and device evidence.

Follow-up, 15 September: [the detour comparison](test-results/M1-three-baselines-and-detour.md) confirms a separate **route-shape error**. Repeated normal traces lie around 100 m from sparse fixture chords; a detour remains falsely off-route for about 62 seconds after rejoining those traces. Fresh fixes arrive normally. Correct the path geometry before changing corridor/arrival radii; the private candidate preserves every standing coordinate and remains unverified/uninstalled. This does not establish new stop calibration.

## Three different sources of discrepancy

1. **The recorded target.** In [App.tsx](../App.tsx), Capture stop saves one latest fix, accepting an age up to 15 seconds and reported accuracy up to 35 m. The recorder asks the user to stop, but does not collect a stationary sample set or preserve capture age, accuracy and spread with the stop. At an illustrative 1.4 m/s, a 15-second-old moving fix could be 21 m behind the walker. That is a permitted failure mode, not a finding that this happened when Sidi recorded B.
2. **The current position.** Android's horizontal accuracy is an estimated radius at the 68th percentile, not a hard error bound. It says nothing about the correctness of our previously saved target. A reported 5 m accuracy therefore does not prove the walker is within 5 m of the true stored-site position. See [Android Location.getAccuracy](https://developer.android.com/reference/android/location/Location#getAccuracy()).
3. **The intended trigger area and delay.** Our [engine](../src/domain/engine.ts) permits entry within 30 m, then requires at least three usable fixes spanning four seconds, the known-leg corridor and no detected reversal. Exit is 40 m. This persistence rule does not require standing still. On an ideal straight approach at 1.4 m/s, four seconds of walking from the boundary would produce a trigger roughly 24 m before the pin. That is an illustration of policy, not measured ground truth.

Calibration should mean verifying a particular visitor standing area and its approach. We should not apply a permanent global GPS offset derived from one visit, or move a landmark coordinate to make a trigger appear correct. Phone readings, stored geometry and the physical reference must remain distinguishable.

## What the saved walks establish

The [field review](test-results/M1-two-more-walks.md) contains the original observations and source-export checksums. Both walks used the same three-stop fixture and phone build. Distances below are between reported GPS and the stored standing coordinate; they are not surveyed physical distances.

| Stop / run | Distance at automatic arrival | Reported accuracy at arrival | Closest recorded usable fix during entire run |
|---|---:|---:|---:|
| B / first | 25.011 m | 4.849 m | 6.584 m |
| B / second | 25.602 m | 4.685 m | 7.141 m |
| C / first | 21.231 m | 5.813 m | 2.694 m |
| C / second | 23.582 m | 4.447 m | 4.675 m |

These arrival distances fit the broad lab rule. They do not isolate whether Sidi's remembered physical arrival discrepancy came from recording error, current GPS error, physical reference or a combination.

**A blanket 5 m radius would fail on these recorded inputs.** Neither run contains even one usable fix within 5 m of B. Each contains only two within 5 m of C, insufficient for our three-fix rule. Both runs have five fixes within 10 m of B and six within 10 m of C, but counts alone do not establish a viable 10 m setting: continuity, dwell, route eligibility and physical timing still matter. Changing request settings could change future samples, so this is a bound on the saved inputs, not a prediction of all future walks.

Method: examined every `fix` transition from Start to End in the private isolated `run-19.json` and `run-22.json`, including fixes after actual playback. Kept reported accuracy 0–35 m and age −2 to 15 seconds; computed distance using the production helper. This deliberately generous geometric screen does not apply speed, reversal, route or persistence gates. Failure to enter under this screen rules out entry with those extra gates; success does not prove arrival. No coordinates or raw traces are included here.

Automated verification: production replay reproduced all 284 and 295 transitions respectively, one segment each. An independent Python distance calculation agreed with the TypeScript helper to the displayed millimetre rounding. That precision identifies the calculation, not GPS precision. This was not an alternative-radius player replay or a new physical test.

B's second playback coincided with unlocking. GPS was arriving before the screen woke and the qualifying fixes completed during unlocking. These logs cannot prove whether playback would have begun without the wake. Keep that lifecycle question separate from coordinate calibration and retain the locked-screen test.

## Established approaches and tempting shortcuts

| Approach | Evidence and implication for this app |
|---|---|
| Collect several stationary readings for a stop | [ArcGIS Field Maps](https://doc.arcgis.com/en/field-maps/android/use-maps/configure-field-maps.htm) supports a required number of GPS positions averaged into a point, separately from streaming a path. This is a useful existing workflow to adapt. It does not establish how much a Pixel 6 will improve; repeat visits must measure that. |
| Change Expo High to Highest / BestForNavigation | Inspected installed Android `LocationHelpers.kt`: all three map to `PRIORITY_HIGH_ACCURACY`. Explicit time/distance settings override their different defaults. Our live request supplies 2 s / 2 m; recording supplies 2 s / 3 m. An enum-only switch produces the same continuous Android request here. This is specific to 57.0.17, not a claim about iOS or every future SDK. See the [Expo API](https://docs.expo.dev/versions/v57.0.0/sdk/location/). |
| Use Android's built-in geofence API | Google's [geofencing guidance](https://developer.android.com/develop/sensors-and-location/location/geofencing?hl=en) recommends roughly 100–150 m minimum zones, describes background latency measured in minutes, and warns about unreliable alerts without data/network location. That low-power API is not a drop-in replacement for our active offline near-stop matcher. Its radius recommendation is not a requirement to enlarge our 30 m zone. |
| Request faster or fresher locations | Google's [LocationRequest.Builder](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest.Builder) distinguishes desired interval, minimum displacement and initial accuracy waiting. An interval is not a delivery guarantee. A stationary capture phase should remove the displacement threshold and reject pre-capture fixes; it need not increase whole-tour sampling or modify native code. |
| Snap to a path or add complex filtering | Our matcher already uses the eligible leg. The [Newson–Krumm map-matching research](https://www.microsoft.com/research/publication/hidden-markov-map-matching-noise-sparseness/) shows a more elaborate temporal/network approach, evaluated with vehicle data. It is not proof of a simple walking fix. First verify route bends and standing geometry; snapping to an incorrect or parallel path can conceal error. |

Our engineering assessment: averaging or a robust centre may reduce scattered readings, but closely spaced samples can share a bias. A tight cluster is not verified physical accuracy; do not divide reported uncertainty by the square root of the sample count and present that as a guarantee. Smoothing moving positions can also introduce lag. Neither averaging nor filtering repairs an incorrectly chosen viewpoint or unsafe approach.

The current fixture has ten route points. Frequent off-route labels deserve geometry review: projection is limited to the eligible leg, and distance to a clamped leg endpoint can equal distance to the stop. Those labels alone do not prove the walker took the wrong path.

## Proposed small experiment after the current phone tests

1. **Improve capture first.** Add an explicit stationary capture phase. Trial 20–30 seconds with at least ten distinct fresh readings, a 1–2 second request interval and zero minimum displacement. Trial a 10 m reported-accuracy gate and reject fixes older than three seconds or preceding capture start. These are experiment settings, not approved product constants or guaranteed achievable precision. Time out visibly if insufficient; offer retry/manual review rather than silently accepting a bad fix.
2. **Preserve provenance.** Save capture timing, sample count, age/accuracy summaries, spread and method with the candidate point. Keep raw samples private and opt-in. Show the candidate for review, preserve the original fixture/version, and record separate standing/approach/viewpoint/access verification. Consider relabelling the current `GPS ±… m` display as an estimate so it is not read as a guaranteed bound.
3. **Verify independently.** Compare a second stationary capture on a different visit at the same identifiable physical spot, plus the intended walking approach and map geometry. Do not average an ordinary moving trace into a new stop or declare a map pin surveyed ground truth. This is future calibration work, not an extra task for tomorrow's pause walks.
4. **Then compare arrival policies.** Run deterministic sensitivity/replay experiments for 10, 15, 20 and 30 m entry zones on versioned verified geometry, retaining larger exit zones, fresh fixes, persistence, deduplication and manual holds. Include noisy/stale fixes, passing nearby on a parallel path, approaching from the wrong side, missed arrival and leaving a pending stop. Select physical tests from those results rather than choosing a universal radius now.
5. **Measure the experience.** For repeated locked approaches, record actual entry into the agreed physical standing area, audible start, early/late distance estimates, wait time, missed/duplicate arrivals and manual fallback. Separate request latency, location delivery and audible onset. Repeat with offline conditions recorded. Success means useful, repeatable narration placement without missed or wrong-path triggers; existing M1 criteria remain required.

For the curated walking player, a broad approach zone may prepare a cue while narration requiring a particular viewpoint waits for an appropriate verified area or deliberate manual playback. A polygon or route interval can express that area better than a circle, but cannot improve the GPS measurement itself. Choose per-stop timing with the content; do not expand M1 into navigation or promise exact-position automatic speech everywhere.

## Decision and verification record

Recommendation: retain the installed build for the current acceptance tests; prioritize stationary capture/provenance and physical geometry review before radius tuning. Defer a new SDK, probabilistic matcher and adaptive-radius scheme until measured failures justify them. In particular, automatically expanding a zone when accuracy worsens trades missed arrivals for earlier or wrong-path arrivals; it is not a free accuracy improvement.

No new device result, calibration improvement or final radius is claimed. Research involved official documentation, pinned native-source inspection and local analysis/replay only. Documentation links, guide parity and diff are checked for this change; no runtime code changed, so no APK rebuild is required. Private traces remain local and ignored. The [phone checklist](PHONE-CHECKS.md) and full [M1 gate](../ROADMAP.md) remain in force.
