// Invalidate an asynchronous play/seek when a later user hold arrives.
// The gate is independent of persistent policy: a later explicit Manual Play
// is allowed, but an earlier Manual Play must not erase a later queued Pause.
export class PlayGate {
  private epoch = 0;
  receive(type: string) {
    if (type === 'pause' || type === 'end') this.epoch++;
    return this.epoch;
  }
  allows(requestEpoch: number) { return requestEpoch === this.epoch; }
}
