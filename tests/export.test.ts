import test from 'node:test';
import assert from 'node:assert/strict';
import { makeExport, jsonFileName, saveToFolder, SavePorts } from '../src/export/jsonExport';
function fixture() {
  const draft = makeExport('walking-test-results', { attempts: [{ outcome: 'inconclusive' }] });
  const files = new Map([['old-document', 'earlier result']]), calls: string[] = [];
  const ports: SavePorts = {
    chooseFolder: async () => { calls.push('choose'); return 'local-folder'; },
    createFile: async (folder, name) => { calls.push(`create:${folder}/${name}`); files.set('new-document', ''); return 'new-document'; },
    write: async (uri, value) => { calls.push('write'); files.set(uri, value); },
    read: async uri => { calls.push('read'); return files.get(uri)!; },
    remove: async uri => { calls.push(`remove:${uri}`); files.delete(uri); },
  };
  return { draft, files, calls, ports };
}
test('default names differ for repeated or backwards clocks and freeze a JSON snapshot', () => {
  const value = { notes: 'original' };
  const first = makeExport('walking-test-results', value, 1000);
  const second = makeExport('walking-test-results', value, 1000);
  const third = makeExport('walking-test-results', value, 500);
  value.notes = 'changed after export opened';
  assert.equal(new Set([first.fileName, second.fileName, third.fileName]).size, 3);
  assert.equal(JSON.parse(first.contents).notes, 'original');
  for (const d of [first, second, third]) assert.equal(jsonFileName(d.fileName), d.fileName);
});
test('custom filename gets one JSON suffix and rejects paths or ambiguous names', () => {
  assert.equal(jsonFileName(' Walk 2 - paused.JSON '), 'Walk 2 - paused.json');
  assert.equal(jsonFileName('Walk 3'), 'Walk 3.json');
  for (const name of ['', '.json', '../private', '/secret', 'a/b', 'a\\b', 'a..b', 'name.', 'a\nfile', 'x'.repeat(121)]) assert.throws(() => jsonFileName(name));
});
test('validation and folder cancellation create nothing and preserve original records', async () => {
  const { draft, ports, calls, files } = fixture();
  await assert.rejects(saveToFolder(draft, '../invalid', ports)); assert.deepEqual(calls, []);
  ports.chooseFolder = async () => null;
  assert.equal(await saveToFolder(draft, 'valid', ports), false);
  assert.deepEqual(calls, []); assert.deepEqual([...files], [['old-document', 'earlier result']]);
});
test('save creates a new document and reports success only after exact readback', async () => {
  const { draft, ports, calls, files } = fixture();
  assert.equal(await saveToFolder(draft, 'Walk 2.json', ports), true);
  assert.deepEqual(calls, ['choose', 'create:local-folder/Walk 2', 'write', 'read']);
  assert.equal(files.get('new-document'), draft.contents); assert.equal(files.get('old-document'), 'earlier result');
});
test('provider-selected duplicate URI is used without changing the previous document', async () => {
  const { draft, ports, files } = fixture();
  files.set('folder/Walk.json', 'previous export');
  ports.createFile = async () => 'folder/Walk (1).json';
  await saveToFolder(draft, 'Walk', ports);
  assert.equal(files.get('folder/Walk.json'), 'previous export'); assert.equal(files.get('folder/Walk (1).json'), draft.contents);
});
test('failed writes and mismatched readback clean only the new document, and a draft can retry', async () => {
  for (const failure of ['write', 'readback']) {
    const { draft, ports, files } = fixture(), write = ports.write, read = ports.read;
    if (failure === 'write') ports.write = async () => { throw Error('disk full'); };
    else ports.read = async () => 'truncated';
    await assert.rejects(saveToFolder(draft, 'retry', ports));
    assert.deepEqual([...files], [['old-document', 'earlier result']]);
    ports.write = write; ports.read = read;
    assert.equal(await saveToFolder(draft, 'retry', ports), true);
    assert.equal(files.get('new-document'), draft.contents);
  }
});
test('picker or creation errors do not delete documents; cleanup failure keeps the original error', async () => {
  const { draft, ports, files, calls } = fixture();
  ports.createFile = async () => { throw Error('permission revoked'); };
  await assert.rejects(saveToFolder(draft, 'test', ports), /permission revoked/);
  assert.deepEqual(calls, ['choose']); assert.deepEqual([...files], [['old-document', 'earlier result']]);
  ports.chooseFolder = async () => { throw Error('picker unavailable'); };
  await assert.rejects(saveToFolder(draft, 'test', ports), /picker unavailable/);
  const next = fixture(); next.ports.write = async () => { throw Error('original write failure'); }; next.ports.remove = async () => { throw Error('cleanup failure'); };
  await assert.rejects(saveToFolder(next.draft, 'test', next.ports), /original write failure/);
  assert.equal(next.files.get('old-document'), 'earlier result');
});
