import { z } from 'zod';
import { Store } from '../storage/store';

const score = z.number().int().min(0).max(10).nullable();
export const voiceSchema = z.object({
  id: z.string().min(1), uri: z.string().startsWith('file://'),
  status: z.enum(['recording', 'saved', 'interrupted', 'failed']),
  createdAt: z.number(), durationMs: z.number().nonnegative(), bytes: z.number().nonnegative(),
  error: z.string().nullable(),
}).strict();
export const reviewSchema = z.object({
  id: z.string().min(1), tourId: z.string().min(1), tourVersion: z.number().int().positive(),
  storyId: z.string().min(1), storyTitle: z.string().min(1), storyIndex: z.number().int().nonnegative(),
  presentationSequence: z.number().int().positive(), createdAt: z.number(), updatedAt: z.number(),
  status: z.enum(['draft', 'saved']), heardBefore: z.boolean(),
  interest: score, placeValue: score, storytelling: score, text: z.string().max(8000),
  voices: z.array(voiceSchema),
}).strict();
export type Review = z.infer<typeof reviewSchema>;
export type VoiceNote = z.infer<typeof voiceSchema>;
export type ReviewContext = Pick<Review, 'tourId' | 'tourVersion' | 'storyId' | 'storyTitle' | 'storyIndex'>;
const reviewsSchema = z.array(reviewSchema);
const key = 'story-reviews-v1';
export class ReviewStore {
  constructor(private store: Store) {}
  all(): Review[] { return reviewsSchema.parse(this.store.read(key) ?? []); }
  create(context: ReviewContext, now = Date.now(), id = `${now}-${Math.random().toString(36).slice(2, 10)}`): Review {
    const all = this.all();
    if (all.some(r => r.id === id)) throw Error('Review already exists.');
    const review = reviewSchema.parse({ ...context, id, createdAt: now, updatedAt: now,
      presentationSequence: all.reduce((n, r) => Math.max(n, r.presentationSequence), 0) + 1,
      status: 'draft', heardBefore: false, interest: null, placeValue: null, storytelling: null, text: '', voices: [] });
    this.store.commit(key, [...all, review]); return review;
  }
  update(id: string, patch: Partial<Pick<Review, 'heardBefore' | 'interest' | 'placeValue' | 'storytelling' | 'text' | 'status'>>, now = Date.now()): Review {
    return this.change(id, r => ({ ...r, ...patch, updatedAt: now }));
  }
  voice(id: string, note: VoiceNote, now = Date.now()): Review {
    const validated = voiceSchema.parse(note);
    return this.change(id, r => ({ ...r, updatedAt: now, voices: [...r.voices.filter(v => v.id !== note.id), validated] }));
  }
  private change(id: string, change: (review: Review) => Review): Review {
    const all = this.all(), index = all.findIndex(r => r.id === id);
    if (index < 0) throw Error('Review no longer exists.');
    const next = reviewSchema.parse(change(all[index])); all[index] = next;
    this.store.commit(key, all); return next;
  }
}
export function exportReviews(reviews: Review[]) {
  return { schemaVersion: 1, kind: 'story-feedback', voiceNotePolicy: 'Audio stays in private app documents. This export contains ratings, text and voice metadata only; no audio or private file paths.',
    reviews: reviewsSchema.parse(reviews).map(({ voices, ...review }) => ({ ...review,
      voices: voices.map(({ uri: _uri, ...voice }) => voice),
    })) };
}
