import { z } from 'zod';
import { Fixture, parseFixture } from '../domain/fixture';
import { narrationAt } from '../domain/narration';
import { defaultMapId, mapArea } from '../map/areas';
import { Store } from '../storage/store';

export const transportSchema = z.object({
  format: z.literal('walking-tour-package'), version: z.literal(1),
  mapId: z.string().refine(id => { try { mapArea(id); return true; } catch { return false; } }, 'Offline map is not bundled'), fixture: z.unknown(),
  assets: z.array(z.object({ key: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/), base64: z.string().min(4).max(28_000_000).regex(/^[A-Za-z0-9+/]*={0,2}$/) }).strict()).min(3).max(16),
}).strict();
export type TourTransport = z.infer<typeof transportSchema>;
export function parseTourPackage(value: unknown): TourTransport & { fixture: Fixture } {
  const p = transportSchema.parse(value);
  const fixture = parseFixture(JSON.stringify(p.fixture));
  if (!fixture.narration) throw Error('A tour package needs narration and directions.');
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(fixture.id)) throw Error('Invalid package ID.');
  const expected = [...fixture.narration.stories, ...fixture.narration.chapters].map(s => s.audio);
  if (p.assets.length !== expected.length || new Set(p.assets.map(a => a.key)).size !== p.assets.length) throw Error('Missing or repeated tour audio.');
  for (const a of expected) {
    const encoded = p.assets.find(item => item.key === a.key);
    if (!encoded || encoded.base64.length % 4 !== 0) throw Error(`Missing/invalid audio: ${a.key}`);
    const padding = encoded.base64.endsWith('==') ? 2 : encoded.base64.endsWith('=') ? 1 : 0;
    if (encoded.base64.length * 3 / 4 - padding !== a.bytes) throw Error(`Audio size mismatch: ${a.key}`);
    // Reject mislabeled formats before writing a file named .m4a. Header
    // inspection is not a decoder test; readback hashes still check every byte.
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const head: number[] = [];
    for (let i = 0; i < Math.min(16, encoded.base64.length); i += 4) {
      const bits = alphabet.indexOf(encoded.base64[i]) * 262144 + alphabet.indexOf(encoded.base64[i + 1]) * 4096
        + Math.max(0, alphabet.indexOf(encoded.base64[i + 2])) * 64 + Math.max(0, alphabet.indexOf(encoded.base64[i + 3]));
      head.push((bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
    }
    if (a.bytes < 16 || String.fromCharCode(...head.slice(4, 8)) !== 'ftyp'
      || !['M4A ', 'M4B ', 'isom', 'iso2', 'mp41', 'mp42'].includes(String.fromCharCode(...head.slice(8, 12)))) throw Error(`Unsupported audio container: ${a.key}`);
    const tail = alphabet.indexOf(encoded.base64[encoded.base64.length - padding - 1]);
    if ((padding === 2 && (tail & 15) !== 0) || (padding === 1 && (tail & 3) !== 0)) throw Error(`Non-canonical audio encoding: ${a.key}`);
  }
  for (const story of [...fixture.narration.stories, ...fixture.narration.chapters]) {
    const sources = new Set(story.sources.map(source => source.url));
    for (const evidence of story.evidence) {
      if (!evidence.paragraph.trim() || !story.transcript.includes(evidence.paragraph)) throw Error(`Evidence paragraph is absent from transcript: ${story.id}`);
      if (evidence.kind !== 'editorial' && !evidence.sourceUrls.length) throw Error(`Historical evidence needs sources: ${story.id}`);
      if (evidence.sourceUrls.some(url => !sources.has(url))) throw Error(`Unknown evidence source: ${story.id}`);
    }
  }
  const [west, south, east, north] = mapArea(p.mapId).catalog.bounds;
  for (const point of [...fixture.route, ...fixture.stops.map(stop => stop.standing)]) if (point.latitude < south || point.latitude > north || point.longitude < west || point.longitude > east) throw Error('Tour exceeds the installed offline map.');
  return { ...p, fixture };
}
export interface TourFiles {
  write(path: string, base64: string): Promise<void>;
  inspect(path: string): Promise<{ bytes: number; md5: string }>;
}
// All files verified before the caller publishes the catalogue entry. Failed
// staging leaves the previous version and its progress reachable.
export async function stageTour(p: ReturnType<typeof parseTourPackage>, directory: string, files: TourFiles) {
  for (let i = 0; i < p.assets.length; i++) {
    const story = narrationAt(p.fixture, i)!;
    const a = p.assets.find(a => a.key === story.audio.key)!;
    const path = `${directory}${a.key}.m4a`;
    await files.write(path, a.base64);
    const actual = await files.inspect(path);
    if (actual.bytes !== story.audio.bytes || actual.md5 !== story.audio.md5) throw Error(`Corrupt audio: ${story.title}`);
  }
}

// Entries saved before the second area have no mapId and refer to Finchley.
export type LibraryEntry = { fixture: Fixture; directory: string; importedAt: string; mapId?: string };
export function assertTourVersion(entries: LibraryEntry[], fixture: Fixture, mapId = defaultMapId) {
  const same = entries.find(entry => entry.fixture.id === fixture.id && entry.fixture.version === fixture.version);
  if (same && (JSON.stringify(same.fixture) !== JSON.stringify(fixture) || (same.mapId ?? defaultMapId) !== mapId)) throw Error('This ID/version already names different content. Use a new version.');
}
// Read immediately before the synchronous publish so concurrent staging cannot
// overwrite a tour imported while its files were being prepared.
export function publishTour(store: Pick<Store, 'read' | 'commit'>, entry: LibraryEntry) {
  const latest = store.read<LibraryEntry[]>('catalogue') ?? [];
  mapArea(entry.mapId ?? defaultMapId);
  assertTourVersion(latest, entry.fixture, entry.mapId);
  store.commit('catalogue', [...latest.filter(previous => previous.fixture.id !== entry.fixture.id || previous.fixture.version !== entry.fixture.version), entry]);
}
