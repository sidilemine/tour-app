import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Job, recordSchema } from './records';

// One atomic snapshot is the small prototype store. Provider dispatch is saved BEFORE IO.
export function saveJob(path: string, job: Job) {
  mkdirSync(dirname(path),{recursive:true});
  const tmp=`${path}.${process.pid}.tmp`;
  const fd=openSync(tmp,'wx',0o600);
  try {writeFileSync(fd,JSON.stringify(job,null,2)+'\n');fsyncSync(fd);}finally{closeSync(fd);}
  renameSync(tmp,path);
  const directory=openSync(dirname(path),'r');try{fsyncSync(directory);}finally{closeSync(directory);}
}
export function loadJob(path:string):Job {
  const j=JSON.parse(readFileSync(path,'utf8')) as Job;
  if(j.schemaVersion!==1||!j.id||!Array.isArray(j.records)||!Array.isArray(j.tasks)||!Array.isArray(j.costLedger?.operations))throw Error('Unsupported/corrupt generation job');
  j.records.forEach(r=>recordSchema.parse(r));return j;
}
export async function withJobLock<T>(path:string,work:()=>Promise<T>):Promise<T> {
  const lock=`${resolve(path)}.lock`;mkdirSync(dirname(lock),{recursive:true});
  if(existsSync(lock)) {
    const pid=Number(readFileSync(lock,'utf8'));
    if(!Number.isInteger(pid)||pid<=0)throw Error('Malformed job lock; inspect before removing');
    try {process.kill(pid,0);throw Error('Job is already running');}catch(e) {if((e as NodeJS.ErrnoException).code!=='ESRCH')throw e;}
    rmSync(lock); // only a demonstrably dead local process
  }
  const fd=openSync(lock,'wx',0o600);writeFileSync(fd,String(process.pid));closeSync(fd);
  try{return await work();}finally{rmSync(lock);}
}
