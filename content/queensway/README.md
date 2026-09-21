# Queensway — Behind the façades

21 September 2026. A short owner-requested M2 demonstration near 46 Queensborough Terrace: **three stops, one walking chapter, all George, about 20–25 minutes**. The [authoring record](../../docs/content/authoring/queensway-2026-09-21/README.md) retains the public-tour survey, selection, source packets, frozen writer draft, visual correction and navigation review.

## Inputs and reproduction

- [stories.json](stories.json): final original prose, spoken onward summaries, detailed directions and exact paragraph evidence.
- [plan.json](plan.json): reviewed route, distinct visitor/landmark positions, access limits, provider-input hash and measured launch window.
- [packages/behind-the-fronts.json](packages/behind-the-fronts.json): import transport with all four AAC/M4A recordings and map `queensway-105db6bcbdfce45f`.
- [manifest.json](manifest.json): readable inspection copy; audio placeholders make it unsuitable for import.
- [preparation.json](preparation.json): exact inputs, local synthesis settings, complete paragraph chunks, media integrity and duration budget.

    node --import tsx tools/prepare-queensway.ts
    node --import tsx --test tests/prepared-tours.test.ts

Uses the pinned locally cached Kokoro George renderer, without paid or runtime generation. The bounded tool checks complete text/evidence/chunks, decoding, hashes and actual timing. Existing tour IDs and versions are unchanged; imported content remains immutable by ID/version.

## Route and budget

Start beside **QUEENS, 17 Queensway**, around a minute north of Queensway station. Press Start there, since the welcome plays immediately. Continue to Whiteleys, then via Porchester Gardens and Leinster Place to the final stop in Leinster Gardens. The mapped return uses Craven Hill Gardens and Queensborough Passage to finish near **46 Queensborough Terrace**.

The route is about **1.21 km**. The provider estimate is **16.5 minutes moving**; stationary recordings including directions total **3m45.5s**. The **30.5-second walking story** is concurrent with movement, not extra time. This leaves a few minutes within the 20–25-minute brief for looking and ordinary crossing waits. Slower pacing or works can lengthen the outing.

The chapter starts on Leinster Gardens’ east pavement after crossing from Leinster Place. From its latest launch, the prepared geometry leaves **94.04 metres / 56.42 seconds at 6 km/h** before the guard ahead of the first Queen’s Gardens mouth: **25.92 seconds after the actual audio**, above the 15-second reserve. Cleveland Square joins by a bollarded pedestrian/cycle opening; continue straight with awareness of joining cyclists. A missed chapter can be played while stopped; no retracing is required.

These are authoring calculations and dated desk checks, not current field clearance or native GPS timing evidence. Crossings and the vehicle-access section of Queensborough Passage have no planned walking narration. Public exterior stops avoid park/interior opening dependencies.

## Delivery and rights

[Owner guide](../../docs/content/QUEENSWAY-TAKE-THE-TOUR.md) · [exact build and phone status](../../docs/test-results/M2-queensway-tour.md).

Installed source `056c32524c6280bf` passed the silent Pixel handoff: cold offline map with the complete route/three stops, first reader and stopped/unstarted Queensway. Original network settings restored; the phone is released. This reuses the 166 passing preparation tests and unchanged native/audio evidence. A minor first-approach spacing defect remains for the next version, without affecting spoken directions.

Original AI-assisted prose and local George synthesis, with upfront provenance and source notes. OpenStreetMap attribution and bundled map/font notices are retained. No source photographs, Street View frames, third-party tour scripts or music are packaged. Prior native/headset evidence is reused; new recordings have media verification, with subjective listening and ordinary demo reactions separate.
