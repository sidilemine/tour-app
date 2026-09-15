import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import catalog from './catalog.json';
import { bundledMapAssets } from './bundledAssets';
import { MapFiles, prepareMapFiles } from './files';

const files: MapFiles = {
  async info(uri) {
    // Android's legacy adapter attempts to open directories if md5 is true.
    const info = await FileSystem.getInfoAsync(uri, { md5: !uri.endsWith('/') });
    return info.exists ? { exists: true, bytes: info.size, md5: info.md5 } : { exists: false };
  },
  mkdir: uri => FileSystem.makeDirectoryAsync(uri, { intermediates: true }),
  remove: uri => FileSystem.deleteAsync(uri, { idempotent: true }),
  async copyAsset(path, to) {
    const asset = Asset.fromModule(bundledMapAssets[path]);
    await asset.downloadAsync(); // Embedded in release; Metro preparation in development.
    if (!asset.localUri) throw Error(`Bundled map asset unavailable: ${path}`);
    await FileSystem.copyAsync({ from: asset.localUri, to });
  },
  move: (from, to) => FileSystem.moveAsync({ from, to }),
};
let pending: Promise<string> | undefined;
export function prepareLocalMap(repair = false): Promise<string> {
  if (pending) return pending;
  if (!FileSystem.documentDirectory) return Promise.reject(Error('Local map storage unavailable'));
  pending = prepareMapFiles(files, `${FileSystem.documentDirectory}offline-maps/`, catalog.id, catalog.files, repair).finally(() => { pending = undefined; });
  return pending;
}
