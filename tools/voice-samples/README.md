# Local Kokoro audition

Small authoring-only tool for the owner's Emma/George comparison. It changes no mobile dependencies, installed APK or versioned tour transport.

```sh
npm ci --prefix tools/voice-samples
npm run samples --prefix tools/voice-samples
```

Requires Node with native ONNX Runtime support and `ffmpeg`/`ffprobe` on PATH. Verified on this Apple Silicon Mac. The first run downloads the public model's pinned revision (~326 MB) into ignored `.cache/kokoro/`; later runs use those files locally. `kokoro-js` 1.2.1 includes the voice tensors and phonemizer; the separate npm lockfile pins all dependencies. No key, paid API, subscription, upload or playback is used.

The script renders the same first Tally Ho paragraph with `bf_emma` and `bm_george`, CPU/full precision, speed 1. It saves WAV intermediates under ignored `artifacts/voice-samples/`, and the two MP3s plus generation metadata under [the review folder](../../docs/content/voice-samples/README.md). Both MP3s use the same loudness target. Existing audition outputs are replaced when this command is deliberately rerun; preserve a dated copy before revising a reviewed sample.

Official sources: [Kokoro JavaScript implementation](https://github.com/hexgrad/kokoro/tree/main/kokoro.js), [original Apache-2.0 model](https://huggingface.co/hexgrad/Kokoro-82M), [ONNX conversion used](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX). Model and audio hashes are in the saved metadata. These are options, not an accepted voice or a production provider commitment.

## Selected tour renderer

Sidi selected **George (`bm_george`)**, retaining the audition's speed 1. `render-tour.mjs` supplies the current Finchley package preparer with local paragraph-level speech and a short paragraph pause. It verifies the cached model against the audition's recorded hashes, disables remote model loading and rejects actual phoneme sequences above the model's 512-token capacity before synthesis can truncate them. It records paragraph text and duration beside each generated file. No phone/runtime inference dependency is introduced.

After installing the authoring dependencies and caching the audition model, run the root `node --import tsx tools/prepare-finchley-tours.ts`. The George cache includes the voice/model/render settings in its identity and is separate from the earlier Daniel cache. The preparer publishes content version 2; do not modify that version after importing it without another version bump.
