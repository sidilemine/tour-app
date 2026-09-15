import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Store, SQL } from '../src/storage/store';
import { recovered, reduce, State } from '../src/domain/engine';
import { fixture, harness } from './helpers';
function adapter(db: DatabaseSync): SQL {
  return { execSync:sql=>db.exec(sql),runSync:(sql,...p)=>db.prepare(sql).run(...p),getFirstSync:<T>(sql:string,...p:(string|number|null)[])=>db.prepare(sql).get(...p) as T||null,getAllSync:<T>(sql:string,...p:(string|number|null)[])=>db.prepare(sql).all(...p) as T[] };
}
test('actual SQLite file close/reopen recovers the paused clip and completed stop',()=>{
  const dir=mkdtempSync(join(tmpdir(),'tour-sqlite-'));const file=join(dir,'progress.db');
  try {
    const h=harness();h.send({type:'start',at:0,diagnostics:true});h.finish(12000);h.arrive(1,200000);h.send({type:'audio',at:210000,token:h.state.playback.token,playing:true,finished:false,buffering:false,offset:6});h.send({type:'pause',at:211000});
    let db=new DatabaseSync(file),store=new Store(adapter(db));store.commit('progress',{fixture,state:h.state},{reason:'manual-pause'});db.close();
    db=new DatabaseSync(file);store=new Store(adapter(db));const saved=store.read<{fixture:unknown;state:typeof h.state}>('progress')!;
    assert.deepEqual(saved.fixture,fixture);assert.equal(recovered(saved.state).hold,'manual');assert.equal(saved.state.playback.offset,6);assert.equal(saved.state.stops[0],'completed');assert.equal(store.events().length,1);db.close();
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('failed write rolls progress and matching log back in the same transaction',()=>{
  const db=new DatabaseSync(':memory:');const sql=adapter(db),store=new Store(sql);store.commit('progress',{offset:2});
  db.exec("CREATE TRIGGER reject_event BEFORE INSERT ON events BEGIN SELECT RAISE(ABORT, 'injected write failure'); END;");
  assert.throws(()=>store.commit('progress',{offset:6},{reason:'pause'}),/injected/);assert.deepEqual(store.read('progress'),{offset:2});assert.equal(store.events().length,0);
  db.exec('DROP TRIGGER reject_event');store.commit('progress',{offset:7},{reason:'recovered'});assert.deepEqual(store.read('progress'),{offset:7});db.close();
});
test('SIGKILL during an uncommitted SQLite write preserves the last durable state',()=>{
  const dir=mkdtempSync(join(tmpdir(),'tour-crash-'));const file=join(dir,'progress.db');
  try {
    let db=new DatabaseSync(file);new Store(adapter(db)).commit('progress',{offset:3,hold:'manual'});db.close();
    const child=spawnSync(process.execPath,['--input-type=module','-e',`import {DatabaseSync} from 'node:sqlite'; const db=new DatabaseSync(process.argv[1]);db.exec('BEGIN IMMEDIATE');db.prepare('UPDATE kv SET value=? WHERE key=?').run(JSON.stringify({offset:9}),'progress');process.kill(process.pid,'SIGKILL');`,file]);
    assert.equal(child.signal,'SIGKILL');
    db=new DatabaseSync(file);const reopened=new Store(adapter(db));assert.deepEqual(reopened.read('progress'),{offset:3,hold:'manual'});db.close();
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('log retention is bounded and clearing logs preserves progress',()=>{
  const db=new DatabaseSync(':memory:');const store=new Store(adapter(db));store.commit('progress',{hold:'manual'});
  db.exec("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<10005) INSERT INTO events(value) SELECT '{}' FROM n");
  store.commit('progress',{hold:'manual'},{reason:'last'});assert.equal(store.events().length,10000);store.clearLogs();assert.deepEqual(store.read('progress'),{hold:'manual'});assert.equal(store.events().length,0);db.close();
});

test('termination during resume loading preserves the seek target in real SQLite',()=>{
  // Sanitized from the phone: Resume 185.727 -> initial buffering offset 0
  // -> sought 185.727 -> playing 185.759. Recover at each tested loading boundary.
  const dir=mkdtempSync(join(tmpdir(),'tour-loading-recovery-'));
  try {
    for (const interrupt of ['loading','manual-pause','load-error'] as const) {
      const h=harness();h.send({type:'start',at:0,diagnostics:true});
      h.send({type:'audio',at:1000,token:h.state.playback.token,playing:true,finished:false,buffering:false,offset:185.727});
      h.send({type:'pause',at:1100});h.send({type:'resume',at:1200});
      const token=h.state.playback.token;
      if(interrupt==='manual-pause')h.send({type:'pause',at:1250});
      h.send({type:'audio',at:1300,token,playing:false,finished:false,buffering:interrupt!=='load-error',offset:0,...(interrupt==='load-error'?{error:'load failed'}:{})});
      const file=join(dir,`${interrupt}.db`);
      let db=new DatabaseSync(file);new Store(adapter(db)).commit('progress',h.state);db.close();
      db=new DatabaseSync(file);const state=recovered(new Store(adapter(db)).read<State>('progress')!);db.close();
      assert.equal(state.playback.offset,185.727,interrupt);
      assert.equal(state.active,false);assert.equal(state.playback.status,'paused');
      assert.equal(state.hold,interrupt==='manual-pause'?'manual':interrupt==='load-error'?'audio-error':'recovery');
      const resumed=reduce(state,{type:'resume',at:2000},fixture);
      assert.equal(resumed.effects.find(e=>e.type==='play')?.offset,185.727);
      const playing=reduce(resumed.state,{type:'audio',at:2100,token:resumed.state.playback.token,playing:true,finished:false,buffering:false,offset:185.759},fixture);
      assert.equal(playing.state.playback.offset,185.759);
    }
  } finally {rmSync(dir,{recursive:true,force:true});}
});
