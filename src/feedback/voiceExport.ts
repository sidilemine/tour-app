type VoiceInfo = { bytes: number; md5: string };
export type VoiceCopyPorts = {
  documentDirectory: string | null;
  chooseFolder(): Promise<string | null>;
  createFile(folder: string, fileName: string): Promise<string>;
  inspect(uri: string): Promise<VoiceInfo>;
  readBase64(uri: string): Promise<string>;
  writeBase64(uri: string, contents: string): Promise<void>;
  remove(uri: string): Promise<void>;
};

let lastStamp = 0;
let lastFolder: string | null = null;
function voiceFileName(storyId: string) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(storyId)) throw Error('Invalid story identifier.');
  lastStamp = Math.max(Date.now(), lastStamp + 1);
  const stamp = new Date(lastStamp).toISOString().replace(/[:.]/g, '-');
  const suffix = Math.floor(Math.random() * 0x100000000).toString(36).padStart(7, '0');
  return `tour-feedback-${storyId}-${stamp}-${suffix}.m4a`;
}
function base64Bytes(value: string) {
  if (!value.length || value.length % 4 || /[^A-Za-z0-9+/=]/.test(value) || !/^[^=]*={0,2}$/.test(value)) {
    throw Error('Voice file could not be read completely.');
  }
  return value.length / 4 * 3 - (value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0);
}

/** Save a verified copy; cancellation and failure never modify the private recording. */
export async function saveVoiceToFolder(uri: string, storyId: string, ports: VoiceCopyPorts): Promise<string | null> {
  const directory = ports.documentDirectory;
  const decoded = decodeURIComponent(uri);
  if (!directory || !uri.startsWith(directory) || !uri.startsWith('file://') ||
      !decoded.startsWith(decodeURIComponent(directory)) || decoded.split('/').some(part => part === '..' || part === '.') ||
      decoded.includes('\\') || !decoded.endsWith('.m4a')) throw Error('Voice note is not an M4A file in private app documents.');
  const fileName = voiceFileName(storyId);
  const folder = await ports.chooseFolder();
  if (!folder) return null;
  const source = await ports.inspect(uri);
  const contents = await ports.readBase64(uri);
  if (source.bytes <= 0 || source.bytes !== base64Bytes(contents) || !/^[a-f0-9]{32}$/i.test(source.md5)) {
    throw Error('No complete voice file was found.');
  }
  const destination = await ports.createFile(folder, fileName);
  if (destination === uri) throw Error('The destination must be a new copy.');
  try {
    await ports.writeBase64(destination, contents);
    const readback = await ports.readBase64(destination);
    const saved = await ports.inspect(destination);
    // Android content providers can report an inaccurate stream.available() size.
    // Count the fully read bytes, and also check the native full-stream MD5.
    if (base64Bytes(readback) !== source.bytes || readback !== contents || saved.md5.toLowerCase() !== source.md5.toLowerCase()) {
      throw Error('Saved voice copy did not match the recording. Please retry.');
    }
  } catch (error) {
    try { await ports.remove(destination); } catch { /* Preserve the useful error and the original recording. */ }
    throw error;
  }
  return destination;
}

/** Call only from the owner's explicit Save voice copy action. */
export async function saveVoiceCopy(uri: string, storyId: string): Promise<string | null> {
  const FileSystem = await import('expo-file-system/legacy');
  const saf = FileSystem.StorageAccessFramework;
  return saveVoiceToFolder(uri, storyId, {
    documentDirectory: FileSystem.documentDirectory,
    chooseFolder: async () => {
      const permission = await saf.requestDirectoryPermissionsAsync(lastFolder ?? saf.getUriForDirectoryInRoot('Documents'));
      if (!permission.granted) return null;
      lastFolder = permission.directoryUri;
      return lastFolder;
    },
    createFile: (folder, fileName) => saf.createFileAsync(folder, fileName, 'audio/mp4'),
    inspect: async file => {
      const info = await FileSystem.getInfoAsync(file, { md5: true });
      if (!info.exists || info.isDirectory || !info.md5) throw Error('Voice file could not be verified.');
      return { bytes: info.size, md5: info.md5 };
    },
    readBase64: file => FileSystem.readAsStringAsync(file, { encoding: FileSystem.EncodingType.Base64 }),
    writeBase64: (file, contents) => FileSystem.writeAsStringAsync(file, contents, { encoding: FileSystem.EncodingType.Base64 }),
    remove: file => FileSystem.deleteAsync(file, { idempotent: true }),
  });
}
