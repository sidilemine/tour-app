# AI-Generated Self-Guided Tour App
## Product, Architecture, AI Pipeline, Build Strategy, and Codex/Astra Operating Brief

**Status:** Working project brief  
**Date:** September 2026  
**Primary owner:** Sidi Lemine  
**Purpose:** Durable context for ChatGPT Work, Codex/Astra threads, and future project decisions.

---

# 1. Executive summary

The product is a self-guided tour app inspired by the experience of products such as Shaka Guide, initially optimized for walking tours and later extensible to driving.

There are two distinct systems:

1. **The tour player / navigation experience**
   - Cross-platform mobile app for Android and iOS.
   - Map and route.
   - Audio narration.
   - Text/transcript and images.
   - Skip/back/manual controls.
   - Automatic location-aware playback.
   - Offline-first during the tour.
   - Robust recovery when GPS is imperfect or the user behaves unpredictably.

2. **The tour factory**
   - User describes where they are going, available time, interests, constraints, and desired style.
   - AI researches possible places and stories.
   - Sources facts.
   - Selects and orders stops.
   - Calls a real routing engine.
   - Writes narration to fit route timing.
   - Fact-checks the narration.
   - Generates audio once with TTS.
   - Packages the tour for download.

The central architectural recommendation is to keep these systems separated.

**The phone should not need a live LLM or TTS connection during a normal tour.** Tours should be generated ahead of time, packaged, cached, and then played deterministically on-device.

That gives:
- low operating cost;
- low latency;
- high reliability;
- offline capability;
- better privacy;
- reusable tours;
- much easier debugging.

The first objective should **not** be "type any city and get an AI tour."

The first objective should be:

> Build one manually authored six-stop tour that is genuinely pleasant to walk, reliably knows roughly where the user is, handles screen-off audio correctly, and fails gracefully.

Once that experience works, AI can automate the production of the same underlying tour format.

---

# 2. Product vision

The long-term product promise is approximately:

> Tell the app where you are going, how much time you have, what interests you, and any constraints. It creates a sourced, personalized, professionally narrated tour that guides you through the place automatically.

Examples:

> "We're in Rome for three hours. Mum is with me, so avoid steep walking. We've already done the Colosseum and Forum. I'm interested in political intrigue, engineering and ordinary Roman life, less interested in churches. Finish somewhere good for lunch."

Or:

> "Give me a two-hour Greenwich walk focused on maritime history and strange stories."

Or eventually:

> "We're driving from Los Angeles to Joshua Tree. Tell us interesting stories along the way without distracting us from navigation."

The product should feel like a guide who:
- knows where you are;
- knows what you are about to see;
- knows when to speak and when to be quiet;
- tells good stories rather than reading encyclopedia entries;
- adapts to what the user cares about;
- never requires constant screen attention;
- can be trusted on factual claims.

---

# 3. Product principles

These should remain stable unless strong evidence says otherwise.

## 3.1 Offline-first during use

After a tour is downloaded, normal playback should not depend on:
- LLM inference;
- TTS generation;
- web search;
- server availability;
- continuous connectivity.

Internet may still be useful for:
- map tiles;
- live rerouting;
- opening sources;
- optional conversational features;
- refreshing closures / opening hours.

But core narration and progress should survive weak or absent signal.

## 3.2 AI generates tours; AI should not be required to run them

Tour generation can be expensive, slow, or complex.

Tour playback should be cheap, deterministic, fast, and predictable.

## 3.3 Location should remain on-device by default

There is little reason to stream someone's live GPS trace to the backend merely to trigger audio.

Server:
- sends route and tour package.

Phone:
- reads location;
- matches it to route;
- triggers content;
- persists progress.

Optional analytics can report:
- stop played;
- stop skipped;
- tour completed.

Avoid collecting detailed traces unless a later product need justifies it.

## 3.4 Automatic behavior must always have manual fallback

If the phone cannot confidently determine where the user is, the product should degrade gracefully.

Always allow:
- play this stop;
- next;
- previous;
- choose stop;
- pause automatic triggering;
- start from here;
- get me back to route.

The system should assist rather than insist.

## 3.5 Never let an LLM invent physical routing

The LLM can decide which places are interesting.

A routing engine should decide how to walk or drive between them.

This division matters.

AI:
- semantic judgment;
- narrative judgment;
- thematic fit;
- prioritization.

Routing engine:
- roads;
- paths;
- crossings;
- turn restrictions;
- route geometry;
- travel time.

## 3.6 Evidence precedes prose

The writer should not browse freely and improvise historical facts while drafting.

Instead:

research -> structured claims -> verification -> writer -> claim check

This is one of the strongest defenses against plausible-sounding hallucination.

## 3.7 Design the schema for walking and driving now; implement walking first

Do not build two unrelated products.

The domain model should understand:
- walking;
- driving.

But do not implement car mode until walking is genuinely good.

---

# 4. What is easy and what is hard

## Relatively easy

- Cross-platform app shell.
- Map display.
- Play/pause audio.
- Stop list.
- Transcripts.
- Images.
- Downloaded media.
- Previous/next.
- Basic routing API calls.
- TTS generation.
- Structured LLM generation.
- Sharing a tour by ID/link.

## Moderately hard

- Background audio.
- Background location.
- Persistence across process death.
- Offline maps / graceful map degradation.
- Android/iOS permission differences.
- Audio interruptions.
- Generating good route-aware narration.
- Maintaining image licensing and attribution.

## Genuinely hard

### 1. Location confidence in cities

Urban GPS is noisy.

Problems:
- tall buildings;
- reflected signals;
- parallel streets;
- pedestrian plazas;
- route crossings;
- user stops or turns around;
- low-speed heading is unreliable.

The solution is not "make GPS magically precise."

The solution is:
- use fused OS location;
- project observations onto the intended route;
- infer route progress;
- use recent history;
- use sequence constraints;
- use dwell/persistence;
- gate which stops are plausible;
- preserve manual fallback.

### 2. Route quality as an experience

A mathematically efficient route may be unpleasant.

A tour route can fail because:
- ugly road;
- difficult crossing;
- steep section;
- boring 12-minute gap;
- inaccessible path;
- poor sightline;
- stop is technically nearby but not meaningfully viewable.

Eventually route quality needs qualitative scoring, not merely shortest path.

### 3. AI content quality

It is easy to produce factual-looking tourist prose.

It is harder to create:
- compelling stories;
- strong physical orientation;
- useful pacing;
- coherent thematic arcs;
- genuine sourcing;
- calibrated uncertainty;
- content that works while moving.

### 4. Mobile lifecycle edge cases

A prototype works while open.

A real tour must also work when:
- phone locks;
- app goes to background;
- user takes a call;
- Bluetooth changes;
- OS kills the app;
- user opens camera;
- location permission changes;
- GPS disappears;
- battery saver intervenes.

These deserve early testing.

---

# 5. Recommended initial technology stack

The current default recommendation is:

## Mobile
- React Native
- Expo
- TypeScript
- Expo Router
- expo-location
- expo-audio
- a maps layer compatible with Android/iOS
- SQLite for durable local state
- lightweight state management such as Zustand

Why:
- one codebase for Android and iOS;
- mature mobile ecosystem;
- appropriate native capabilities;
- reasonable Codex familiarity;
- easy iteration.

Avoid starting with:
- separate Swift + Kotlin apps;
- PWA as the primary product;
- a highly custom native navigation engine.

A PWA is especially unattractive because background audio + background location + screen lock behavior are central requirements.

## Backend
Start simple:
- TypeScript backend / server functions;
- Postgres;
- Supabase is a reasonable initial option;
- object storage for audio/images;
- simple asynchronous job mechanism for tour generation.

Do not introduce:
- Kubernetes;
- elaborate microservices;
- distributed event buses;
- custom orchestration frameworks

until there is actual evidence they are necessary.

## Routing
Hide the provider behind an interface from day one.

Conceptually:

```ts
interface RoutingProvider {
  route(
    stops: Coordinate[],
    mode: "walking" | "driving"
  ): Promise<Route>;
}
```

Possible providers:
- Google Routes;
- Mapbox;
- later an OpenStreetMap-based/self-hosted option if economics or control justify it.

Do not allow provider-specific assumptions to leak throughout the app.

## AI providers

Likewise abstract:
- research/search;
- LLM;
- TTS.

The point is not to create needless abstraction. It is to avoid tying the tour format and business logic to one vendor.

---

# 6. Core tour data model

A tour should be a versioned downloadable package.

High-level structure:

```text
TOUR
├── metadata
├── preferences/profile used
├── route
├── stops
├── legs
├── media manifest
├── sources
├── attribution
└── version/checksum
```

Example conceptual schema:

```ts
type Tour = {
  id: string;
  schemaVersion: number;

  title: string;
  description?: string;

  mode: "walking" | "driving";

  city?: string;
  region?: string;
  country?: string;

  estimatedDurationSeconds: number;
  estimatedDistanceMeters: number;

  route: RouteGeometry;

  stops: TourStop[];
  legs: TourLeg[];

  themes: ThemeWeight[];

  createdAt: string;
  updatedAt: string;

  contentVersion: number;
};
```

A stop might include:

```ts
type TourStop = {
  id: string;
  sequence: number;

  title: string;

  location: Coordinate;
  arrivalZone?: TriggerGeometry;

  narration: NarrationClip[];

  transcript: string;

  images: TourImage[];

  claims: ClaimReference[];

  sources: SourceReference[];

  estimatedStopSeconds: number;

  manualPlayable: boolean;
};
```

A leg:

```ts
type TourLeg = {
  id: string;
  fromStopId: string;
  toStopId: string;

  geometry: Coordinate[];
  distanceMeters: number;
  expectedSeconds: number;

  navigationInstructions: NavigationInstruction[];

  narrationWindows: NarrationWindow[];
};
```

Image object:

```ts
type TourImage = {
  url: string;
  sourceUrl: string;
  creator?: string;
  licence?: string;
  attributionText?: string;
  altText: string;
};
```

Evidence:

```ts
type EvidenceClaim = {
  id: string;
  subjectId: string;

  claim: string;

  confidence: number;

  sourceIds: string[];

  uncertaintyNote?: string;
};
```

---

# 7. Location architecture

This is a core differentiator.

## 7.1 Do not use pure radial geofences

Naive rule:

```text
distance_to_stop < 15m
=> play stop
```

This will misfire.

Reasons:
- GPS uncertainty often exceeds the chosen radius;
- adjacent streets can be very close;
- route may double back;
- stop may be approached from multiple directions;
- GPS may momentarily jump.

## 7.2 Treat location as probabilistic route progress

Each incoming sample:

```ts
type LocationSample = {
  timestamp: number;

  latitude: number;
  longitude: number;

  horizontalAccuracyMeters?: number;

  speedMetersPerSecond?: number;
  headingDegrees?: number;
};
```

Transform it into an inferred state:

```ts
type RoutePosition = {
  rawCoordinate: Coordinate;

  matchedCoordinate: Coordinate;

  distanceFromRouteMeters: number;

  distanceAlongRouteMeters: number;

  accuracyMeters?: number;

  speed?: number;
  heading?: number;

  confidence: number;
};
```

## 7.3 Project onto the known route

Because the app already knows the intended route, we do not necessarily need a commercial map-matching call for every location update.

For each sample:
1. find plausible nearby route segments;
2. project the coordinate onto those segments;
3. score candidate projections;
4. prefer continuity with the previous inferred position;
5. avoid implausible jumps;
6. update distance-along-route.

This can run entirely on the phone.

## 7.4 Trigger with evidence, not one measurement

Inputs can include:

- straight-line distance to next stop;
- route distance to next stop;
- horizontal accuracy;
- distance from expected route;
- current route progress;
- previous route progress;
- heading;
- speed;
- whether previous stop was completed;
- repeated agreement across samples;
- dwell time;
- whether the candidate stop is currently eligible.

Conceptually:

```text
near stop                       +
on expected route               +
moving plausibly                +
previous stop complete          +
several consistent fixes        +
good enough location accuracy   +
---------------------------------
confidence
```

Trigger only above a confidence threshold.

## 7.5 Stop eligibility is a powerful constraint

At any moment, do not let all 20 stops compete.

Usually only:
- current stop;
- next stop;
- perhaps one stop ahead

should be triggerable.

This eliminates a large class of urban GPS errors.

## 7.6 Use hysteresis

Once a stop is entered, do not immediately consider it exited just because the next fix falls a few metres outside the threshold.

Use separate enter/exit criteria.

Similarly:
- do not retrigger completed narration;
- impose cooldown;
- maintain state.

## 7.7 Handle walking backwards

If route progress decreases consistently:
- recognize reversal;
- do not keep auto-advancing;
- possibly surface "It looks like you're heading back toward Stop X";
- keep manual behavior available.

## 7.8 Suggested initial trigger experiment

Not hard-coded truth, merely a starting point:

- candidate stop radius: roughly 25-40 m;
- require 2-3 consistent readings;
- require ~4-8 seconds of persistence where appropriate;
- allow uncertainty proportional to reported location accuracy;
- use broad route corridor;
- gate to next plausible stop;
- allow manual trigger at all times.

These numbers should be tuned using real recorded traces.

---

# 8. Location state machine

A state machine is preferable to scattered boolean logic.

Possible states:

```text
NOT_STARTED
STARTING
ON_ROUTE
BETWEEN_STOPS
APPROACHING_STOP
AT_STOP
PLAYING_STOP
LEAVING_STOP
OFF_ROUTE
PAUSED
COMPLETED
```

Transitions should be explicit and testable.

Example:

```text
BETWEEN_STOPS
  -> APPROACHING_STOP
     when confidence(nextStop) > approachThreshold

APPROACHING_STOP
  -> AT_STOP
     when confidence(nextStop) > arrivalThreshold
     for required persistence

APPROACHING_STOP
  -> BETWEEN_STOPS
     if confidence drops sustainably

ANY_ACTIVE_STATE
  -> OFF_ROUTE
     if distance from expected route is high for long enough
```

Avoid building tour progression from ad-hoc UI state.

---

# 9. GPS testing strategy

The location engine should be **pure and replayable**.

Do not couple core logic directly to the phone GPS API.

Architecture:

```text
LocationProvider
      |
LocationSample[]
      |
LocationEngine
      |
TourEvent[]
```

This lets the same engine consume:
- live phone GPS;
- recorded GPS traces;
- artificial test traces.

Create fixtures early:

```text
tests/location-fixtures/
├── normal-walk.json
├── noisy-city-walk.json
├── gps-jump.json
├── walked-backwards.json
├── stopped-for-coffee.json
├── route-crosses-itself.json
├── signal-loss.json
├── jumped-ahead.json
├── accidental-bus-ride.json
└── restart-mid-tour.json
```

Then Codex can improve matching without requiring a human field test every iteration.

This is one of the highest-value architectural choices for reducing babysitting.

---

# 10. Debug mode

Build a location debug screen before polishing UI.

Show:

```text
Raw GPS coordinate
Reported accuracy
Matched route coordinate
Distance from route
Distance along route
Current speed
Current heading
Next eligible stop
Distance to next stop
Trigger confidence
Tour state
Most recent state transition
```

Optionally show:
- raw GPS points;
- projected route points;
- trigger zone;
- recent history.

This screen will be invaluable during real walking tests.

Allow a debug walk to record the trace to a fixture file.

---

# 11. User experience and graceful failure

Core tour UI can be simple.

## Main screen
- map;
- current/next stop;
- play/pause;
- scrub if useful;
- previous/next;
- text/transcript;
- image;
- "I'm here / play this stop";
- "take me back to route."

## Persistent rules
- manual skip always works;
- no lock-in because GPS thinks something;
- playback does not suddenly jump three chapters;
- re-entering a zone does not replay completed audio;
- closing/reopening app resumes correctly;
- process termination does not lose progress.

## Useful recovery affordances
- Start tour from here.
- Choose a stop.
- Resume from previous position.
- Pause auto-triggering.
- I'm walking the route backwards.
- Rejoin route.

---

# 12. Audio architecture

Audio is not just "play MP3."

Required behavior:
- background playback;
- lock-screen media controls;
- interruption handling;
- Bluetooth changes;
- wired headset changes;
- user pauses manually;
- navigation instruction can interrupt/pause story if needed;
- resume semantics are sensible;
- persistent playback state.

Tour media should be generated ahead of time and cached locally.

Manifest can include:

```ts
type NarrationClip = {
  id: string;
  audioUrl: string;
  localFilename?: string;
  durationSeconds: number;
  transcript: string;
  clipType: "stop" | "leg-story" | "navigation" | "approach";
};
```

---

# 13. The route controls the script length

This is easy to miss.

If Stop A -> Stop B is a three-minute walk, a four-minute narration is bad content even if beautifully written.

Tour generation sequence therefore matters:

1. choose candidate stops;
2. route them;
3. know leg duration;
4. allocate audio budget;
5. write narration.

Example:

```text
leg walking time       180 sec
navigation reserve      40 sec
buffer/silence          20 sec
max narrative budget   120 sec
```

The writer receives the budget.

For longer legs, narration can be segmented.

Example:

```text
0:00 navigation cue
0:20 story A
2:00 quiet
3:15 story B
5:30 quiet
7:30 approach cue
```

Silence is part of good tour design.

The product should not chatter continuously merely because AI can generate endless words.

---

# 14. Tour factory architecture

Avoid one mega-prompt.

Prefer deterministic stages with structured interfaces:

```text
interpretRequest()
discoverCandidates()
researchCandidates()
verifyClaims()
scoreCandidates()
selectStops()
calculateRoute()
evaluateRoute()
writeScripts()
verifyScripts()
generateAudio()
assembleTour()
validateTour()
publishTour()
```

Agent autonomy can exist *within* a bounded stage, especially research.

But the entire system should not be one agent deciding what to do indefinitely.

Benefits:
- cacheable;
- testable;
- retryable;
- observable;
- model-swappable;
- debuggable;
- cheaper.

---

# 15. User request interpretation

Example input:

> "Istanbul tomorrow. About 2.5 hours. Byzantine history, architecture and weird stories. Less interested in shopping. Start at my hotel."

Convert to structured preferences:

```json
{
  "mode": "walking",
  "durationMinutes": 150,
  "themes": {
    "byzantine_history": 1.0,
    "architecture": 0.9,
    "unusual_stories": 0.8,
    "food": 0.3,
    "shopping": 0.0
  },
  "depth": "enthusiast",
  "walkingTolerance": "medium"
}
```

Eventually add:
- mobility constraints;
- children / adult audience;
- steepness tolerance;
- accessibility;
- already visited;
- desired end point;
- food/drink interests;
- indoor/outdoor preference;
- weather sensitivity;
- story style;
- desired density of facts;
- "surprises vs icons";
- time of day.

---

# 16. Candidate discovery

Do not ask the model to immediately output "the tour."

Ask it to find perhaps 20-40 candidate POIs/stories.

Each candidate should be scored along dimensions such as:

```text
historical importance
theme relevance
story quality
visual interest
source quality
uniqueness
geographical usefulness
estimated stop duration
accessibility
freshness sensitivity
```

Example:

```json
{
  "name": "Example Site",
  "importance": 0.86,
  "architecture": 0.73,
  "strangeStories": 0.91,
  "visualImpact": 0.68,
  "sourceQuality": 0.94,
  "estimatedStopSeconds": 180
}
```

Then selection becomes a constrained optimization problem:

> Which set and order maximizes tour value within time, route, preference, and physical constraints?

Do not let an LLM guess distances.

---

# 17. Route optimization

There are several layers.

## Layer 1: feasibility
Routing provider computes:
- walking/driving route;
- travel times;
- route geometry.

## Layer 2: optimization
Choose subset/order of stops to fit:
- total duration;
- target start/end;
- preferred themes;
- walking tolerance;
- accessibility constraints.

## Layer 3: experiential evaluation
Eventually add penalties for:
- ugly/hostile road;
- repetitive backtracking;
- long empty gaps;
- major unsafe crossing;
- bad viewing position;
- too many similar stops in sequence;
- narrative monotony.

The shortest route is not necessarily the best tour.

---

# 18. Evidence architecture

Every factual historical claim should be traceable.

Example evidence object:

```json
{
  "id": "claim-123",
  "subjectId": "poi-456",
  "claim": "The building was later used as an arsenal.",
  "confidence": 0.94,
  "sourceIds": ["src-1", "src-4"],
  "uncertaintyNote": null
}
```

Source:

```json
{
  "id": "src-1",
  "publisher": "Example Heritage Body",
  "title": "History of Example Site",
  "url": "https://...",
  "accessedAt": "2026-09-12",
  "sourceType": "official_heritage",
  "qualityScore": 0.95
}
```

Optionally store:
- relevant excerpt;
- publication date;
- author;
- archive date;
- retrieval method;
- licence.

Be careful about storing copyrighted source text at scale; excerpts should be minimal and used appropriately.

---

# 19. Research/source hierarchy

Prefer strong, durable sources:

1. official heritage bodies;
2. museums;
3. national/local government;
4. universities / academic sources;
5. primary historical sources;
6. reputable specialist institutions;
7. Wikidata;
8. Wikipedia as a discovery/overview layer;
9. reputable local-history sources;
10. lower-authority sources only when necessary.

The exact ordering can vary by subject.

Important:
- multiple sources for important/contested facts;
- preserve uncertainty;
- distinguish folklore from documented history;
- label legends explicitly;
- avoid converting disputed stories into fact.

---

# 20. Evidence-bound writing

The tour writer should receive:
- route context;
- physical viewpoint;
- approved evidence;
- theme brief;
- time budget;
- style rules.

It should not be encouraged to introduce factual claims not in the evidence pack.

Prompt principle:

> Write an engaging spoken narrative using only factual claims supported by the supplied evidence. You may explain, connect and contextualize those facts, but do not invent new historical claims. If an engaging statement would require unsupported information, omit it or flag it for research.

Then run a verifier:

For every factual sentence:
- supported;
- unsupported;
- overstated;
- ambiguous;
- conflicts with evidence.

Unsupported claims loop back for correction.

---

# 21. Writing for the ear

AI naturally writes encyclopedia prose.

The desired narration is closer to a talented guide.

Bad:

> "The church was constructed in 1723 and designed by..."

Better pattern:

> "Look up at the tower."

> "There's something odd about it."

> "It looks medieval. It isn't."

Then explain.

Prompt rules:
- write for listening;
- short spoken sentences;
- orient the user physically;
- use what is visible;
- reveal stories;
- avoid laundry lists of dates;
- one main idea at a time;
- define unfamiliar terms;
- avoid referring to paragraphs or text;
- do not require screen reading;
- vary rhythm;
- allow pauses;
- avoid generic tourism clichés;
- don't overuse rhetorical questions;
- don't repeat "imagine...";
- preserve important names;
- provide pronunciation metadata separately;
- fit the allocated time budget.

---

# 22. Narrative architecture

A tour is more than independent stops.

A good tour should have:
- opening promise;
- progression;
- thematic echoes;
- contrast;
- occasional surprise;
- changing intensity;
- ending/payoff.

Potential tour-level narrative object:

```ts
type NarrativePlan = {
  centralPromise: string;
  themes: string[];
  openingFunction: string;
  midpointFunction: string;
  closingFunction: string;
  recurringIdeas: string[];
};
```

The stop writer should know its narrative role:

```text
Stop 1: hook / orientation
Stop 2: establish theme
Stop 3: deepen
Stop 4: surprise / contrast
Stop 5: human-scale story
Stop 6: synthesis / payoff
```

This helps prevent the experience becoming six disconnected mini-Wikipedia entries.

---

# 23. "Tell me more" without live AI

A useful early personalization feature is optional pre-generated branches.

At a stop:

```text
Tell me more:
- The architecture
- The scandal
- What happened later?
```

These branches come from the same evidence pack.

Benefits:
- personalized curiosity;
- no live inference;
- no latency;
- works offline;
- cheap;
- fact-checkable.

Later, conversational AI can be added if justified.

---

# 24. TTS strategy

Generate speech once at tour creation/publish time.

Store:
- audio file;
- duration;
- voice identifier;
- TTS model/version;
- text version;
- pronunciation hints;
- generation timestamp.

Never regenerate because a user presses play.

At family/friends scale, the economics strongly favor quality over shaving tiny fractions of cost.

Evaluate providers primarily on:
- naturalness over long listening;
- pronunciation;
- style control;
- stability;
- cost;
- rights / terms;
- latency during batch generation.

Likely providers to audition:
- OpenAI TTS;
- ElevenLabs;
- Google Cloud TTS;
- others if needed.

Do not hard-code one provider into the domain model.

---

# 25. Pronunciation system

Place names are a predictable failure point.

Store explicit pronunciation metadata:

```ts
type PronunciationHint = {
  term: string;
  language?: string;
  phonetic?: string;
  providerOverride?: string;
  verified?: boolean;
};
```

Sources for pronunciation can include:
- official local pronunciation guides;
- dictionaries;
- Wikimedia audio;
- trusted local references.

The script should preserve the written place name while the TTS renderer can use provider-specific pronunciation controls if needed.

---

# 26. Image strategy

Early recommendation:
- favor sources with clear reuse rights;
- Wikimedia Commons is particularly useful;
- use official tourism/heritage imagery only where terms permit.

Store attribution as data, not manual notes.

Never make image licensing a final cleanup task.

Each image should carry:
- original source URL;
- creator;
- licence;
- attribution text;
- image URL / cached file;
- cropping/variant metadata.

---

# 27. Reusable city knowledge base

Do not research famous places from scratch for every tour.

Build reusable place/evidence entities.

Concept:

```text
London Knowledge Base
├── Tower of London
├── Roman Wall
├── Monument
├── Leadenhall Market
├── St Dunstan
└── ...
```

Each contains:
- coordinates;
- aliases;
- themes;
- evidence claims;
- sources;
- images;
- pronunciation;
- accessibility/freshness metadata.

Then a request such as:
- dark history;
- architecture;
- teenagers;
- 90 minutes;
- avoid stairs

mostly requires:
- selection;
- route;
- narrative planning;
- script assembly.

This reduces:
- cost;
- research latency;
- hallucination;
- repeated source retrieval.

Over time this becomes a structured tourism knowledge graph.

---

# 28. Freshness

Not all information ages equally.

Historical fact:
- long TTL.

Opening time:
- short TTL.

Temporary path closure:
- very short TTL.

Restaurant suggestion:
- short TTL.

Evidence/source entities should include a freshness class:

```ts
type FreshnessClass =
  | "historical"
  | "slow_changing"
  | "operational"
  | "live";
```

Then generation can refresh only what needs refresh.

This becomes particularly important for driving, seasonal attractions and recommendations.

---

# 29. Cost strategy

At modest scale, inference cost should not dictate the architecture.

The expensive thing is more likely:
- engineering time;
- bad mobile reliability;
- poor tour quality;
- repeated unnecessary generation.

Cost principles:

## Use cheap models for mechanical work
Examples:
- extraction;
- classification;
- tagging;
- format conversion;
- basic claim matching.

## Use stronger models where quality matters
Examples:
- route/story tradeoffs;
- narrative plan;
- difficult evidence reconciliation;
- final editorial pass;
- unusual edge cases.

## Cache everything reasonable
Cache:
- place research;
- geocoding;
- route legs where terms allow;
- generated audio;
- image metadata;
- claims;
- pronunciations.

## Batch non-urgent work
Tour generation is a natural asynchronous pipeline.

## Never pay per playback for generated content
Playback should consume pre-generated artifacts.

## Use Astra primarily as the software engineer
Do not automatically use the most expensive/capable model for every production pipeline stage.

---

# 30. Predictable failure modes

Design these in before implementation.

| Failure | Desired response |
|---|---|
| GPS jumps to parallel street | route matching + continuity |
| GPS uncertainty becomes large | widen uncertainty / avoid trigger |
| User walks backwards | detect negative route progress |
| Route crosses itself | sequence-aware matching |
| User starts halfway | start-from-here |
| User stops for coffee | maintain state; don't advance |
| User walks off route | off-route state + guidance |
| User returns later | resume persistently |
| User rides a bus/taxi unexpectedly | speed sanity checks |
| Phone locks | background audio/location |
| OS kills app | durable local state |
| Call interrupts audio | sensible pause/resume |
| Bluetooth disconnects | use system audio state |
| User skips content | advance cleanly |
| Narration exceeds leg time | compiler rejects/rewrites |
| POI inaccessible | route/content fallback |
| Attraction closes | freshness validation |
| Path temporarily closed | reroute/manual recovery |
| AI invents fact | evidence-bound writing + verifier |
| Sources conflict | preserve uncertainty |
| AI mispronounces name | pronunciation metadata |
| Image lacks licence | validation failure |
| No data connection | downloaded package |
| User passes future stop nearby | eligible-stop gating |
| Tour schema changes | version/migration handling |

---

# 31. Tour package validation

Before a tour is published, run automated checks.

Examples:

```text
[ ] schema valid
[ ] all stop IDs unique
[ ] stop order valid
[ ] coordinates valid
[ ] route exists
[ ] every stop reasonably reachable
[ ] audio file exists
[ ] audio duration known
[ ] narration fits available time
[ ] all factual sections have evidence
[ ] all sources valid enough
[ ] all images have attribution/licence metadata
[ ] no missing transcript
[ ] pronunciation warnings resolved
[ ] package download size acceptable
[ ] start/end defined
```

A "tour compiler" should fail loudly rather than publishing malformed tours.

---

# 32. Driving extension

The shared schema should support:

```ts
mode: "walking" | "driving"
```

But behavior differs.

Walking:
- small trigger distances;
- screen interaction acceptable;
- stop-and-listen behavior;
- images useful;
- small rerouting errors tolerable.

Driving:
- almost no manual interaction;
- audio-first;
- trigger lead time depends on speed;
- navigation has priority;
- missed turns matter;
- rerouting matters much more;
- content must not overload the driver.

Driving trigger logic should use time-to-event rather than only distance.

Conceptually:

```text
trigger lead distance ≈ speed × required lead time
```

Narration scheduler needs to know:
- next maneuver;
- time until maneuver;
- available safe narration window.

Never let a story obscure an important turn instruction.

---

# 33. Analytics

Keep early analytics minimal.

Useful events:
- tour downloaded;
- tour started;
- stop auto-triggered;
- stop manually played;
- stop skipped;
- playback abandoned;
- route lost;
- manual override used;
- tour completed.

Potential product insight:
- frequent manual "I'm here" use => location model issue;
- common skipped stop => content/route issue;
- repeated off-route at same location => routing issue;
- narration paused near arrival => clip too long.

Avoid collecting precise GPS traces by default.

For opt-in beta/debugging, trace capture can be extremely useful if clearly explained.

---

# 34. Accessibility and practical travel constraints

Eventually tour generation should understand:
- steepness;
- stairs;
- wheelchair access;
- surface type;
- rest opportunities;
- crossing complexity;
- daylight;
- mobility;
- weather.

Do not overpromise until underlying data is reliable.

A false "accessible" claim is materially worse than saying accessibility is unknown.

---

# 35. Build sequence

## Milestone 0: architecture and repository foundation

Deliverables:
- README.md
- PRODUCT.md
- ARCHITECTURE.md
- AGENTS.md
- ROADMAP.md
- git initialized
- technology decisions recorded

No product code yet.

## Milestone 1: manual tour player

One hard-coded/manual tour:
- six stops;
- audio files;
- map;
- stop list;
- play/pause;
- previous/next;
- transcript;
- image.

No AI.
Minimal GPS.

Goal:
> prove the basic experience.

## Milestone 2: persistence + tour package

- versioned tour JSON/schema;
- package loader;
- local storage;
- progress persistence;
- download/cache;
- restart/resume.

Goal:
> app is driven by data, not hard-coded stops.

## Milestone 3: location engine

- live location;
- route projection;
- route progress;
- stop confidence;
- state machine;
- manual fallback;
- debug overlay;
- replayable fixtures.

Goal:
> reliable automatic progression.

## Milestone 4: real mobile lifecycle

- Android background behavior;
- iOS background behavior;
- screen lock;
- audio interruptions;
- OS process death;
- permission recovery;
- offline behavior.

Goal:
> works as an actual tour app rather than a demo.

## Milestone 5: field-test hardening

Walk the same test tour repeatedly.

Capture:
- location traces;
- state transitions;
- mistakes;
- audio timing;
- UX friction.

Convert failures into automated fixtures/tests.

## Milestone 6: tour compiler

Input:
- authored structured tour.

Compiler:
- routes legs;
- computes timing;
- validates;
- emits package.

Goal:
> manufacturing pipeline without AI.

## Milestone 7: research/evidence pipeline

Input:
- location + themes.

Output:
- candidate POIs;
- sourced claims;
- evidence objects.

No final tour writing initially.

## Milestone 8: AI selection + narrative planning

- score candidates;
- choose subset/order;
- route;
- iterate if duration bad;
- produce narrative arc.

## Milestone 9: script generation + verification

- route-aware time budgets;
- evidence-bound scripts;
- claim verification;
- pronunciation extraction.

## Milestone 10: TTS + automated assembly

- generate/cache audio;
- capture durations;
- recompile;
- validate;
- publish.

## Milestone 11: sharing

- tour ID/link;
- download to friends/family;
- revision/version behavior.

## Milestone 12: personalized generation UI

Only now expose:
> "Where are you going?"

## Later
- optional branches;
- live Q&A;
- account preferences;
- car mode;
- collaborative tours;
- public marketplace if ever desired.

---

# 36. Why not start with AI generation?

Because otherwise failures are ambiguous.

If an AI-created tour is bad, the cause could be:
- wrong stop;
- bad route;
- poor GPS;
- bad writing;
- bad timing;
- wrong fact;
- bad voice;
- mobile lifecycle bug.

By first making a manually authored tour excellent, the playback platform becomes a known target.

Then the AI pipeline's job becomes:

> manufacture a valid version of a thing we already understand.

That is much easier to debug.

---

# 37. Codex/Astra operating philosophy

The goal is not to pair-program every line.

The desired relationship is:

> Sidi acts as product owner. Astra acts as a capable engineer with a clear project contract and automated QA.

We want Astra to:
- infer routine implementation details;
- carry work through;
- test its own changes;
- fix failures;
- update documentation;
- avoid repeatedly asking permission for ordinary choices.

We do **not** want Astra to:
- make difficult-to-reverse product decisions silently;
- expose credentials;
- spend meaningful money;
- publish production changes without review;
- delete important external data;
- expand scope uncontrolled.

---

# 38. Permanent repository documents

Keep these authoritative:

```text
README.md
PRODUCT.md
ARCHITECTURE.md
AGENTS.md
ROADMAP.md
```

## README.md
How to:
- install;
- run;
- test;
- build;
- understand repository layout.

## PRODUCT.md
User/product truth:
- target experience;
- core principles;
- scope;
- user stories;
- intentional non-goals.

## ARCHITECTURE.md
Technical truth:
- stack;
- boundaries;
- domain model;
- state machines;
- interfaces;
- persistence;
- background behavior;
- known risks;
- ADR-style decisions.

## AGENTS.md
Permanent operating instructions for Codex.

## ROADMAP.md
Milestones and status.

The repo should carry context so every new Codex thread does not depend on conversational memory.

---

# 39. Suggested AGENTS.md operating rules

The following belongs in the repository's permanent instructions.

```markdown
# Agent Operating Rules

You are an implementation agent for this repository.

## Default behavior

Bias toward completing assigned work rather than stopping after analysis.

For every task:

1. Read PRODUCT.md, ARCHITECTURE.md, AGENTS.md and ROADMAP.md as relevant.
2. Inspect the existing implementation before changing it.
3. Make a concise internal plan.
4. Implement the requested milestone/task.
5. Run appropriate checks/tests.
6. Diagnose and fix failures caused by your changes.
7. Exercise the feature where practical.
8. Update documentation where architecture or behavior changed.
9. Update ROADMAP.md if milestone status changed.
10. Commit coherent completed work.

## Autonomy

Do not ask the user about routine implementation choices.

Choose the simplest maintainable option consistent with the architecture.

You may:
- create and edit repository files;
- add ordinary project dependencies;
- run development tooling;
- run tests;
- research official documentation;
- refactor within task scope;
- fix bugs encountered that directly block the assigned task.

Ask before:
- adopting a difficult-to-reverse architecture not already authorized;
- introducing meaningful ongoing cost;
- exposing or requesting sensitive credentials;
- deleting significant data;
- publishing/deploying externally;
- materially changing the product experience;
- expanding scope beyond the milestone.

## Quality

Do not weaken tests merely to make them pass.

Do not hide failures.

Do not claim a task is complete until:
- implementation is present;
- type/lint checks pass where applicable;
- relevant tests pass;
- obvious failure cases were exercised;
- documentation reflects meaningful changes.

## Scope

Stay inside the current milestone.

Do not implement speculative future features merely because they seem useful.

Prefer simple code over premature frameworks.

## Architecture principles

- Tour playback does not depend on live LLM/TTS.
- User location stays on-device during normal playback.
- Location triggering is route-aware and confidence-based.
- Automatic triggers always have manual fallback.
- Walking and driving share a domain model.
- Routing, AI and TTS providers are behind clear interfaces.
- Progress survives process termination.
- AI factual content retains provenance.
- Offline tour playback is first-class.
- Deterministic pipelines are preferred over unbounded agent autonomy.
```

---

# 40. Bootstrap prompt for Astra

Use this once at the beginning of the repository.

```text
I want you to act as the technical lead for this repository.

We are building a cross-platform self-guided audio tour application,
initially for Android and later iOS, using React Native, Expo and TypeScript.

Your job is to bias toward action and carry assigned work through to
completion rather than stopping after a plan.

Before implementing the application, establish the repository so that
future Codex sessions can work autonomously and reliably.

Create and maintain:

README.md
PRODUCT.md
ARCHITECTURE.md
AGENTS.md
ROADMAP.md

PRODUCT.md should describe the intended user experience and product
constraints.

ARCHITECTURE.md should contain the technical decisions and boundaries.

ROADMAP.md should break development into small, independently verifiable
milestones.

AGENTS.md should contain permanent instructions for future coding agents.

Important operating rules:

- Infer routine implementation details rather than asking me.
- Ask me only when a decision is difficult to reverse, materially affects
  the product experience, exposes credentials/data, or creates meaningful
  ongoing cost.
- Do not stop after proposing how to do something when you can safely do it.
- Persist through implementation, testing, debugging and verification.
- If tests fail because of your change, diagnose and fix them.
- Keep scope disciplined: do not implement later milestones prematurely.
- Prefer simple, maintainable solutions.
- Never silently weaken tests merely to make them pass.
- Record important architectural decisions in ARCHITECTURE.md.
- Update ROADMAP.md when milestones are completed.
- Commit coherent completed work to git.
- Preserve working functionality while making changes.
- Never expose secrets or commit credentials.

Technical principles:

1. Generated tours are packaged ahead of use.
2. Normal tour playback requires no live LLM or TTS request.
3. User location remains on-device during normal tour operation.
4. Location triggering must be route-aware rather than simple radial geofencing.
5. Every automatic trigger must have a manual fallback.
6. The domain model must support walking and driving from the beginning.
7. Routing providers, LLM providers and TTS providers must be behind interfaces.
8. Tours must persist progress across process termination.
9. Background audio and location must work on Android and iOS.
10. AI-generated factual content must retain claim-level provenance.
11. Prefer simple, testable components over autonomous-agent behavior.
12. Do not introduce infrastructure we do not yet need.

First inspect the repository.

If it is empty, initialize git and create only the planning/architecture
foundation. Do not implement the app yet.

Research current official documentation where necessary rather than relying
on potentially outdated assumptions.

At the end, report:
1. what you created;
2. important architectural decisions;
3. risks you identified;
4. the proposed milestone sequence;
5. ONLY decisions that genuinely require my judgment.

Do not ask me routine setup questions.
```

---

# 41. Reusable milestone prompt

Once architecture has been reviewed:

```text
Implement the next agreed milestone from ROADMAP.md.

Work autonomously through implementation, testing and verification.

Before changing anything, read PRODUCT.md, ARCHITECTURE.md, AGENTS.md
and ROADMAP.md.

Stay strictly within this milestone.

You are authorized to:
- create and modify project files;
- install ordinary development dependencies;
- run development tools;
- run the application;
- run and fix tests;
- research official documentation;
- make routine implementation decisions.

Do not stop merely because you encounter a bug. Diagnose it and continue.

When several reasonable implementation choices exist, choose the simplest
one consistent with ARCHITECTURE.md unless the choice is expensive or hard
to reverse.

Do not ask me to perform an action that you can perform yourself.

Completion means:
- the feature is implemented;
- lint/type checks pass;
- relevant automated tests pass;
- you have exercised the feature sufficiently to catch obvious problems;
- documentation is updated where necessary;
- ROADMAP.md accurately reflects progress.

If something prevents full completion, investigate alternative solutions
before escalating it to me.

Work until the milestone is complete.
```

---

# 42. How to reduce Codex babysitting

## Give outcomes, not line-level instructions

Good:

> On my Pixel, audio plays but the play button still appears inactive. Fix the state-sync problem and check whether the same class of issue exists elsewhere in the player.

Less useful:

> Set `isPlaying=true` on line 64.

Let Astra diagnose the system.

## Convert repeated questions into permanent rules

If Astra asks:

> Shall I install Zod?

Reply:

> Yes. Also update AGENTS.md so ordinary dependency choices of this kind do not require my approval in future.

Every unnecessary interruption is an opportunity to improve the project contract.

## Objective completion beats verbose prompts

A short task with clear completion criteria is better than a gigantic implementation recipe.

Desired feedback loop:

```text
implement
  ↓
typecheck
  ↓
test
  ↓
launch/exercise
  ↓
inspect failure
  ↓
fix
  ↓
repeat
```

Not:

```text
implement
  ↓
wait for Sidi
  ↓
Sidi discovers bug
```

## Use Git as the undo button

Have Codex commit coherent work.

If direction is bad:

> Compare the current state with commit X. Preserve independently valuable work, revert the problematic approach, and implement a simpler alternative.

## Separate threads by bounded responsibility

Eventually useful:

```text
MAIN / technical lead
MOBILE
LOCATION
TOUR FORMAT / COMPILER
AI PIPELINE
```

But do not parallelize heavily until interfaces are stable.

Parallel agents are helpful after architecture settles; before that they can multiply inconsistency.

---

# 43. Decisions that deserve human review

Sidi should review:
- what the experience should feel like;
- what counts as a stop;
- how much narration is desirable;
- map/routing vendor if contractual lock-in matters;
- major privacy decisions;
- whether live AI is worth added complexity;
- voice quality;
- source quality policy;
- whether a feature is genuinely useful;
- whether complexity is justified.

Sidi should generally not need to review:
- specific React hook structure;
- utility library selection;
- lint config;
- ordinary dependency versions;
- routine refactors;
- test implementation details;
- mechanical TypeScript choices.

The goal is to keep Sidi in the role of product owner, not junior engineer.

---

# 44. Potential architectural traps to resist

## Trap: build the AI agent first
Why bad:
- no stable output target;
- hard to distinguish content failures from app failures.

## Trap: live TTS
Why bad:
- latency;
- connectivity;
- repeated cost;
- inconsistent output.

## Trap: live LLM narration
Why bad:
- same issues, plus factual unpredictability.

## Trap: simple geofencing
Why bad:
- urban false positives/negatives.

## Trap: over-engineered map matching
Why bad:
- we already know the expected route;
- simpler projection + sequence context may be enough.

## Trap: optimize cost too early
Why bad:
- low-quality voice or content harms the experience much more than pennies saved.

## Trap: giant autonomous mega-agent
Why bad:
- hard to observe;
- hard to retry stages;
- one early wrong assumption propagates.

## Trap: too many microservices
Why bad:
- maintenance burden before scale.

## Trap: storing sources only as links
Why bad:
- pages change;
- provenance becomes hard to audit.

Store structured source metadata and minimally necessary evidence.

## Trap: polished UI before lifecycle reliability
Why bad:
- a beautiful app that dies when the screen locks is not a tour app.

---

# 45. Open questions / hypotheses to test

These should remain visible rather than being prematurely "solved."

## UX
- How much map visibility do users actually want while walking?
- Should default experience be screen-off/audio-first?
- How often should narration play between stops?
- What is the ideal stop length?
- How much silence feels intentional vs broken?
- Does auto-trigger feel magical or intrusive?
- How often do users manually override?

## GPS
- How accurate is route projection in dense London streets on the user's Pixel?
- How much persistence is needed before triggers feel late?
- Can heading be trusted enough at walking speeds to be useful?
- Is OS fused location sufficient without commercial map matching?
- How often do route crossings confuse the model?

## Content
- What ratio of iconic vs unexpected stops feels best?
- What makes AI narration feel generic?
- Which source types generate the richest stories?
- Is a tour-level narrative arc meaningfully better than independent stops?
- Do optional "tell me more" branches improve the experience?

## Voice
- Which voice remains pleasant after 60+ minutes?
- How much expressive direction helps before it becomes theatrical?
- How should foreign/local pronunciations be verified?

## AI
- How small/cheap can extraction and verification models be?
- Where does a stronger reasoning model materially improve output?
- How often do source conflicts require human judgment?
- What should automatically fail publication?

---

# 46. Future possibilities

Do not build these now, but leave room conceptually.

## Live questions
User asks:
> "Who was that statue of?"

Could answer from tour evidence first, broader web/AI second.

## Adaptive shortening
> "We only have 45 minutes now."

Recompute:
- remaining stops;
- route;
- narrative.

## Adaptive expansion
> "We're ahead of schedule. Add something weird."

## Group profiles
- adults;
- children;
- history enthusiast;
- architecture enthusiast;
- limited mobility.

## Weather adaptation
Prefer:
- covered arcades;
- indoor stops;
- shorter exposed legs.

## Dynamic closures
Live route refresh.

## Car trips
Story scheduler around upcoming maneuvers.

## Public sharing
User-generated/custom tours.

## Collaborative curation
Friends vote on themes/stops.

## Personal knowledge
"Don't tell me the standard Roman Empire basics; I know them."

---

# 47. Definition of a successful first prototype

The prototype is successful if:

1. Sidi can install it on Android.
2. A six-stop manually authored tour loads reliably.
3. The route is visible.
4. Audio sounds good.
5. Screen can lock and audio continues correctly.
6. Progress survives closing/reopening.
7. The app recognizes arrival at stops most of the time.
8. It does not frequently trigger the wrong stop.
9. Manual override is obvious when GPS is uncertain.
10. Debug logs make failures diagnosable.
11. The same recorded GPS trace can be replayed in automated tests.
12. The experience is pleasant enough that Sidi would actually choose to walk the tour.

Do not declare victory merely because "GPS triggered an MP3."

---

# 48. North-star technical test

A useful architectural question for almost every feature:

> If the server, LLM provider and TTS provider all disappeared while the user was halfway through a downloaded tour, could they still finish it?

For the core experience, the answer should generally be **yes**.

A second:

> If GPS became unreliable for ten minutes, could the user still enjoy and complete the tour manually?

Again, **yes**.

A third:

> If we swap TTS or routing vendors later, do we have to rewrite the app's domain model?

Ideally, **no**.

---

# 49. Immediate next action

1. Create the project folder/repository.
2. Open it in Codex.
3. Select Astra.
4. Run the bootstrap prompt above.
5. Do **not** let it build the app immediately.
6. Review the resulting:
   - PRODUCT.md
   - ARCHITECTURE.md
   - AGENTS.md
   - ROADMAP.md
7. Resolve only genuinely important product/architecture decisions.
8. Then authorize Milestone 1.
9. Keep this document in the parallel ChatGPT Work project as long-lived conceptual context.
10. Periodically reconcile this brief with the repo's authoritative architecture docs.

---

# 50. Final strategic view

This project is unusually well suited to AI-assisted development because the problem can be divided into strongly testable components.

The most important choices are not exotic model choices.

They are:

1. **separate generation from playback;**
2. **make tours offline packages;**
3. **make location confidence-based and route-aware;**
4. **preserve manual fallback;**
5. **make the location engine replayable;**
6. **make evidence a first-class data type;**
7. **route before writing;**
8. **generate TTS once;**
9. **use deterministic pipeline stages rather than one enormous agent;**
10. **teach Codex to test and document its own work.**

The biggest risk is not that this is technically impossible.

It is that too many interesting capabilities get built before the core walking experience is proven.

A deliberately narrow first prototype creates the foundation for a much more ambitious system later: personalized city walks, family tours, history trails, scenic drives, and eventually generated travel experiences whose content, route and narration all adapt to the person taking them.

The correct first benchmark is simple:

> Would I happily put my phone in my pocket and trust this thing to guide me around a place for an hour?

Build that first.

Everything else becomes much easier.
