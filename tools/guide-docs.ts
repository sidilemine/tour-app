import { readFileSync, writeFileSync } from 'node:fs';
import guide from '../src/testing/guide.json';
const output = '# Offline phone test guide\n\nGenerated from `src/testing/guide.json`; edit that source and run `npm run docs:guide`. Revision ' + guide.revision + '.\n\n' + guide.intro + '\n\n## Before and after each attempt\n\n' + guide.common.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n' + guide.cases.map(c => `## ${c.title}\n\nCase: \`${c.id}\`. Preparation: ${c.preparation}. Build: ${c.build}.\n\n${c.needs}\n\n${c.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nExpected: ${c.expected}\n`).join('\n');
const path = 'docs/TEST-GUIDE.md';
if (process.argv.includes('--check')) { if (readFileSync(path, 'utf8') !== output) throw Error('Guide documentation has drifted. Run npm run docs:guide.'); console.log('Offline guide and documentation match'); }
else writeFileSync(path, output);
