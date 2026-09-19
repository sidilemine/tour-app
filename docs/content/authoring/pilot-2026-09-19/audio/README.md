# Pilot listening samples

19 September 2026. Sidi requested the two pilot samples, one in George and one in the other auditioned voice, Emma. The engineer assigned George to artsdepot and Emma to the walking chapter. These are the main versions from the [review packet](../REVIEW-PACKET.md); the alternative ending/opening remain available for discussion.

| Recording | Voice | Measured duration | Transcript |
| --- | --- | ---: | --- |
| [Artsdepot](artsdepot-george.mp3) | Kokoro George (`bm_george`) | 123.650 s — about 2:04 | [317 words](artsdepot-george.txt) |
| [Alexandra Grove](alexandra-grove-emma.mp3) | Kokoro Emma (`bf_emma`) | 97.650 s — about 1:38 | [266 words, including the candidate direction](alexandra-grove-emma.txt) |

Both use the already cached free local Kokoro model, speed 1, full precision on CPU, 0.25-second gaps between rendering chunks, and a common −19 LUFS loudness target. Final MP3s are mono, 24 kHz, 96 kb/s. No subscription credits, external synthesis or automatic playback were used. Original AI-generated narration is for the owner's private review; model/runtime attribution and licences are retained in the [voice tool documentation](../../../../../tools/voice-samples/README.md).

The [metadata](metadata.json) records the exact source commit/hash, model reference, text/audio hashes, all spoken chunks and measured durations. It names the review-packet version **before** its timing annotations were updated. Full decoded files and combined chunk durations agree; all source words are supplied in order. These technical checks do not establish pronunciation or subjective delivery quality. The [subsequent owner response](../OWNER-FEEDBACK.md) records editorial feedback on both samples and duration; no new voice preference or pronunciation result is inferred. The generation metadata retains its original pre-listening status.

The first walking render stopped at the existing 512-token guard. Splitting the long estate paragraph after “separate building projects.” allowed it to render in full, adding one 0.25-second gap without editing the script. George's completed PCM was reused after checking its text and settings. The incomplete attempt is retained only in ignored local artifacts.

Actual Emma delivery is shorter than the writing estimate and the proposed 115–125-second target. This is a voice/pacing observation, not a reason to add filler or evidence of a walked result. The spoken Crescent direction remains a desk candidate with its exact pedestrian entry unresolved; this listening sample is not an installed route update.

[Reproduction instructions](../../../../../tools/voice-samples/README.md#agent-pilot-listening-samples). No phone check or app build was needed.
