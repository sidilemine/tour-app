import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { Store } from '../storage/store';
import { Fixture } from '../domain/fixture';
import { narrationAt } from '../domain/narration';
import { assertTourVersion, LibraryEntry, parseTourPackage, publishTour, stageTour } from './package';
import { prepareLocalMap } from '../map/localMap';
export type { LibraryEntry } from './package';

let storage: Store | undefined;
function db() { return storage ??= new Store(SQLite.openDatabaseSync('tour-library.db')); }
export function tourLibrary(): LibraryEntry[] { return db().read<LibraryEntry[]>('catalogue') ?? []; }
export async function importTour(value: unknown): Promise<Fixture> {
  const p = parseTourPackage(value);
  assertTourVersion(tourLibrary(), p.fixture);
  if (!FileSystem.documentDirectory) throw Error('Local tour storage unavailable.');
  const directory = `${FileSystem.documentDirectory}tour-packages/${p.fixture.id}-${p.fixture.version}-${Date.now()}-${Math.random().toString(36).slice(2)}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  try {
    await stageTour(p, directory, {
      write: (path, base64) => FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 }),
      inspect: async path => {
        const info = await FileSystem.getInfoAsync(path, { md5: true });
        if (!info.exists || !info.md5) throw Error('Audio readback failed.');
        return { bytes: info.size, md5: info.md5 };
      },
    });
    await prepareLocalMap();
    publishTour(db(), { fixture: p.fixture, directory, importedAt: new Date().toISOString() });
    // Older data remains recoverable. Orphan stage cleanup can wait until there
    // is real storage pressure; never delete a working version during import.
    return p.fixture;
  } catch (error) {
    await FileSystem.deleteAsync(directory, { idempotent: true }).catch(() => {});
    throw error;
  }
}
function exactEntry(fixture: Fixture): LibraryEntry {
  const entry = tourLibrary().find(e => e.fixture.id === fixture.id && e.fixture.version === fixture.version);
  if (!entry || JSON.stringify(entry.fixture) !== JSON.stringify(fixture)) throw Error('Import this exact tour version before playing.');
  return entry;
}
export function tourAudioProfile(fixture: Fixture): string { return exactEntry(fixture).directory; }
export async function tourAudio(fixture: Fixture): Promise<string[]> {
  const entry = exactEntry(fixture);
  const count = fixture.stops.length + (fixture.narration?.chapters.length ?? 0), result: string[] = [];
  for (let i = 0; i < count; i++) {
    const audio = narrationAt(fixture, i)!.audio, uri = `${entry.directory}${audio.key}.m4a`;
    const info = await FileSystem.getInfoAsync(uri, { md5: true });
    if (!info.exists || info.size !== audio.bytes || info.md5 !== audio.md5) throw Error('Tour audio is missing or damaged. Re-import the same package to repair it.');
    result.push(uri);
  }
  return result;
}
