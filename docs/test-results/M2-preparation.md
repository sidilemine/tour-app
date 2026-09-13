# Independent M2 / E1 preparation

13 September 2026. Owner authorized independent development while away and will complete the retained phone checks later. **M1 remains implemented; awaiting physical test.** This record is not a new physical result.

## Delivered

- Actionable [remaining phone checklist](../PHONE-CHECKS.md), linked from the first-walk guide, README and roadmap. A one-time thread reminder was created for 15:15 local time on 13 September, to read the current checklist and mention only open cases.
- Node/TypeScript local package preflight, CLI and ten failure-path/contract tests using the existing dependencies.
- Six-stop Finchley editorial manifest: eight primary sources, nine claims with supporting passages/uncertainty and six original short scripts. Public geocoding provenance is separate from private traces. All visitor positions remain unverified.
- Two contrasting supervised briefs, candidate selections and three original listening samples each. Local Daniel voice rendered six private AIFF samples; no paid TTS or external model request.
- Official-documentation comparison and a bounded MapLibre offline-map experiment recommendation. No map package/provider selected or installed.

## Automated results

| Check | Actual result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | 48 passed, 0 failed: 38 existing lifecycle/replay/storage tests plus 10 package tests |
| `EXPO_OFFLINE=1 npx expo install --check` | Reports dependencies up to date; Expo warns offline validation is unreliable, so this is not a fresh online compatibility proof |
| Draft CLI | Valid draft accepted, `ready: false`, 48 explicit blockers |
| Same CLI with `--ready` | Expected rejection, exit 1 |
| Asset failure paths | Altered checksum, missing/truncated files, symlink components, traversal/encoded paths, duplicates and broken references rejected |
| Metadata/geometry failure paths | False readiness, unsupported schema, absent reviewer/date, invalid bounds/legs/directions and missed visitor positions rejected |
| Local listening renderer | Six outputs created; `afinfo` recognized all six with positive durations and nonempty audio data |

Measured sample durations: design school 25.47 s, water 23.08 s, garden 21.11 s; people church 26.25 s, house 22.50 s, Spike 19.46 s. These are local desk-listening files under ignored `artifacts/listening-drafts/`; generated files are reproducible from committed scripts. File-format checks do not establish audible quality, pronunciation or enjoyment.

No app/runtime source, native config or dependency versions changed. Android builds/device tests were not rerun for these separate Node/content changes. The installed self-contained M1 APK and its diagnostic evidence remain the prior tested artifacts; no new physical pass is claimed.

## Outstanding

M1: all open cases in the phone checklist and full roadmap matrix. M2: real visitor positions, reviewed pedestrian route/directions, map data/rights and renderer proof, actual media assets, atomic mobile import/version pinning and six-stop playback integration. E1: feasible routed plans, field/orientation review, listening/walking feedback and an explicit outcome before further automation.

No action is required while Sidi is away. On return, the next M1 test is pause at arrival; the engineer prepares the later development-build repeats. Desk listening is optional independent feedback, not a replacement for those checks.
