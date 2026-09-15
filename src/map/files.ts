export type MapFile = { path: string; bytes: number; md5: string };
export interface MapFiles {
  info(uri: string): Promise<{ exists: boolean; bytes?: number; md5?: string }>;
  mkdir(uri: string): Promise<void>;
  remove(uri: string): Promise<void>;
  copyAsset(path: string, uri: string): Promise<void>;
  move(from: string, to: string): Promise<void>;
}

// One fixed, bundled map, not a user package importer. A directory is only
// published after readback succeeds. Repair affects this map copy alone.
export async function prepareMapFiles(fs: MapFiles, root: string, id: string, files: readonly MapFile[], repair = false): Promise<string> {
  if (!/^file:\/\//.test(root) || !/^[a-z0-9-]+$/.test(id)) throw Error('Invalid local map destination');
  for (const file of files) {
    if (file.path.startsWith('/') || file.path.includes('\\') || file.path.split('/').some(p => !p || p === '.' || p === '..')) throw Error('Invalid map asset path');
  }
  const target = `${root}${id}/`, staging = `${root}${id}.staging/`, previous = `${root}${id}.previous/`;
  async function verify(dir: string) {
    for (const file of files) {
      const info = await fs.info(dir + file.path);
      if (!info.exists || info.bytes !== file.bytes || info.md5 !== file.md5) throw Error(`Map file missing or damaged: ${file.path}`);
    }
  }
  // Recover a process death between moving the old copy aside and publishing.
  if (!(await fs.info(target)).exists && (await fs.info(previous)).exists) await fs.move(previous, target);
  if (!repair && (await fs.info(target)).exists) { await verify(target); await fs.remove(previous); await fs.remove(staging); return target; }
  await fs.remove(staging);
  let movedPrevious = false;
  try {
    await fs.mkdir(staging);
    for (const file of files) {
      const destination = staging + file.path;
      await fs.mkdir(destination.slice(0, destination.lastIndexOf('/') + 1));
      await fs.copyAsset(file.path, destination);
    }
    await verify(staging);
    // A failed copy/verification leaves the previous installation in place.
    if ((await fs.info(target)).exists) {
      await fs.remove(previous);
      await fs.move(target, previous);
      movedPrevious = true;
    }
    await fs.move(staging, target);
    await verify(target);
    await fs.remove(previous);
    return target;
  } catch (error) {
    if (movedPrevious && (await fs.info(previous)).exists) {
      await fs.remove(target);
      await fs.move(previous, target);
    }
    await fs.remove(staging).catch(() => undefined);
    throw error;
  }
}
