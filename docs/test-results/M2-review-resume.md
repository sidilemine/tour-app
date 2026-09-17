# Review completion resumes the tour

17 September 2026. Owner direction: saving/closing a story review should resume the tour, so each review does not leave later location arrivals silently held.

## Behaviour

- **Save review and resume tour**, including Android Back, stops note playback, finalises capture and saves the review before an explicit session `review-close` event.
- An active tour resumes the saved narration offset, or waits for the next eligible location if that story finished. A pending arrival still needs fresh usable position; completed stories are not replayed.
- Automatic-off remains off. An ended/unstarted/recovered inactive tour is not started by closing a review.
- Voice-note saving, score/text autosave, passive unmount, locking and backgrounding do not resume the tour. If explicit close finishes while the app is backgrounded, it leaves the hold in place.
- The button and tour help explain this behaviour. Immutable George v2 packages/audio are unchanged; current UI substitutes the old review-close instruction.

## Verification and delivery

TypeScript, lint and guide parity pass. **142 tests pass**, including saved-offset continuation, subsequent location arrival, ended-tour/automatic-off preservation and stale-position revalidation. The full suite also caught the previous guide-9 update's stale case-count assertion; the test now requires all 21 specific cases. This corrects that omission rather than weakening the coverage check.

Build source **`de251b0367a4c3b6`**, guide **10**. Both development and self-contained APKs assembled successfully. Native marker/permission checks passed; all 257 offline map files and both tours’ 12 audio entries match the expected bytes. No native API or dependency changed in this assignment; the previous microphone/Spotify implementation and its pending physical evidence remain separate.

The Pixel was disconnected during preparation. No installation or new audible result is claimed. Cluster a brief review-close/resumption observation into the already prepared EarFun/Spotify session; no repeat walk or full M1 matrix is requested. Existing location/offset checks remain reusable.
