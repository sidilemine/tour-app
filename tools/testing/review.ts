import { z } from 'zod';
import { isDeepStrictEqual } from 'node:util';
import { parseFixture } from '../../src/domain/fixture';
import { replay, Transition } from '../../src/domain/replay';
const context = z.object({ sourceId: z.string(), fixtureKey: z.string().nullable() });
const attemptSchema = z.object({ id: z.string(), caseId: z.string(), startedAt: z.number().finite(), finishedAt: z.number().finite(), outcome: z.enum(['observed-pass','observed-fail','inconclusive']), start: context, finish: context });
const date = z.string().refine(s => Number.isFinite(Date.parse(s)));
const resultsSchema = z.object({ schemaVersion: z.literal(1), exportedAt: date, journal: z.object({ attempts: z.array(z.unknown()), active: z.unknown().optional() }) });
const diagnosticsSchema = z.object({ schemaVersion: z.literal(1), exportedAt: date, build: z.object({ sourceId: z.string() }), fixture: z.unknown(), events: z.array(z.object({ kind: z.string() }).passthrough()) });
export function reviewExports(inputs: { name: string; value: unknown }[]) {
  const errors: { file: string; reason: string }[] = [], ignored: string[] = [], resultFiles: string[] = [];
  const attempts = new Map<string, { data: z.infer<typeof attemptSchema>; raw: unknown; files: string[]; conflict: boolean }>();
  const diagnostics: { file: string; sourceId: string; fixtureKey: string; exportedAt: number; replay: 'reproduced' | 'failed' | 'no-transitions'; transitions: number; segments: number | null; times: number[] }[] = [];
  let unfinishedSnapshots = 0;
  for (const { name, value } of inputs) {
    if (!value || typeof value !== 'object') { ignored.push(name); continue; }
    if ('journal' in value) {
      const parsed = resultsSchema.safeParse(value);
      if (!parsed.success) { errors.push({ file: name, reason: 'Invalid test-results envelope' }); continue; }
      resultFiles.push(name);
      if (parsed.data.journal.active) unfinishedSnapshots++;
      for (const raw of parsed.data.journal.attempts) {
        const parsedAttempt = attemptSchema.safeParse(raw);
        if (!parsedAttempt.success || parsedAttempt.data.finishedAt < parsedAttempt.data.startedAt) { errors.push({ file: name, reason: 'Invalid completed attempt' }); continue; }
        const a = parsedAttempt.data, prior = attempts.get(a.id);
        if (prior) { prior.files.push(name); prior.conflict ||= !isDeepStrictEqual(prior.raw, raw); }
        else attempts.set(a.id, { data: a, raw, files: [name], conflict: false });
      }
    } else if ('events' in value || 'build' in value) {
      try {
        const d = diagnosticsSchema.parse(value), f = parseFixture(JSON.stringify(d.fixture));
        const entries = d.events.filter(e => e.kind === 'transition') as unknown as Transition[];
        let status: 'reproduced' | 'failed' | 'no-transitions' = 'no-transitions', segments: number | null = null;
        if (entries.length) {
          try { segments = replay(f, entries).segments; status = 'reproduced'; }
          catch { status = 'failed'; errors.push({ file: name, reason: 'Replay failed: inspect privately with the original build/policy' }); }
        }
        diagnostics.push({ file: name, sourceId: d.build.sourceId, fixtureKey: `${f.id}@${f.version}`, exportedAt: Date.parse(d.exportedAt), replay: status, transitions: entries.length, segments,
          times: entries.map(e => e.event?.at).filter(t => typeof t === 'number' && Number.isFinite(t)) });
      } catch { errors.push({ file: name, reason: 'Invalid diagnostic envelope or fixture' }); }
    } else ignored.push(name); // A saved route fixture is not a test-results export.
  }
  return {
    interpretation: 'Evidence intake only. Candidate logs and successful replay do not establish audibility, locked-screen duration, complete log coverage or physical acceptance. Review notes and native logs separately. Times and filenames remain private.',
    resultFiles, ignored, errors, unfinishedSnapshots,
    diagnostics: diagnostics.map(({ times, ...d }) => ({ ...d, firstTransitionAt: times.length ? times.reduce((a, b) => Math.min(a, b)) : null, lastTransitionAt: times.length ? times.reduce((a, b) => Math.max(a, b)) : null })),
    attempts: [...attempts.values()].map(({ data: a, files, conflict }) => {
      const contextChanged = a.start.sourceId !== a.finish.sourceId || a.start.fixtureKey !== a.finish.fixtureKey;
      const candidates = conflict || contextChanged ? [] : diagnostics.filter(d => d.sourceId === a.start.sourceId && d.fixtureKey === a.start.fixtureKey && d.exportedAt >= a.finishedAt && d.times.some(t => t >= a.startedAt && t <= a.finishedAt));
      return { id: a.id, caseId: a.caseId, outcome: a.outcome, startedAt: a.startedAt, finishedAt: a.finishedAt, files,
        conflict, contextChanged, candidateDiagnostics: candidates.map(d => d.file), reviewRequired: true,
        warnings: [conflict ? 'Conflicting copies of the same completed attempt' : '', contextChanged ? 'Build or fixture changed during attempt' : '', candidates.length ? '' : 'No diagnostic candidate overlaps this attempt with matching source/fixture', candidates.some(d => d.replay !== 'reproduced') ? 'Candidate replay is not reproduced' : ''].filter(Boolean) };
    }),
  };
}
