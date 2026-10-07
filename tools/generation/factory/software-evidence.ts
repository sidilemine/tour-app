/** Local asset evidence only; never claims new native rendering or physical playback. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mapArea } from '../../../src/map/areas';

export function inspectBundledMap(mapId:string){
 const {catalog,assetRoot}=mapArea(mapId);
 for(const file of catalog.files){
  const path=(file.path.startsWith('fonts/')?'assets/maps/north-finchley/':assetRoot)+file.path,bytes=readFileSync(path);
  assert.equal(bytes.length,file.bytes,`Bundled map file size: ${file.path}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,`Bundled map file hash: ${file.path}`);
 }
 return {recordedAt:new Date().toISOString(),savedMap:{id:catalog.id,bounds:catalog.bounds,filesVerified:catalog.files.length,mainAsset:catalog.files[0],catalogSha256:createHash('sha256').update(JSON.stringify(catalog)).digest('hex'),checks:'Actual local file sizes and SHA256 match the bundled catalog; route bounds checked separately',nativeRendering:'No new phone result; existing unchanged player/map implementation'},manualControls:{status:'Existing player functionality',basis:'TourPlayer exposes visual introduction before Start, Next directions at each stop, finish instructions after the last stop and manual story selection; package parser verifies the new data fields',limits:'No new native listening or outdoor result'},audioContract:'Only story/chapter paragraphs are rendered audio. Introduction, directions and finish are visual text. Synthesis and complete decode/duration checks happen after content approval.'};
}
