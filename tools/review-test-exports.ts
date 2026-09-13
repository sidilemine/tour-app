import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { reviewExports } from './testing/review';
try {
  const directory = process.argv[2];
  if (!directory || process.argv.length !== 3) throw Error('Usage: node --import tsx tools/review-test-exports.ts <local-export-folder>');
  if (!lstatSync(directory).isDirectory()) throw Error('Choose a real local directory, not a symlink');
  const names = readdirSync(directory).filter(n => n.endsWith('.json')).sort();
  if (!names.length || names.length > 1000) throw Error('Expected 1–1000 JSON files in this folder');
  let bytes = 0;
  const input: { name: string; value: unknown }[] = [], readErrors: { file: string; reason: string }[] = [];
  for (const name of names) {
    try {
      const file = join(directory, name), stat = lstatSync(file);
      if (!stat.isFile() || stat.size > 32 * 1024 * 1024) throw Error('Not a regular JSON file within the 32 MiB limit');
      bytes += stat.size;
      if (bytes > 256 * 1024 * 1024) throw Error('Batch exceeds 256 MiB');
      input.push({ name, value: JSON.parse(readFileSync(file, 'utf8')) });
    } catch { readErrors.push({ file: name, reason: 'Unreadable, invalid JSON, symlink or size limit exceeded' }); }
  }
  const report = reviewExports(input); report.errors.push(...readErrors);
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length || report.attempts.some(a => a.conflict)) process.exitCode = 1;
} catch (error) { console.error(String(error)); process.exitCode = 1; }
