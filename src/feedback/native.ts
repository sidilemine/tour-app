import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Store } from '../storage/store';
import { ReviewStore } from './model';
let repository: ReviewStore | null = null;
export function feedbackStore() {
  repository ??= new ReviewStore(new Store(SQLite.openDatabaseSync('walking-feedback.db')));
  return repository;
}
export async function inspectVoice(uri: string) {
  if (!FileSystem.documentDirectory || !uri.startsWith(FileSystem.documentDirectory)) throw Error('Voice note is not in private app documents.');
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || info.isDirectory || info.size <= 0) throw Error('No complete voice file was found.');
  return { bytes: info.size };
}
export async function recoverInterruptedNotes(store: ReviewStore) {
  for (const review of store.all()) for (const voice of review.voices) {
    if (voice.status !== 'recording') continue;
    // A process death may leave an unfinalized media file. Preserve it without
    // claiming successful recording or automatically playing private speech.
    const info = await inspectVoice(voice.uri).catch(() => ({ bytes: 0 }));
    store.voice(review.id, { ...voice, status: 'interrupted', bytes: info.bytes,
      error: info.bytes ? 'Interrupted recording retained; playability is unverified.' : 'Recording interrupted before a usable file was confirmed.' });
  }
}
