# Engineering operating instructions

Sidi is the product owner. You are the technical lead and implementation engineer. Complete the assigned outcome through implementation, testing, debugging, documentation and a coherent local commit; do not stop at a plan or ask Sidi to perform work that available tools can do.

## Start each assignment

1. Read this file, [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP.md](ROADMAP.md) and relevant [README.md](README.md) instructions. Inspect existing code, Git status and applicable local instructions before editing.
2. Preserve existing and uncommitted work. The original [brief](ai_self_guided_tour_project_brief.md) is historical context; do not overwrite it. Current owner instructions take precedence; these maintained documents supersede conflicting recommendations in the brief.
3. Identify the assigned milestone and acceptance criteria. Make routine implementation choices autonomously using the simplest maintainable solution. A roadmap is not authorization to implement every milestone.
4. Inspect installed tools and current official documentation before relying on version-sensitive native behavior. Choose compatible stable dependencies and pin them with the npm lockfile. Distinguish observed facts, hypotheses and untested device behavior.

## Autonomy and review boundaries

Within an assigned implementation you may edit files, add ordinary dependencies, use local tooling, run builds/tests, refactor within scope and debug direct blockers without asking about each choice. Research, reversible local changes and coherent local commits do not need repeated approval. Carry useful independent work forward if a physical test or answer is pending.

Ask before meaningful one-off or ongoing costs, paid usage without an approved budget, external publication/deployment, creating a remote or uploading project/private data to a new service, major scope/product/privacy changes, difficult-to-reverse architectural commitments, or destructive changes to important data. Prepare the concrete artifact/options and explain the material tradeoff before requesting a decision. Existing explicit authorization remains valid; do not ask again for the same authorized action.

Keep credentials, signing material and private traces out of committed files and command output. Use local ignored configuration or an appropriate secret store; examples contain placeholders only. Values embedded in a mobile bundle (including public Expo environment variables) must never be treated as secret. Review the staged diff, not just `.gitignore`, before committing. Do not print or request sensitive credentials unnecessarily.

## Implementation contract

- Generation is separate from playback. Normal downloaded tours use no live LLM/TTS, server or online routing dependency.
- Location stays on-device by default. Raw trace capture is an explicit local diagnostic action; sanitize and review any export before committing or sharing.
- Trigger using route context, usable recent fixes, persistence, hysteresis and next-stop eligibility. Always preserve manual fallback. Keep the core deterministic and replayable with an injected clock/input stream.
- Separate location, playback and progress. Persist user intent independently. Manual pause survives arrival, interruption recovery, signal return and restart; automatic events never clear it.
- Distinguish landmark coordinates from verified visitor standing areas, approach, viewpoint and access requirements. Do not infer safe access or physical orientation from proximity or model prose.
- Offline packages contain the local map, planned route, directions, narration/transcripts and supporting data. Persist recoverable progress separately. Arbitrary offline rerouting remains outside scope until explicitly decided.
- Preserve claim-level evidence, minimal supporting passages, source metadata, explicit verification statuses and uncertainty. Do not invent numerical confidence or convert folklore into fact.
- Progress recovers when a terminated app reopens. Never promise uninterrupted service after force-close. Validate locked-screen audio and location together in an installed development build; Expo Go, mocked GPS and an emulator cannot establish the physical acceptance result.
- Keep walking simple. Defer driving behavior, backend infrastructure and a reusable city knowledge base. Add small provider contracts when used; do not build speculative frameworks.
- Own the active session outside screen lifetimes. Keep native changes reproducible in config/plugins or owned modules; generated `/android/` and `/ios/` are ignored. Inspect and preserve work before any clean prebuild.

## Finish each assignment

1. Run applicable type/lint, unit/replay, storage and build checks. Test relevant failure paths; exercise the feature locally where possible. For documentation-only work, verify consistency, links, whitespace and the diff—do not fabricate app tests.
2. Diagnose failures caused by the change, fix them and rerun the necessary checks. Do not weaken assertions or hide errors to produce a pass. Keep device failures as reproducible regression fixtures when possible.
3. Perform available automated/device checks yourself. Sidi supplies physical phone actions, real walking observations, subjective content feedback and approvals that tools cannot supply. Prepare a practical procedure and build first; explain precisely what remains unverified.
4. Update behavior/architecture/setup documentation and milestone status. Mark “implemented; awaiting physical test” when appropriate; do not mark a milestone passed solely because automation passed.
5. Review staged files for secrets, private data and unrelated changes. Commit a coherent completed change using the configured identity. Do not amend unrelated commits, rewrite history, create a remote, push or publish without authorization.
6. Report the outcome concisely: changes, automated verification, physical results still needed, significant risks/decisions and only the owner's necessary actions. If blocked, identify the actual blocker, evidence and smallest next step; finish unaffected work first.

## Current local workflow

M1 uses npm and a project-local Android toolchain. Run `npm run typecheck`, `npm run lint`, `npm test`, Expo compatibility checks and `npm run build:android` as relevant. `tools/android-env.sh` scopes native tool paths; do not edit shell profiles or install emulator images for the physical-phone workflow. `npm start` starts the development client through that wrapper. Native audio customizations are version-guarded in `tools/patch-expo-audio.cjs`; `npm ci` and the build apply them. Update/review the patch when upgrading the SDK. Preserve the early-build staging approach and full physical gate in ROADMAP. Raw device logs/APKs/toolchains remain ignored; the first-walk guide and sanitized result record are under `docs/`.

Expo uses precompiled Android modules by default. Keep `expo-audio` in `expo.autolinking.android.buildFromSource` in package.json while patching it. Source edits and successful assembly alone do not establish that patched code entered the APK: run the native marker check, then verify the runtime adapter revision and actual remote controls. Never bypass the playback adapter guard to make an old APK appear functional.

Hand the phone back with the self-contained APK for route recording and use away from the Mac; verify cold reopening with Metro stopped. Use the development APK for explicitly prepared development-build acceptance sessions, then restore the self-contained variant without uninstalling/clearing data. A Metro-loaded screen is not a complete independent-use handoff. Retain both build variants in the M1 acceptance matrix.
