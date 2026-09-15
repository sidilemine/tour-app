# M1 test clips

Prepared locally on 12 September 2026 from the original text below, using the Mac's installed Daniel voice (`say -v Daniel -r 145`), then encoded to AAC/M4A with FFmpeg at 64 kb/s. No paid TTS, network synthesis or playback-time generation. These are internal test assets, not the curated tour's final voice/content.

| Asset | Measured duration | Bytes |
| --- | --- | --- |
| a.m4a | 10.878 seconds | 94,668 |
| b.m4a | 11.122 seconds | 94,256 |
| c.m4a | 11.737 seconds | 100,894 |

A: “Stop A. The walking test has started. Let this clip finish, lock your phone, and walk your checked route. The next clip should play only when you arrive at stop B.”

B: “Stop B. This is the second arrival clip. If your phone remained locked through genuine silence, record that result after the walk. Continue on your checked route to stop C.”

C: “Stop C. You have reached the final test stop. When it is safe to stop, unlock your phone and export the diagnostics. One successful walk does not complete the test matrix.”

The clips make no claims about a particular place. They play once; the interval between files is genuine silence. Final tour voice selection and distribution rights remain a later content decision.

## Long A for the two timing edge cases

`edge-a.m4a` is a separate, single 209.982-second (3:30) recording, 1,807,722 bytes, made locally with the same Daniel voice/rate and AAC settings, with a small tempo adjustment to fit the requested duration. Its complete original text is in [edge-a.txt](edge-a.txt). It contains continuing diagnostic speech, not a silent keepalive or an audio loop. It is used only by an explicitly selected `audioProfile: "edge-long-a"` fixture. Normal A/B/C files are unchanged. It is not suitable for a genuine-silence baseline.

Revision 2, shortened at the owner’s request on 15 September. The durable filename is `edge-a-v2.m4a`; the prior v1 file is not overwritten or reused. The earlier 381.039-second recording and its field evidence remain in Git/history. Start a New walk after upgrading rather than resuming an offset from the older asset.

Reproduce locally with `say -v Daniel -r 145 -f assets/audio/edge-a.txt -o /tmp/tour-edge-a.aiff`, then encode that AIFF with FFmpeg (`-af atempo=0.951241119 -c:a aac -b:a 64k`) to a new output file. Do not overwrite assets without updating the asset revision and verifying duration.
