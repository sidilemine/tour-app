# Prepared outdoor test batch

Current preparation: use [the four remaining outdoor checks](FOUR-REMAINING-WALKS.md) and Documents / Walking Tour Remaining. The development baselines are complete; the self-contained variant is ready with corrected version-2 geometry. Earlier batch details below retain their historical scope.

Preparation: 14 September 2026 for the next morning. These are the existing seven remaining outdoor cases, not new acceptance requirements. The engineer records installation verification in [the preparation result](test-results/M1-field-preparation.md). M1 remains implemented; awaiting physical test.

## Before leaving

Connect the unlocked phone briefly to the Mac and tell the engineer you are ready. The engineer will install/load the development build, cache all four local audio files, disable Fast Refresh, check fresh location and ordinary battery settings, and leave the standard fixture ready. Installing preserves data; no uninstall or storage clearing. Keep the self-contained app overnight: a development session is not guaranteed to survive until morning.

After preparation, unplug, stop Metro on the Mac, and turn phone Wi-Fi and mobile data off; keep Location on. The three development baselines need a loaded session but no network or cable during walking. Do not force-close, reload, reboot or install another APK during the batch. End/New walk between attempts is fine. If Android closes the app and it asks for a development server, reconnect to the Mac; do not treat a release-app run as a development pass.

All seven outdoor cases can use this prepared development build. The engineer restores the self-contained APK when you return. You do not need to install anything yourself outdoors.

## Order

| Order | Case | Fixture / clips | What matters |
|---|---|---|---|
| 1–3 | Three development baselines | `01-standard-walk.json` / STANDARD CLIPS | Three consecutive successful A/B/C runs. Locked throughout; at least three minutes of actual silence before both B and C (aim for four); each arrival once, within 30 seconds of physically arriving. Ordinary battery settings. |
| 4 | Detour / rejoin | Standard | Leave the path before B, check the reason, replay A manually, let it finish, Pause, return to B, then explicitly Resume. No C or minimum silent gap. |
| 5 | Early arrival | `02-edge-tests-long-A.json` / EDGE TEST | A speaks for 6:21. Walk from your usual A to B; check pending arrival while A still speaks. Stay at B until A ends; then B plays once. |
| 6 | Pass pending | Same edge fixture, New walk | Reach B while A speaks, confirm pending arrival, continue safely along the known B→C path well beyond B before A ends. Wait there; B must stay unplayed. No C required. |
| 7 | Battery saver | Restore standard fixture | Separate full locked A/B/C run with Battery Saver enabled, normal short clips and genuine silent gaps. Record start/end battery and settings. Turn Battery Saver off afterwards. |

The full steps and result forms are in Offline test guide, revision 4. The guide lists all historical cases too; only the seven above are this batch. Naturally poor GPS is an observation if it occurs, not a reason to go searching for bad reception. A failure or inconclusive attempt needs diagnosis, not repeated guessing outdoors.

## Switch fixtures

End and export the current diagnostics before switching. Configure / load fixture → Choose JSON file → open Documents / Walking Tour Morning → select the filename → Validate and load JSON → Load. Then New walk / reset progress. Begin the guide attempt only after selecting the right fixture.

Both files use the exact same original path and A/B/C coordinates. The edge file has a separate identity and long A audio; switching archives progress for the other fixture. It does not claim newly verified geometry. Check current access as usual. The player visibly labels STANDARD CLIPS or EDGE TEST. Never use EDGE TEST for a baseline or battery-saver walk.

For the pass-pending case, wait about ten seconds at B and check `arrival-pending-unfinished-clip` in recent events. Then walk roughly 70 m beyond B on the known onward path; when safely stopped, check “To eligible stop” is over 50 m with fresh fixes before A ends. Do not turn back towards B until the result is recorded. If you cannot do this safely within A, mark the case inconclusive; no rushing.

## Save each result

End, save the guide observation, then save both Test results and Private diagnostics. Keep each unique default filename and wait for “Saved and verified.” Record anything unusual and which fixture/build was used. Export before changing fixtures because diagnostics are filtered to the selected fixture. Old attempts remain stored; New walk does not erase them.

The private prepared JSON files and raw logs are not committed or uploaded. This guide itself contains no private coordinates.
