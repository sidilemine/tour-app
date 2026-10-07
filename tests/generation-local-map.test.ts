import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {PublicTools} from '../tools/generation/factory/public-tools';
import {isMapEvidenceIdentity} from '../tools/generation/factory/local-map';
import {routingOptionsForPlan} from '../tools/generation/factory/pipeline';
import {createRetainedEvidenceTools} from '../tools/generation/factory/retained-evidence';
const sourceUrl='https://download.geofabrik.de/europe/united-kingdom/england/greater-london-261006.osm.pbf';
const center={latitude:51.5775,longitude:-.1468};
test('local dated map evidence serves real node/way queries, routing and retained review without network',async t=>{
 await mkdir('local-data',{recursive:true});const directory=await mkdtemp(resolve('local-data/local-map-test-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const snapshot={schemaVersion:1,sourceUrl,sourceSha256:'a'.repeat(64),sourceMd5:'b'.repeat(32),sourceBytes:1000,preparedAt:'2026-10-07T12:00:00Z',mapDataAt:'2026-10-06T20:00:00Z',bounds:[-.16,51.56,-.13,51.59],limitation:'Synthetic fixture; no field access evidence.',elements:[
  {type:'node',id:1,lat:51.5775,lon:-.1468,tags:{railway:'subway_entrance',name:'Fixture station'}},
  {type:'node',id:2,lat:51.5776,lon:-.1468,tags:{highway:'crossing',crossing:'traffic_signals'}},
  {type:'way',id:3,tags:{highway:'footway',access:'private'},geometry:[{lat:51.5775,lon:-.1468},{lat:51.5776,lon:-.1468}]},
  {type:'node',id:4,lat:51.58,lon:-.145,tags:{name:'Outside query'}}]};
 const path=join(directory,'map.json'),bytes=JSON.stringify(snapshot);await writeFile(path,bytes);
 const mapEvidence={path,sha256:createHash('sha256').update(bytes).digest('hex')};
 const tools=new PublicTools({directory:join(directory,'cache'),mapEvidence,fetch:async()=>{throw Error('Local query attempted network');},lookup:async()=>{throw Error('Local query attempted DNS');}});
 const map=await tools.mapFeatures(center,80),station=await tools.transportFeatures(center,80),crossing=await tools.crossingFeatures(center,80);
 assert.deepEqual(station.elements.map(e=>e.id),[1]);assert.ok(crossing.elements.some(e=>e.id===2));assert.ok(!map.elements.some(e=>e.id===4));assert.equal(map.elements.find(e=>e.id===3)?.tags?.access,'private');
 assert.equal(map.bodyHash,snapshot.sourceSha256);assert.equal(map.mapDataAt,snapshot.mapDataAt);assert.equal(map.physicalClearance,'unverified');assert.ok(isMapEvidenceIdentity(new URL(map.url)));
 const plan={title:'Synthetic',start:center,end:center,stopIds:['a','b','c','d'],selectionReason:'Synthetic',rejectedAlternatives:[],allowanceSeconds:480,walkingMetresPerSecond:1.2,routing:{preferMappedWalkways:true,throughByLeg:[{legId:'leg-1',points:[{point:center,sourceUrl:map.url,basis:'Actual retained vertex'}]}]}};
 const pages=new Map([[map.url,{text:map.text}]]);assert.equal(routingOptionsForPlan(plan,pages)?.throughByLeg[0].length,1);
 const reader=createRetainedEvidenceTools({research:{sources:[{id:'map',url:map.url,title:'Synthetic map',origin:'Fixture',passage:'OpenStreetMap mapped features only;',locator:'query'}]},pages,directory});assert.equal((await reader.readPage.run({url:map.url}) as {text:string}).text,map.text);
 await assert.rejects(tools.mapFeatures({latitude:51.59,longitude:-.1468},100),/extent/);
 await writeFile(path,bytes+' ');const changed=new PublicTools({directory:join(directory,'cache2'),mapEvidence});await assert.rejects(changed.mapFeatures(center,80),/changed after brief/);
 assert.equal(isMapEvidenceIdentity(new URL('https://evil.example/api/interpreter#query-'+'a'.repeat(64))),false);
});
