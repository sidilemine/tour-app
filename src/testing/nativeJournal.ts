import * as SQLite from 'expo-sqlite';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Store } from '../storage/store';
import { Journal, guide, AttemptContext } from './journal';
import build from '../buildInfo.json';
import { getSnapshot } from '../session/session';
let journal: Journal | null = null;
export function getJournal() { return journal ??= new Journal(new Store(SQLite.openDatabaseSync('walking-tests.db'))); }
export function currentContext(): AttemptContext {
  const { fixture, state } = getSnapshot();
  return { sourceId: build.sourceId, variant: __DEV__ ? 'development' : 'offline-release', model: Device.modelName, os: Device.osVersion,
    fixtureKey: fixture ? `${fixture.id}@${fixture.version}` : null, walkStartedAt: state.startedAt ?? null };
}
export async function exportTestResults() {
  const path = `${FileSystem.documentDirectory}walking-test-results.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), guideRevision: guide.revision,
    interpretation: 'User observations only; physical acceptance requires diagnostic and engineer review.', current: currentContext(), journal: getJournal().read() }, null, 2));
  await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Private test observations — save with your diagnostics' });
}
