export type ExportDraft = { id: string; fileName: string; contents: string };
let lastStamp = 0;
export function makeExport(prefix: 'walking-fixture' | 'walking-diagnostics' | 'walking-test-results', value: unknown, now = Date.now()): ExportDraft {
  // Monotonic within this process even when the clock repeats or moves backwards.
  lastStamp = Math.max(now, lastStamp + 1);
  const id = new Date(lastStamp).toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 8);
  const contents = JSON.stringify(value, null, 2);
  if (contents === undefined) throw Error('No JSON content to export');
  return { id, fileName: `${prefix}-${id}.json`, contents };
}
export function jsonFileName(input: string) {
  const name = input.trim().replace(/\.json$/i, '');
  if (!/^[A-Za-z0-9][A-Za-z0-9 _.-]{0,119}$/.test(name) || name.endsWith('.') || name.includes('..')) throw Error('Use a filename starting with a letter or number, with only letters, numbers, spaces, hyphens, underscores or single dots (up to 120 characters).');
  return name + '.json';
}
export type SavePorts = {
  chooseFolder(): Promise<string | null>;
  createFile(folder: string, nameWithoutExtension: string): Promise<string>;
  write(uri: string, contents: string): Promise<void>;
  read(uri: string): Promise<string>;
  remove(uri: string): Promise<void>;
};
export async function saveToFolder(draft: ExportDraft, name: string, ports: SavePorts): Promise<boolean> {
  const fileName = jsonFileName(name);
  const folder = await ports.chooseFolder();
  if (!folder) return false; // Cancellation is not success, and creates nothing.
  const uri = await ports.createFile(folder, fileName.slice(0, -5));
  try {
    await ports.write(uri, draft.contents);
    if (await ports.read(uri) !== draft.contents) throw Error('Saved file did not match the export. Please retry.');
  } catch (error) {
    // Only the newly-created incomplete document is eligible for cleanup.
    try { await ports.remove(uri); } catch { /* Original records and the draft remain available for retry. */ }
    throw error;
  }
  return true;
}
