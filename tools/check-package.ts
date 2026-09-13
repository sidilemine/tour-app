import { checkPackageFile } from './content/package';
const args=process.argv.slice(2), file=args.find(arg=>arg!=='--ready');
try {
  if (!file || args.some(arg=>arg!==file && arg!=='--ready')) throw Error('Usage: npm run check:package -- <manifest.json> [--ready]');
  const report=checkPackageFile(file); console.log(JSON.stringify(report,null,2));
  if (args.includes('--ready') && !report.ready) process.exitCode=1;
} catch (error) { console.error(String(error)); process.exitCode=1; }
