import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseTourPackage, stageTour, assertTourVersion } from '../src/tours/package';
import { initialState, reduce } from '../src/domain/engine';
import { loadJob } from '../tools/generation/store';
import { exact, finish, usable } from '../tools/generation/engine';
import { ref } from '../tools/generation/records';
const root='content/generation-pilot';
const load=()=>parseTourPackage(JSON.parse(readFileSync(`${root}/package.json`,'utf8')));

test('real pilot transport, measured files, paragraph coverage, map and exact station loop agree',()=>{
 const p=load();assert.equal(p.fixture.id,'clerkenwell-balanced-pilot');assert.equal(p.fixture.version,1);
 assert.equal(p.mapId,'clerkenwell-8f45f13ad1755318');assert.equal(p.assets.length,6);
 assert.deepEqual(p.fixture.route[0],p.fixture.route.at(-1));assert.equal(p.fixture.stops[0].id,'farringdon');
 assert.equal(p.fixture.narration!.chapters.length,0);
 const preparation=JSON.parse(readFileSync(`${root}/preparation.json`,'utf8'));
 assert.equal(createHash('sha256').update(readFileSync(`${root}/package.json`)).digest('hex'),preparation.packageSha256);
 for(const input of preparation.inputs)assert.equal(createHash('sha256').update(readFileSync(input.path)).digest('hex'),input.sha256);
 for(const s of p.fixture.narration!.stories){
   assert.equal(s.evidence.map(e=>e.paragraph).join('\n\n'),s.transcript);
   const bytes=Buffer.from(p.assets.find(a=>a.key===s.audio.key)!.base64,'base64');
   assert.deepEqual(bytes,readFileSync(`${root}/audio/${s.id}.m4a`));
   assert.equal(createHash('md5').update(bytes).digest('hex'),s.audio.md5);
   assert.equal(s.audio.durationSeconds,preparation.recordings.find((r:{id:string})=>r.id===s.id).durationSeconds);
 }
 const timing=preparation.timing;assert(Math.abs(timing.walkingMinutesAt4_5KmH+timing.stationaryAudioMinutes+timing.lookingSettlingCrossingAllowanceMinutes-60)<0.00001);
 assert(timing.lookingSettlingCrossingAllowanceMinutes>0);assert.equal(preparation.acceptance.readyForOrdinaryUse,false);
});

test('actual pilot staged importer rejects corrupted audio and changed version while retaining earlier package',async()=>{
 const p=load();const files=new Map<string,Buffer>();const earlier='retained';files.set(earlier,Buffer.from('old version'));
 await assert.rejects(stageTour(p,'staging/',{async write(path,base64){files.set(path,Buffer.from(base64,'base64'));},async inspect(path){const bytes=files.get(path)!;return {bytes:bytes.length,md5:'bad-hash'};}}),/Corrupt audio/);
 assert.equal(files.get(earlier)!.toString(),'old version');
 await stageTour(p,'valid/',{async write(path,base64){files.set(path,Buffer.from(base64,'base64'));},async inspect(path){const bytes=files.get(path)!;return {bytes:bytes.length,md5:createHash('md5').update(bytes).digest('hex')};}});
 assert.throws(()=>parseTourPackage({...p,assets:p.assets.slice(1)}),/Missing/);
 assert.throws(()=>assertTourVersion([{fixture:p.fixture,mapId:p.mapId,directory:'old/',importedAt:''}],{...p.fixture,title:'Changed same edition'},p.mapId),/different content/);
});

test('pilot reducer preserves manual hold and manual fallback using actual candidate geometry',()=>{
 const p=load(),f=p.fixture;let state=initialState(f);
 state=reduce(state,{type:'start',at:0,diagnostics:false},f).state;
 state=reduce(state,{type:'pause',at:1},f).state;
 for(let n=2;n<10;n++){
  const point=f.stops[1].standing;
  const result=reduce(state,{type:'fix',at:n*2000,fix:{...point,accuracy:7,timestamp:n*2000,speed:0}},f);state=result.state;
  assert(!result.effects.some(e=>e.type==='play'));
 }
 const ended=reduce(state,{type:'end',at:22000},f);assert(!ended.effects.some(e=>e.type==='play'));
});

test('pilot authoring references are real; unresolved source, physical and listening gaps block ready',()=>{
 const j=loadJob(`${root}/authoring-job.json`);assert.equal(j.conditions.mode,'manual-calibration');assert.equal(j.status,'blocked');
 for(const r of j.records)r.dependsOn.forEach(d=>exact(j,d));
 const p=j.records.find(r=>r.kind==='package')!;assert(usable(j,ref(p)).length>0);
 assert.throws(()=>finish(j,'ready','Pretend complete',new Date().toISOString()),/incomplete/);
 const scripts=j.records.filter(r=>r.kind==='script');assert.equal(scripts.length,6);
 for(const s of scripts)if(s.kind==='script')assert(s.data.assertions.some(a=>a.kind==='physical'&&a.evidenceRefs.some(d=>exact(j,d).kind==='encounter')));
});
