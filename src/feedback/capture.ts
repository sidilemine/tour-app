import { ReviewStore, VoiceNote } from './model';

export type CapturePhase = 'idle' | 'starting' | 'recording' | 'stopping';
export type CapturePorts = {
  permission(): Promise<boolean>; mode(recording: boolean): Promise<void>;
  prepare(): Promise<string>; record(): void; stop(): Promise<void>;
  inspect(uri: string): Promise<{ bytes: number }>; durationMs(): number;
  foreground(): boolean; changed(phase: CapturePhase, message: string): void;
};
// Serialize permission/preparation with close/background. A delayed permission
// grant must never begin capture after the visitor has left the review.
export class FeedbackCapture {
  phase: CapturePhase = 'idle';
  private generation = 0;
  private starting: Promise<void> | null = null;
  private stopping: Promise<void> | null = null;
  private note: VoiceNote | null = null;
  private prepared = false;
  constructor(private reviews: ReviewStore, private reviewId: string, private ports: CapturePorts) {}
  start(): Promise<void> {
    if (this.phase !== 'idle' || this.starting || this.stopping) return Promise.resolve();
    const generation = ++this.generation;
    this.set('starting', 'Preparing microphone…');
    this.starting = this.begin(generation).finally(() => { this.starting = null; });
    return this.starting;
  }
  private async begin(generation: number) {
    const valid = () => generation === this.generation && this.ports.foreground();
    try {
      if (!await this.ports.permission()) { this.set('idle', 'Microphone permission was not granted. Your ratings are saved; a text note works too.'); return; }
      if (!valid()) { this.set('idle', 'Recording cancelled before it started.'); return; }
      await this.ports.mode(true);
      if (!valid()) { await this.ports.mode(false); this.set('idle', 'Recording cancelled before it started.'); return; }
      const uri = await this.ports.prepare(); this.prepared = true;
      if (!valid()) { await this.stopPrepared(); this.set('idle', 'Recording cancelled before it started.'); return; }
      const now = Date.now();
      this.note = { id: `${now}-${Math.random().toString(36).slice(2, 10)}`, uri, status: 'recording', createdAt: now, durationMs: 0, bytes: 0, error: null };
      this.reviews.voice(this.reviewId, this.note); // Persist actual URI before any capture.
      this.ports.record(); this.set('recording', 'Recording. Stop and save when ready.');
    } catch (error) {
      await this.stopPrepared();
      if (this.note) this.saveFailure(String(error));
      this.set('idle', `Recording did not start: ${String(error)}. Earlier feedback is unchanged.`);
    }
  }
  stop(reason: 'save' | 'background' | 'close' = 'save'): Promise<void> {
    ++this.generation;
    if (this.stopping) return this.stopping;
    this.stopping = this.finish(reason).finally(() => { this.stopping = null; });
    return this.stopping;
  }
  private async finish(reason: string) {
    if (this.starting) await this.starting;
    if (!this.note) { await this.stopPrepared(); return; }
    const note = this.note;
    this.set('stopping', 'Saving your voice note…');
    let durationMs = 0;
    try {
      durationMs = Math.max(0, this.ports.durationMs());
      await this.ports.stop(); this.prepared = false;
      const { bytes } = await this.ports.inspect(note.uri);
      if (!bytes) throw Error('The voice file is empty or missing.');
      this.reviews.voice(this.reviewId, { ...note, status: 'saved', durationMs, bytes, error: null });
      this.note = null;
      this.set('idle', reason === 'save' ? 'Voice note saved on this phone.' : 'Voice note stopped and saved. The tour remains paused.');
    } catch (error) {
      await this.stopPrepared();
      this.saveFailure(String(error));
      this.set('idle', `Voice save needs attention: ${String(error)}. Ratings and earlier notes remain saved.`);
    } finally { await this.ports.mode(false).catch(() => {}); }
  }
  private saveFailure(error: string) {
    if (!this.note) return;
    // Keep the URI for diagnosis/recovery; never delete a potentially useful file.
    try { this.reviews.voice(this.reviewId, { ...this.note, status: 'failed', error }); }
    catch { /* Last durable record already contains the URI and draft ratings. */ }
    this.note = null;
  }
  private async stopPrepared() {
    if (this.prepared) {
      try { await this.ports.stop(); } catch { /* May already be stopped by native lifecycle. */ }
      this.prepared = false;
    }
    await this.ports.mode(false).catch(() => {});
  }
  private set(phase: CapturePhase, message: string) { this.phase = phase; this.ports.changed(phase, message); }
}
