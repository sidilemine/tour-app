import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ExportDraft, jsonFileName, saveToFolder } from './jsonExport';
let lastFolder: string | null = null;
export function saveExport(draft: ExportDraft, name: string) {
  const saf = FileSystem.StorageAccessFramework;
  return saveToFolder(draft, name, {
    chooseFolder: async () => {
      const permission = await saf.requestDirectoryPermissionsAsync(lastFolder ?? saf.getUriForDirectoryInRoot('Documents'));
      if (!permission.granted) return null;
      lastFolder = permission.directoryUri; return lastFolder;
    },
    createFile: (folder, base) => saf.createFileAsync(folder, base, 'application/json'),
    write: (uri, contents) => FileSystem.writeAsStringAsync(uri, contents),
    read: uri => FileSystem.readAsStringAsync(uri),
    remove: uri => FileSystem.deleteAsync(uri, { idempotent: true }),
  });
}
export async function shareExport(draft: ExportDraft, name: string) {
  const fileName = jsonFileName(name);
  const directory = `${FileSystem.documentDirectory}exports/${draft.id}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const uri = directory + fileName;
  await FileSystem.writeAsStringAsync(uri, draft.contents);
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Share private export only where you intend' });
}
