import { z } from 'zod';
import { Store } from '../storage/store';
import guide from './guide.json';
export { guide };
export type GuideCase = (typeof guide.cases)[number];
const context = z.object({ sourceId: z.string(), variant: z.enum(['development', 'offline-release']), model: z.string().nullable(), os: z.string().nullable(), fixtureKey: z.string().nullable(), walkStartedAt: z.number().nullable() }).strict();
const attempt = z.object({
  id: z.string(), caseId: z.string(), guideRevision: z.number().int(), startedAt: z.number(), finishedAt: z.number().nullable(),
  outcome: z.enum(['in-progress','observed-pass','observed-fail','inconclusive']), notes: z.string().max(6000), conditions: z.string().max(2000),
  start: context, finish: context.nullable(),
}).strict();
const schema = z.object({ version: z.literal(1), selectedCase: z.string().nullable(), active: attempt.nullable(), attempts: z.array(attempt).max(500) }).strict();
export type AttemptContext = z.infer<typeof context>;
export type Attempt = z.infer<typeof attempt>;
export type JournalState = z.infer<typeof schema>;
export type Outcome = Exclude<Attempt['outcome'], 'in-progress'>;
export function availability(item: GuideCase, variant: string): string | null {
  return item.build === 'either' || item.build === variant ? null : `Needs the ${item.build === 'development' ? 'prepared development' : 'self-contained'} build. You can read the steps here.`;
}
// Separate database / key from tour progress. No calls into the playback engine.
export class Journal {
  constructor(private store: Store) {}
  read(): JournalState {
    const saved = this.store.read<unknown>('test-guide');
    return saved === null ? { version: 1, selectedCase: null, active: null, attempts: [] } : schema.parse(saved);
  }
  private write(value: JournalState) { const checked = schema.parse(value); this.store.commit('test-guide', checked); return checked; }
  select(caseId: string | null) {
    if (caseId !== null && !guide.cases.some(c => c.id === caseId)) throw Error('Unknown test case');
    return this.write({ ...this.read(), selectedCase: caseId });
  }
  begin(caseId: string, at: number, current: AttemptContext) {
    const state = this.read(), item = guide.cases.find(c => c.id === caseId);
    if (!item) throw Error('Unknown test case');
    const reason = availability(item, current.variant); if (reason) throw Error(reason);
    if (state.active) throw Error('Save the current attempt result before beginning another.');
    if (state.attempts.length >= 500) throw Error('500 results retained. Export them and ask the engineer to archive safely before adding more.');
    return this.write({ ...state, selectedCase: caseId, active: {
      id: `${current.sourceId}-${at}-${state.attempts.length}`, caseId, guideRevision: guide.revision, startedAt: at, finishedAt: null,
      outcome: 'in-progress', notes: '', conditions: '', start: current, finish: null,
    } });
  }
  edit(fields: { notes?: string; conditions?: string }) {
    const state = this.read(); if (!state.active) throw Error('No attempt to edit');
    return this.write({ ...state, active: { ...state.active, ...fields } });
  }
  finish(outcome: Outcome, at: number, current: AttemptContext) {
    const state = this.read(); if (!state.active) throw Error('No active attempt');
    if (!state.active.notes.trim()) throw Error('Add a short observation before saving a result.');
    if (outcome === 'observed-pass' && (current.sourceId !== state.active.start.sourceId || current.variant !== state.active.start.variant || current.fixtureKey !== state.active.start.fixtureKey)) throw Error('Build or route changed during this attempt. Record it as inconclusive, then begin a new attempt.');
    const completed: Attempt = { ...state.active, outcome, finishedAt: at, finish: current };
    return this.write({ ...state, active: null, attempts: [...state.attempts, completed] });
  }
}
