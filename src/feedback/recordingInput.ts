/** Versioned Android adapter; never labels a preferred device as the actual input. */
export type RecordingInputStatus = {
  revision: number; verified: boolean; kind: 'phone' | 'headset' | 'unknown' | 'other';
  name: string | null; interruption: string | null;
};
export type RecordingInputPorts = {
  startTourRecording(preferHeadset: boolean): void;
  getTourRecordingStatus(): RecordingInputStatus;
};
export function recordingAdapter(value: unknown): RecordingInputPorts {
  const adapter = value as Partial<RecordingInputPorts>;
  if (typeof adapter.startTourRecording !== 'function' || typeof adapter.getTourRecordingStatus !== 'function') {
    throw Error('This installed app needs the microphone update. No recording was started.');
  }
  return adapter as RecordingInputPorts;
}
export async function startVerifiedRecording(ports: RecordingInputPorts, preferHeadset: boolean,
  foreground: () => boolean, ready: (input: RecordingInputStatus) => void,
  wait: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 100))) {
  ports.startTourRecording(preferHeadset);
  for (let n = 0; n < 40; n++) {
    if (!foreground()) return; // Capture coordinator saves/cancels on close/background.
    const input = ports.getTourRecordingStatus();
    if (input.revision !== 1) throw Error('The installed microphone adapter needs updating.');
    if (input.interruption) throw Error(input.interruption);
    if (input.verified && (input.kind === 'phone' || input.kind === 'headset')) { ready(input); return; }
    await wait();
  }
  throw Error('Android could not confirm the selected microphone. Reconnect your headset or choose Phone microphone.');
}
