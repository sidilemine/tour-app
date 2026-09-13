import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, symlinkSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { checkPackage, TourPackage } from '../tools/content/package';
function sample() {
  const root=mkdtempSync(join(tmpdir(),'tour-package-'));
  const review={status:'field_checked' as const,note:'Synthetic test declaration, not physical verification',reviewer:'unit-test',checkedAt:'2026-09-13'};
  const assets: TourPackage['assets']=['audio','transcript','map'].map((kind,i)=>{
    const data=Buffer.from(`synthetic ${kind} bytes`),path=`asset-${i}.bin`;writeFileSync(join(root,path),data);
    return {id:kind,path,kind:kind as 'audio'|'transcript'|'map',bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),license:'Synthetic test fixture only',sourceUrl:null,durationSeconds:kind==='audio'?10:null};
  });
  const ids=['a','b','c'],geometry=ids.map((_,i)=>({latitude:0,longitude:i*0.001}));
  const p: TourPackage={schemaVersion:1,id:'synthetic-package',contentVersion:1,title:'Synthetic package',mode:'walking',stage:'ready',sources:[{id:'s',title:'Synthetic evidence',url:'https://example.org/source',publisher:'Unit test',retrievedAt:'2026-09-13',rightsNote:'Synthetic'}],claims:[{id:'c',statement:'Synthetic assertion',status:'source_checked',uncertainty:'Synthetic only',supports:[{sourceId:'s',passage:'Synthetic passage',locator:'fixture'}]}],assets,
    stops:ids.map((id,i)=>({id,title:id,landmark:{name:'Synthetic landmark',point:null},standing:{point:geometry[i],review},approach:{instruction:'Synthetic approach',review},viewpoint:{description:'Synthetic viewpoint',review},access:{description:'Synthetic access',review},clipId:id})),
    clips:ids.map(id=>({id,stopId:id,audioAssetId:'audio',transcriptAssetId:'transcript',paragraphs:[{kind:'factual',text:'Synthetic assertion',claimIds:['c']}]})),
    route:{provider:'Synthetic router',generatedAt:'2026-09-13',review,geometry,legs:ids.slice(0,-1).map((id,i)=>({fromStopId:id,toStopId:ids[i+1],startIndex:i,endIndex:i+1,directions:['Synthetic direction'],review}))},
    map:{format:'mbtiles',assetIds:['map'],bounds:[-1,-1,1,1],attribution:'Synthetic map',rendererCheck:review}};
  return {root,p,clean:()=>rmSync(root,{recursive:true,force:true})};
}
function run(fn:(p:TourPackage,root:string)=>void){const s=sample();try{fn(s.p,s.root);}finally{s.clean();}}
test('package preflight validates a structurally complete declared package and checks bytes',()=>run((p,root)=>{
  assert.equal(checkPackage(p,root).ready,true);assert.equal(checkPackage(p,root).verifiedAssets,3);
  writeFileSync(join(root,p.assets[0].path),'x'.repeat(p.assets[0].bytes));assert.throws(()=>checkPackage(p,root),/checksum/);
}));
test('drafts remain inspectable but cannot declare unverified visitor geometry ready',()=>run((p,root)=>{
  p.stage='draft';p.stops[0].standing.point=null;p.stops[0].viewpoint.review={status:'unverified',note:'Need field check',reviewer:null,checkedAt:null};
  const r=checkPackage(p,root);assert.equal(r.ready,false);assert.ok(r.blockers.some(x=>x.includes('standing')));assert.ok(r.blockers.some(x=>x.includes('viewpoint')));
  p.stage='ready';assert.throws(()=>checkPackage(p,root),/falsely declares ready/);
}));
test('rejects path traversal, URLs and encoded or Windows paths',()=>run((p,root)=>{
  for(const path of ['../secret','/secret','a/../secret','a//b','a\\b','https://example.org/a','%2e%2e/secret','C:secret']){p.assets[0].path=path;assert.throws(()=>checkPackage(p,root));}
}));
test('rejects symlink files and parent directories without reading their target',()=>run((p,root)=>{
  symlinkSync(join(root,'asset-0.bin'),join(root,'link'));p.assets[0].path='link';assert.throws(()=>checkPackage(p,root),/Symlink/);
  mkdirSync(join(root,'real'));symlinkSync(join(root,'real'),join(root,'alias'));p.assets[0].path='alias/file';assert.throws(()=>checkPackage(p,root),/Symlink/);
}));
test('rejects missing/truncated assets and duplicate paths or IDs',()=>run((p,root)=>{
  const original=structuredClone(p);p.assets[0].bytes++;assert.throws(()=>checkPackage(p,root),/size/);
  p=structuredClone(original);p.assets[0].path='missing';assert.throws(()=>checkPackage(p,root),/ENOENT/);
  p=structuredClone(original);p.assets[1].path=p.assets[0].path;assert.throws(()=>checkPackage(p,root),/Duplicate asset path/);
  p=structuredClone(original);p.stops[1].id=p.stops[0].id;assert.throws(()=>checkPackage(p,root),/Duplicate stop/);
}));
test('rejects broken claim/clip/source links and unsupported schemas',()=>run((p,root)=>{
  const original=structuredClone(p);p.claims[0].supports[0].sourceId='missing';assert.throws(()=>checkPackage(p,root),/Missing claim source/);
  p=structuredClone(original);p.clips[0].paragraphs[0].claimIds=['missing'];assert.throws(()=>checkPackage(p,root),/Missing paragraph claim/);
  p=structuredClone(original);p.clips[0].stopId='b';assert.throws(()=>checkPackage(p,root),/mismatch/);
  assert.throws(()=>checkPackage({...original,schemaVersion:99},root));
}));
test('readiness requires reviewed evidence, local map, audio and transcripts',()=>run((p,root)=>{
  p.stage='draft';p.claims[0].status='disputed';p.map.assetIds=[];p.clips[0].audioAssetId=null;p.clips[1].transcriptAssetId=null;
  const r=checkPackage(p,root);assert.equal(r.ready,false);for(const key of ['claim:','map:','audio','transcript'])assert.ok(r.blockers.some(x=>x.includes(key)));
}));
test('route connectivity/order, bounds and directions must be valid',()=>run((p,root)=>{
  const original=structuredClone(p);p.route.legs[0].toStopId='c';assert.throws(()=>checkPackage(p,root),/Invalid route leg/);
  p=structuredClone(original);p.map.bounds=[0.0005,-1,1,1];assert.throws(()=>checkPackage(p,root),/outside map/);
  p=structuredClone(original);p.route.legs[0].directions=[];assert.throws(()=>checkPackage(p,root));
}));
test('checked reviews require dates/reviewer and unknown fields are rejected',()=>run((p,root)=>{
  const original=structuredClone(p);
  p.stops[0].access.review.reviewer=null;assert.throws(()=>checkPackage(p,root),/reviewer/);
  p=structuredClone(original);p.stops[0].access.review.checkedAt=null;assert.throws(()=>checkPackage(p,root),/reviewer/);
  assert.throws(()=>checkPackage({...original,confidence:0.99},root),/Unrecognized key/);
}));
test('route legs cover all geometry and meet visitor positions, not landmark centroids',()=>run((p,root)=>{
  const original=structuredClone(p);p.route.geometry.push({latitude:0,longitude:0.003});assert.throws(()=>checkPackage(p,root),/full geometry/);
  p=structuredClone(original);p.stops[0].standing.point={latitude:0.01,longitude:0};assert.throws(()=>checkPackage(p,root),/misses standing/);
  p=structuredClone(original);p.stops[0].landmark.point={latitude:0.01,longitude:0};assert.equal(checkPackage(p,root).ready,true);
}));
