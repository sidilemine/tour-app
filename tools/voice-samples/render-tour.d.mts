export const voiceConfig: Readonly<{ provider: string; voice: string; model: string; revision: string; dtype: string; device: string; speed: number; kokoroJs: string; paragraphGapSeconds: number; loudnessLufs: number; encoding: string; rendererRevision: number }>;
export function renderGeorge(text: string, destination: string): Promise<void>;
export function closeRenderer(): Promise<void>;
