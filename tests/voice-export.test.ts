import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { saveVoiceToFolder, VoiceCopyPorts } from '../src/feedback/voiceExport';

const original = 'file:///app/documents/recordings/private-note.m4a';
function fixture() {
  const contents = Buffer.from('synthetic recording bytes').toString('base64');
  const files = new Map([[original, contents], ['content://old-copy', 'earlier copy']]);
  const names: string[] = [], removed: string[] = [];
  const ports: VoiceCopyPorts = {
    documentDirectory: 'file:///app/documents/',
    chooseFolder: async () => 'content://selected-folder',
    createFile: async (_folder, name) => { names.push(name); const uri = `content://copy/${name}`; files.set(uri, ''); return uri; },
    inspect: async uri => {
      const bytes = Buffer.from(files.get(uri)!, 'base64');
      return { bytes: bytes.length, md5: createHash('md5').update(bytes).digest('hex') };
    },
    readBase64: async uri => files.get(uri)!,
    writeBase64: async (uri, value) => { files.set(uri, value); },
    remove: async uri => { removed.push(uri); files.delete(uri); },
  };
  return { contents, files, names, removed, ports };
}

test('voice copy creates fresh descriptive M4A files and verifies bytes and MD5 without touching originals', async () => {
  const f = fixture();
  const first = await saveVoiceToFolder(original, 'moss-hall', f.ports);
  const second = await saveVoiceToFolder(original, 'moss-hall', f.ports);
  assert.notEqual(first, second);
  assert.match(f.names[0], /^tour-feedback-moss-hall-\d{4}-.*-[a-z0-9]{7}\.m4a$/);
  assert.equal(f.files.get(first!), f.contents);
  assert.equal(f.files.get(original), f.contents);
  assert.equal(f.files.get('content://old-copy'), 'earlier copy');
  assert.deepEqual(f.removed, []);
});

test('cancel creates nothing and does not read private recording contents', async () => {
  const f = fixture(); f.ports.chooseFolder = async () => null;
  f.ports.readBase64 = async () => { throw Error('must not read'); };
  assert.equal(await saveVoiceToFolder(original, 'moss-hall', f.ports), null);
  assert.deepEqual(f.names, []); assert.deepEqual(f.removed, []);
});

test('rejects non-private, traversing, non-M4A paths and invalid story names before opening picker', async () => {
  const f = fixture(); f.ports.chooseFolder = async () => { throw Error('picker must not open'); };
  for (const uri of ['content://recording', 'file:///app/cache/a.m4a', 'file:///app/documents/../a.m4a', 'file:///app/documents/%2e%2e/a.m4a', 'file:///app/documents/a.json']) {
    await assert.rejects(saveVoiceToFolder(uri, 'moss-hall', f.ports), /private app documents/);
  }
  await assert.rejects(saveVoiceToFolder(original, '../location', f.ports), /Invalid story/);
});

test('truncation, same-length corruption, MD5 failure and failed writes remove only the new copy', async () => {
  for (const failure of ['truncated', 'corrupted', 'md5', 'write']) {
    const f = fixture(), read = f.ports.readBase64, inspect = f.ports.inspect;
    if (failure === 'write') f.ports.writeBase64 = async () => { throw Error('disk full'); };
    else if (failure === 'md5') f.ports.inspect = async uri => ({ ...await inspect(uri), ...(uri !== original ? { md5: '0'.repeat(32) } : {}) });
    else f.ports.readBase64 = async uri => uri === original ? read(uri) : failure === 'truncated' ? 'YQ==' : Buffer.alloc(Buffer.from(f.contents, 'base64').length, 0).toString('base64');
    await assert.rejects(saveVoiceToFolder(original, 'moss-hall', f.ports));
    assert.equal(f.removed.length, 1);
    assert.deepEqual([...f.files], [[original, f.contents], ['content://old-copy', 'earlier copy']]);
  }
});

test('fully read byte count handles content providers reporting an inaccurate available size', async () => {
  const f = fixture(), inspect = f.ports.inspect;
  f.ports.inspect = async uri => ({ ...await inspect(uri), ...(uri !== original ? { bytes: 0 } : {}) });
  assert.ok(await saveVoiceToFolder(original, 'moss-hall', f.ports));
});

test('source size mismatch creates no copy; cleanup failure preserves original error and recording', async () => {
  const f = fixture(), inspect = f.ports.inspect;
  f.ports.inspect = async uri => ({ ...await inspect(uri), bytes: 999 });
  await assert.rejects(saveVoiceToFolder(original, 'moss-hall', f.ports), /complete voice file/);
  assert.deepEqual(f.names, []);
  f.ports.inspect = inspect;
  f.ports.writeBase64 = async () => { throw Error('disk full'); };
  f.ports.remove = async () => { throw Error('cleanup denied'); };
  await assert.rejects(saveVoiceToFolder(original, 'moss-hall', f.ports), /disk full/);
  assert.equal(f.files.get(original), f.contents);
});
