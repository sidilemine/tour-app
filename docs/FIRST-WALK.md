# First Android walk — M1a/M1b

The first development APK was built before M1 hardening, as requested. Use the final `walking-tour-development.apk` when available; the earlier `walking-tour-m1a-development.apk` is retained only as a diagnostic checkpoint. The full acceptance matrix remains in [ROADMAP.md](../ROADMAP.md#physical-phone-procedure-for-m1).

## Install and start

For recording a route or reopening the app away from the Mac, use `walking-tour-offline.apk`. Leave this self-contained variant installed between assisted sessions. Its cold launch requires no server. The development-build commands below are for the explicitly prepared M1 development walk; afterwards, restore the self-contained APK and verify reopening before handing the phone back. Both variants remain required by the test matrix.

From this repository, connect the phone by a data USB cable, enable Developer options → USB debugging, and accept this Mac's authorization on the phone. The engineer can run the following commands; only the phone prompts require Sidi.

```sh
sh tools/android-env.sh adb devices -l
sh tools/android-env.sh adb install -r artifacts/walking-tour-development.apk
sh tools/android-env.sh adb reverse tcp:8081 tcp:8081
npm start
```

Press `a` in Metro's terminal to open the development client. If needed, choose the development server from the client's launcher. Keep Metro connected until Start has prepared all local clips. There is no need for an Expo account. Before leaving the Mac to record a real path, prepare the clips: the engineer can load the clearly labeled synthetic fixture and use Manual Play A without starting tracking. This copies all three clips into durable app storage. Verify playback and pause, then replace that synthetic fixture with the recorded/checked path before starting a physical tour. Never press the path-checked Start confirmation for the synthetic fixture.

The self-contained APK uses embedded JavaScript and audio:

```sh
sh tools/android-env.sh adb install -r artifacts/walking-tour-offline.apk
```

Open **Walking Tour Lab** from the phone's app list. This build needs no Metro. Both builds use the same package ID and local test signing key; installing one replaces the other while retaining app data. Do not uninstall or clear data between recovery checks. These ARM64 APKs require an ARM64 Android device (Android 7/API 24 or later); check the connected phone before installation.

## Configure a real path

**Suggested area: Friary Park**, near North Finchley. Barnet Council lists it at Friary Road, N12, with gardens, open space and walking activities: [official park page](https://www.barnet.gov.uk/directories/parks/friary-park). This is an area recommendation, not a verified walking route. No opening/access or landmark-viewing assumptions are encoded in the app. Check signs and current access on arrival; use daylight for the first test.

In **Configure / load fixture**, either import/paste a JSON fixture or record a path you already know:

1. Tap **Record / continue path** and wait for a recent fix with accuracy within 35 m. Keep the recording screen open during this preparation walk.
2. Stand safely inside the park on a public path and **Capture A**. Walk a continuous known path for roughly 4 minutes before **Capture B**, then another roughly 4 minutes before **Capture C**. This allows a short clip plus at least 3 minutes of silence per leg. Avoid route crossings and stops close to another leg on this first experiment.
3. Stop walking before pressing controls. Inspect each actual standing area and access. The app records path geometry; it does not establish physical safety, access or orientation. Mark the user-check box only if you checked those things.
4. **Use recorded fixture**, then **Export fixture JSON** if you want a copy. Return to A by a route you know before starting the test. JSON also lets you change titles, path points and stop positions without a code rebuild.

## Short first-walk checklist

Record which variant is being tested. In the self-contained build, skip developer-menu and Metro steps; the same silence/arrival criteria apply. Its results do not replace the required development-build walks.

- Record phone model/Android version, build variant, battery level and battery-saver settings. Test with ordinary settings, no debugger and no USB charging during the walk.
- Enable private diagnostics. Tap **Start tracking + first clip**. Grant precise foreground location, then background “Allow all the time” when Android opens Settings. Return to the app. If Start reports denied permission, correct it and press Start again. Manual audio remains available without location permission.
- Before leaving, check **Why it spoke — or stayed quiet** shows “Receiving background-capable fixes” and that the last-fix time advances. “Registered; waiting for fixes” alone is not ready. If no fixes arrive, keep the diagnostics and report the failure rather than repeating a whole walk.
- Hear A; check that fixes are arriving, then disable Fast Refresh in the developer menu, unplug, stop Metro and turn Wi-Fi/mobile data off while leaving Location enabled. Lock the phone.
- Let A finish. Walk **at least 3 minutes of genuine silence** to B. B should play once, within 30 seconds of arrival, without unlocking. Repeat B → C. No silent-loop audio is used.
- On a separate run, press **Pause** during silence or narration, arrive at the next stop and wait 60 seconds: it must stay silent until **Resume**. **Manual Play** deliberately plays one selection while preserving the automatic hold.
- At a safe stop, **End tour / stop location**, then **Export private diagnostics** and save locally. The export contains precise location; review it before sharing. Export before changing route fixtures.

An initial successful walk is not M1 completion. Record early arrival, interruption/output changes, permission loss, repeated walks, and offline termination/reopen using the full matrix. After reopening: Start restores tracking but preserves the saved hold; Resume is deliberate. Force-stop is expected to end operation until reopened.

If a clip does not play, stop safely and inspect **Why it spoke — or stayed quiet**: GPS accuracy/age, cross-track distance, distance to the eligible stop, dwell agreement, hold/automatic state, and requested versus actual playback. Keep the export even when the test fails.

After a failed attempt, keep the exported fixture and diagnostics. **New walk / reset progress** resets playback progress only; it keeps the loaded route and previous diagnostics. Use it after End when you want a fresh A → B → C attempt. Reopening alone deliberately restores progress rather than starting A again.
