// A voice preview has no tour/session commands and never acquires lockscreen controls.
export type VoicePreviewPlayer = { play(): void; pause(): void; release(): void; listen(done: (error?: string) => void): () => void };
export type VoicePlaybackPorts = {
  inspect(uri: string): Promise<unknown>; create(uri: string): VoicePreviewPlayer;
  foreground(): boolean; changed(id: string | null, message: string): void;
};
export class VoicePlayback {
  private generation = 0;
  private player: VoicePreviewPlayer | null = null;
  private unsubscribe: (() => void) | null = null;
  constructor(private ports: VoicePlaybackPorts) {}
  async play(id: string, uri: string) {
    this.stop();
    const generation = this.generation;
    this.ports.changed(id, 'Opening saved voice note…');
    try {
      await this.ports.inspect(uri);
      if (generation !== this.generation) return;
      if (!this.ports.foreground()) { this.stop(); return; }
      const player = this.ports.create(uri); this.player = player;
      this.unsubscribe = player.listen(error => {
        if (generation !== this.generation) return;
        this.stop();
        this.ports.changed(null, error ? `Voice note could not play: ${error}` : 'Voice note finished. The tour remains paused.');
      });
      player.play(); this.ports.changed(id, 'Playing your saved voice note. The tour remains paused.');
    } catch (error) {
      if (generation !== this.generation) return;
      this.stop(); this.ports.changed(null, `Voice note could not play: ${String(error)}. The original file is retained.`);
    }
  }
  stop() {
    ++this.generation;
    try { this.unsubscribe?.(); } catch { /* Still release the player if event teardown fails. */ }
    this.unsubscribe = null;
    const player = this.player; this.player = null;
    if (player) {
      try { player.pause(); } catch { /* May already be released by native teardown. */ }
      try { player.release(); } catch { /* No later command is sent to this player. */ }
    }
    this.ports.changed(null, 'Voice playback stopped. The tour remains paused.');
  }
}
