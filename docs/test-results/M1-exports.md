# M1 named JSON export delivery

13 September 2026. M1 remains **implemented; awaiting physical test**. This change fixes the chooser-only export handoff; it does not complete the walking matrix.

## Implemented behavior

All three exports (test results, private diagnostics and fixture JSON) open a shared screen with a unique timestamped default name and editable filename. Save to folder uses Android's chosen document tree and confirms success only after reading back identical JSON. Share instead is separate. Original tour progress, route, notes and attempts are never reset by export. Cancellation creates no file; write or verification failure retains the snapshot for retry and attempts to remove only the newly created incomplete file. Repeated custom names rely on the document provider's new-file collision naming.

The offline guide and Markdown instructions now describe the same save flow. Original brief and historical physical results are preserved. No new dependency, paid service, remote or upload is introduced.

## Automated verification

Typecheck, lint and all 61 tests pass (54 existing plus seven export tests). New cases cover stable snapshots, repeated/backwards-clock default naming, filename validation, cancellation, verified readback, provider-selected duplicate document URIs, write/verification failures, retry, permission errors and failed cleanup. Existing replay and real SQLite durability tests pass unchanged. Generated guide parity passes.

## Build and phone evidence

Expo compatibility passes; Expo Doctor passes 21/21. Both Android variants built successfully. APK signatures, native audio markers and background-location permissions pass the build verifier. The self-contained bundle contains the current source ID and the Save to folder / Share instead / Saved and verified strings.

Runtime source ID: `4fa6ab9dd753797d`. Self-contained APK SHA-256: `ed8a47d24344e5711cdc78094092489d853fb78ae155288dfda492f2fbef0c65`. Development APK SHA-256: `ad9d843bc708c1c329e05508fae1e3abb4fb49c4104980a74c753dcf670eb3d6`. The native development APK is unchanged; its current JavaScript requires Metro. The self-contained artifact embeds the updated UI and guide.

The phone was not connected (`adb devices` returned no device). Installation and actual folder-picker checks are pending; the previously installed guide build has not been replaced. Sidi has been asked to reconnect/unlock. Unit tests cannot establish Android's actual provider behavior or a successful on-device save. No new walk or audible playback result is claimed.

Remaining connected-phone procedure:

1. Verify tracking is stopped and preserve the existing route, progress and journal; install the self-contained APK with `adb install -r`, never uninstall or clear data.
2. Export fixture JSON, edit its name and save under a local Documents/Walking Tour Tests folder. Check the success message and parse the saved file privately. Repeat a custom name and confirm a separate file exists without changing the earlier file.
3. Save test results from the nested guide dialog and private diagnostics with distinct default names. Pull privately, verify retained attempts/route and replay diagnostics. Keep raw files ignored.
4. Cancel folder selection and confirm no file/success message. Open Share instead with an edited filename, then cancel without selecting a recipient; do not treat chooser closure as delivery.
5. Check cold opening/local saving offline, restore original connectivity settings, inspect app-scoped crashes and leave tracking stopped. Record actual outcomes here; this stationary check does not pass the full walking gate.
