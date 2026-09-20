import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { defaultMapId, mapArea } from './areas';
import { bundledAreaAssets } from './bundledAreas';
import { MapFiles, prepareMapFiles } from './files';

function mapFiles(mapId: string): MapFiles { return {
  async info(uri) {
    // Android's legacy adapter attempts to open directories if md5 is true.
    const info = await FileSystem.getInfoAsync(uri, { md5: !uri.endsWith('/') });
    return info.exists ? { exists: true, bytes: info.size, md5: info.md5 } : { exists: false };
  },
  mkdir: uri => FileSystem.makeDirectoryAsync(uri, { intermediates: true }),
  remove: uri => FileSystem.deleteAsync(uri, { idempotent: true }),
  async copyAsset(path, to) {
    const asset = Asset.fromModule(bundledAreaAssets[mapId][path]);
    await asset.downloadAsync(); // Embedded in release; Metro preparation in development.
    if (!asset.localUri) throw Error(`Bundled map asset unavailable: ${path}`);
    await FileSystem.copyAsync({ from: asset.localUri, to });
  },
  move: (from, to) => FileSystem.moveAsync({ from, to }),
}; }
const pending = new Map<string, Promise<string>>();
export async function prepareLocalMap(repair = false, mapId = defaultMapId): Promise<string> {
  if (pending.has(mapId)) return pending.get(mapId)!;
  if (!FileSystem.documentDirectory) return Promise.reject(Error('Local map storage unavailable'));
  const catalog = mapArea(mapId).catalog;
  const work = prepareMapFiles(mapFiles(mapId), `${FileSystem.documentDirectory}offline-maps/`, catalog.id, catalog.files, repair)
    .finally(() => { pending.delete(mapId); });
  pending.set(mapId, work);
  return work;
}
