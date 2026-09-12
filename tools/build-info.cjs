const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
function files(dir) { return fs.readdirSync(dir).filter(name=>!name.startsWith('.')).flatMap(name => { const p=path.join(dir,name);return fs.statSync(p).isDirectory()?files(p):[p]; }); }
const inputs=['App.tsx','index.ts','app.json','package-lock.json','tools/patch-expo-audio.cjs',...files('src'),...files('assets')].filter(p=>p!=='src/buildInfo.json' && !p.endsWith('.md')).sort();
const hash=crypto.createHash('sha256');for(const file of inputs)hash.update(file).update(fs.readFileSync(file));
const sourceId=hash.digest('hex').slice(0,16);
fs.writeFileSync('src/buildInfo.json',JSON.stringify({sourceId,appVersion:'0.1.0',expoSdk:57},null,2)+'\n');
console.log(`Build source ID: ${sourceId}`);
