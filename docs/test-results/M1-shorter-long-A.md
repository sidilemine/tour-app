# M1: long A shortened to 3:30

15 September 2026. Owner-requested test-asset update. **Installed and ready; stay-at-B and Battery Saver outdoor results remain pending.** M1 remains implemented; awaiting physical test. Previously accepted walks retain their recorded scope and do not require repeating for this asset change.

## Change

Long A now measures **209.982 seconds**, 1,807,722 bytes. The complete owned transcript was shortened from thirteen repeated diagnostic sections to six, with an introduction announcing three minutes thirty seconds and a natural ending. Local Mac Daniel speech at rate 145 produced a 199.760635-second AIFF; FFmpeg `atempo=0.951241119` fitted it to the requested duration before AAC encoding. No paid/live TTS, silent padding or looping was used. The normal A/B/C bytes are unchanged.

The active durable filename changes from `edge-a-v1.m4a` to `edge-a-v2.m4a`, preventing the prior cached 6:21 asset from masking the new recording. The old file is preserved. Use New walk after updating, rather than applying an older recording's saved offset to this asset. The existing `edge-long-a` fixture profile and corrected version-2 geometry are unchanged; this is not a route change or new calibration.

The player labels EDGE TEST: A lasts 3:30. Guide revision 5 updates the current two-case overview, duration and Documents / Walking Tour Remaining folder. All 18 procedures remain available; historical passes are not prefilled. The updated standalone plan is saved under `00-Four-tests-v5.txt`, preserving the earlier file.

## Verification

- TypeScript, lint, 78 unit/replay/storage tests and guide parity passed. Both local Android variants built and passed native marker/permission/signature checks. The self-contained bundle verifies the new cache revision, 3:30 label, guide folder and all four embedded asset hashes.
- Source `aaa261ee84596b55`. Development APK: 69,048,968 bytes, SHA-256 `f71a66c6a195edaeeae6ea16b054148c866766566b8d12543ad56d925de105bd`. Its native bytes are unchanged; it loads current JS from Metro when used. Self-contained APK: 34,741,531 bytes, SHA-256 `bcbbc57944cc71d5fa9d1ae3813ae995bfeacb64e8c0048d6d7306ba58e42505`.
- Existing self-contained storage was backed up using the matching development variant without launching it, uninstalling or clearing data. Before and after SQLite integrity checks passed. The exact original 6,231-event prefix, fixture, archived progress and whole guide journal (three saved records, no active attempt) remained unchanged. New readiness events were appended.
- The new self-contained app copied and played the shortened asset. Native state confirmed Playing beyond seventeen seconds; media Pause held at about 18.8 seconds. The readiness run received 28 usable fixes over 67.08 seconds, with no logged audio error. End stopped tracking. This was a connected foreground sample, not a complete audible 3:30 listen or an outdoor acceptance run; duration comes from file inspection.
- A subsequent private cache check confirmed all four active cached clips match committed source assets. The older v1 long-A cache remains byte-identical. The saved diagnostic replay passed 817 transitions across three segments, including historical runs; no duplicate physical credit is assigned.
- Final installation returned an ambiguous nonzero ADB result after the upload prompt. Pulling the actual installed APK and comparing its SHA-256 resolved this: it exactly matches the new self-contained artifact and has non-debuggable release flags. No installer success was inferred solely from the command attempt.
- After Android reported no active default network and Metro was unavailable, an explicit force-stop/cold launch recovered the 3:30 edge fixture and paused/ended readiness offset without spontaneous playback. New walk then reset only the backed-up readiness progress. Guide 5 and its updated overview rendered on the phone. App-scoped exit history contains deliberate update/force-stop entries and no new crash after the historical 09:23 developer-menu issue.

## Handoff

Self-contained APK installed; EDGE TEST 3:30 selected; tour stopped, next A, not-started hold, fresh progress and no active guide attempt. Original route and test history are preserved. Wi-Fi and mobile data were restored to their original enabled state after the offline check; turn them off for the Battery Saver test while keeping Location on. The owner can disconnect and reopen later without Metro.

Next: begin the early-arrival guide attempt, Start at A, reach B while A still speaks and stay until A then B finish. No C or three-minute silence is needed for that test. Switch to the standard file for the separate full Battery Saver walk. No native playback/location policy or “off route” label fix is included in this update; the [documented diagnostic limitation](M1-corrected-detour-and-pass-pending.md) remains separate.
