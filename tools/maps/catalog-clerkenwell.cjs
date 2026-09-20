// Explicit regeneration for the second bundled area. Finchley stays immutable.
const fs = require('node:fs');
const crypto = require('node:crypto');
const existing = require('../../src/map/catalog.json');
const data = fs.readFileSync('assets/maps/clerkenwell/basemap.pmtiles');
const files = [{ path: 'basemap.pmtiles', bytes: data.length,
  md5: crypto.createHash('md5').update(data).digest('hex'),
  sha256: crypto.createHash('sha256').update(data).digest('hex') },
...existing.files.filter(file => file.path.startsWith('fonts/'))];
const revision = crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 16);
fs.writeFileSync('src/map/clerkenwell.json', JSON.stringify({
  ...existing, id: `clerkenwell-${revision}`, bounds: [-0.116, 51.515, -0.091, 51.536], files,
}, null, 2) + '\n');
console.log(`${files.length} resources; ${data.length} new map bytes; shared existing font assets; ${revision}`);
