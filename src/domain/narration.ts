import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
export const audioAssetSchema = z.object({
  key: id, bytes: z.number().int().positive().max(20_000_000),
  md5: z.string().regex(/^[a-f0-9]{32}$/), durationSeconds: z.number().positive().max(1800),
}).strict();
export const storySchema = z.object({
  id, title: z.string().min(1).max(160), transcript: z.string().min(1).max(20000),
  audio: audioAssetSchema,
  sources: z.array(z.object({ title: z.string().min(1), url: z.string().url().refine(s => /^https?:\/\//.test(s)) }).strict()).min(1),
  evidence: z.array(z.object({ paragraph: z.string().min(1), kind: z.enum(['source_checked', 'supported_reconstruction', 'editorial']), basis: z.string().min(1), sourceUrls: z.array(z.string().url()) }).strict()).min(1),
  directions: z.array(z.string().min(1).max(1500)).max(20),
}).strict();
export const narrationSchema = z.object({
  description: z.string().min(1).max(2000),
  introduction: z.string().min(1).max(4000),
  finishInstructions: z.string().min(1).max(2000),
  reviewNote: z.string().min(1).max(4000),
  rightsNote: z.string().min(1).max(4000),
  stories: z.array(storySchema).min(3).max(12),
  chapters: z.array(storySchema.extend({
    afterStopIndex: z.number().int().nonnegative(),
    startRouteIndex: z.number().int().nonnegative(),
    endRouteIndex: z.number().int().nonnegative(),
  })).max(4),
}).strict();
export type Story = z.infer<typeof storySchema>;
export type Narration = z.infer<typeof narrationSchema>;
// Native playback indices share the stop slots followed by walking chapters.
// A chapter is never added to the physical stop list or arrival eligibility.
export function narrationAt(fixture: { narration?: Narration; stops: unknown[] }, index: number): Story | undefined {
  return index < fixture.stops.length ? fixture.narration?.stories[index] : fixture.narration?.chapters[index - fixture.stops.length];
}
