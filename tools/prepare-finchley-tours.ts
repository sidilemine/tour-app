// Bounded preparation for these two authored tours; no provider/LLM factory.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { parseTourPackage } from '../src/tours/package';
import { distance, Fixture } from '../src/domain/fixture';
import catalog from '../src/map/catalog.json';
import { renderGeorge, closeRenderer, voiceConfig } from './voice-samples/render-tour.mjs';

type Paragraph = { text: string; kind: 'source_checked' | 'supported_reconstruction' | 'editorial'; basis: string; sourceUrls: string[] };
type Authored = { id: string; title: string; paragraphs: Paragraph[]; sources: { title: string; url: string }[] };
const authored = JSON.parse(readFileSync('content/north-finchley/stories.json', 'utf8')).stories as Authored[];
const root = resolve('content/north-finchley'), audioDir = resolve('artifacts/finchley-audio-george-v2');
mkdirSync(audioDir, { recursive: true }); mkdirSync(`${root}/packages`, { recursive: true });
const pointData = JSON.parse(readFileSync('docs/content/routes/north-finchley-options-v1/points.json', 'utf8')).points;
const osmUrl = 'https://www.openstreetmap.org/#map=17/51.6133/-0.1800';
const navigationSource = { title: 'OpenStreetMap public streets and paths; saved Valhalla pedestrian responses, reviewed 17 September 2026', url: osmUrl };
const places: Record<string, { point: string; title: string; view: string; approach: string; access: string }> = {
  'tally-ho': { point: 'tally_ho', title: 'Tally Ho Corner', view: 'Use the public pavement at Tally Ho Corner, near the junction of High Road and Ballards Lane. Keep the pedestrian crossing clear.', approach: 'From the artsdepot / bus station area, follow the pavement north along Ballards Lane to Tally Ho Corner.', access: 'Exterior street stop. No pub entry needed.' },
  'grand-arcade': { point: 'grand_arcade', title: 'Grand Arcade', view: 'Look into the Grand Arcade from its Ballards Lane street entrance. You do not need to enter the passage.', approach: 'Follow Ballards Lane south from Tally Ho towards artsdepot; find the Arcade entrance before Nether Street.', access: 'Use the public street entrance. If the passage is open, a look inside is optional; the planned onward walk stays outside.' },
  'torrington': { point: 'torrington', title: 'The Torrington site', view: 'The former Torrington pub site is at the Lodge Lane / High Road corner, historically 811 High Road. Use the public pavement; no interior visit is needed.', approach: 'Follow the High Road north to Lodge Lane and the former pub corner.', access: 'Exterior story about a former venue. Current shop/occupancy is not part of the directions.' },
  'trinity': { point: 'trinity', title: 'Trinity Church', view: 'View Trinity Church from the Nether Street pavement, without blocking the entrance.', approach: 'Follow Nether Street away from Ballards Lane to Trinity Church.', access: 'Exterior only; no rehearsal or church opening is promised.' },
  'meeting-house': { point: 'meeting_house', title: 'Finchley Meeting House', view: 'Look for number 58 Alexandra Grove and the bottle-and-slate artwork on the front wall. Use the pavement beside the driveway, keeping the dropped kerb and entrance clear. If the work is not visible, use the transcript or skip without entering a closed gate.', approach: 'Continue along Nether Street away from the town centre, then turn into Alexandra Grove. Look for the Meeting House at number 58.', access: 'The meeting invites visitors to see its front-wall artwork. September 2024 Street View shows the sculpture from Alexandra Grove; current obstructions remain a first-use observation. No indoor access needed.' },
  'moss-hall-crescent': { point: 'moss_hall_crescent', title: 'Moss Hall Crescent', view: 'Stay on the house-side pavement along the northern part of Moss Hall Crescent. View the villas through their frontage planting; the shared green strip is across the Crescent roadway towards Ballards Lane. Do not stand in the road or enter the green or private gardens.', approach: 'Follow Alexandra Grove to Moss Hall Crescent; turn into the Crescent and pause at the villas behind the green.', access: 'Residential exterior view. Do not enter the shared green or private gardens.' },
  'elephant': { point: 'elephant', title: 'The Elephant Inn', view: 'View the Elephant Inn at 283 Ballards Lane from the pavement, leaving room for people to pass.', approach: 'Return to Alexandra Grove, continue to Ballards Lane and follow its pavement towards the town centre to the Elephant Inn.', access: 'Exterior story. Food, drink and an interior look are optional and outside the tour timing.' },
  'artsdepot': { point: 'artsdepot', title: 'Gaumont to artsdepot', view: 'Finish outside artsdepot by Nether Street and the bus station area. Stay in pedestrian space, clear of bus access.', approach: 'Follow Ballards Lane towards the town centre and turn into Nether Street beside artsdepot.', access: 'Exterior finish; no performance ticket or building access required.' },
};
// Public mapped pavement points, distinct from landmark pins. Residential-frontage candidates use dated Street View and street geometry;
// all remain desk-checked candidates, not surveyed/field-verified positions.
const pavement: Record<string, [number, number]> = {
  'tally-ho': [-0.1766871, 51.6141189], 'grand-arcade': [-0.1769498, 51.6134494],
  'torrington': [-0.1768879, 51.6164799], 'trinity': [-0.1785888, 51.6135386],
  'meeting-house': [-0.18470, 51.61315], 'moss-hall-crescent': [-0.18122, 51.61023],
  'elephant': [-0.1790389, 51.6115036], 'artsdepot': [-0.1768546, 51.613149],
};
const directions: Record<string, Record<string, string[]>> = {
  A: {
    'tally-ho': ['When you are ready, follow the Ballards Lane pavement south, back towards artsdepot. Grand Arcade is about seventy-five metres away, before Nether Street. Stop at its street entrance.'],
    'grand-arcade': ['For the next story, return north along Ballards Lane towards Tally Ho, then continue along the High Road to Lodge Lane. The former Torrington pub stood at that corner, historically number 811 High Road. Use the pedestrian crossings where needed and stop clear of the junction.'],
    'torrington': ['Now retrace the High Road south towards Tally Ho and continue along Ballards Lane. Turn into Nether Street beside artsdepot, away from the main road. Trinity Church is a short walk along Nether Street.'],
    'trinity': ['For the final story, follow Nether Street back towards Ballards Lane and artsdepot. Stop outside the arts centre, clear of the bus station access.'],
    'artsdepot': ['This is the end of the walk, back by North Finchley bus station. Choose End tour to stop location tracking. There is no need to enter the arts centre.'],
  },
  B: {
    'tally-ho': ['When you are ready, follow the Ballards Lane pavement south towards artsdepot. Turn into Nether Street, away from the main road, and continue to Trinity Church.'],
    'trinity': ['Continue along Nether Street away from the town centre. Follow it to Alexandra Grove, then turn into Alexandra Grove and look for Finchley Meeting House at number 58. The next story is the artwork on its front wall.'],
    'meeting-house': ['Continue along Alexandra Grove towards Ballards Lane. A walking chapter will begin after you have left this stop, if automatic narration is enabled. Our next stop is the villas on Moss Hall Crescent, a turning off Alexandra Grove before Ballards Lane.'],
    'moss-hall-crescent': ['Retrace the short section of the Crescent to Alexandra Grove. Continue to Ballards Lane and follow its pavement towards the town centre. Stop at the Elephant Inn, number 283, keeping the footway clear.'],
    'elephant': ['For the final story, continue along Ballards Lane towards Tally Ho and the town centre. At Nether Street, turn towards artsdepot and stop outside the arts centre. Use the pedestrian crossings where needed.'],
    'artsdepot': ['This is the end of the walk, back by North Finchley bus station. Choose End tour to stop location tracking. There is no need to enter the arts centre.'],
    'walking-neighbourhood': ['Keep following Alexandra Grove. At Moss Hall Crescent, turn into the Crescent and look for the villas behind their green strip. The next story is there.'],
  },
};
function decode(shape: string) {
  let p = 0, lat = 0, lon = 0; const points: { latitude: number; longitude: number }[] = [];
  function number() { let b, shift = 0, result = 0; do { b = shape.charCodeAt(p++) - 63; result |= (b & 31) << shift; shift += 5; } while (b >= 32); return result & 1 ? ~(result >> 1) : result >> 1; }
  while (p < shape.length) { lat += number(); lon += number(); points.push({ latitude: lat / 1e6, longitude: lon / 1e6 }); }
  return points;
}
function command(file: string, args: string[]) { const result = spawnSync(file, args, { encoding: 'utf8' }); if (result.error || result.status !== 0) throw Error(`${file}: ${result.error ?? result.stderr}`); return result.stdout; }
async function main() {
const summaries: unknown[] = [];
for (const variant of ['B', 'A']) {
  const order = variant === 'A' ? ['tally-ho', 'grand-arcade', 'torrington', 'trinity', 'artsdepot'] : ['tally-ho', 'trinity', 'meeting-house', 'moss-hall-crescent', 'elephant', 'artsdepot'];
  const sourceFile = variant === 'A' ? 'docs/content/routes/north-finchley-review-v2/A-exterior-response.json' : 'docs/content/routes/north-finchley-options-v1/B-response.json';
  const response = JSON.parse(readFileSync(sourceFile, 'utf8'));
  const route: Fixture['route'] = [], stopIndices: number[] = [];
  for (const leg of response.trip.legs) {
    const points = decode(leg.shape);
    if (route.length && distance(route.at(-1)!, points[0]) > 1) throw Error('Disconnected provider legs');
    route.push(...(route.length ? points.slice(1) : points)); stopIndices.push(route.length - 1);
  }
  const id = `north-finchley-${variant.toLowerCase()}`, assets: { key: string; base64: string }[] = [];
  const makeStory = async (storyId: string) => {
    const original = authored.find(s => s.id === storyId); if (!original) throw Error(`Missing story: ${storyId}`);
    const cue = directions[variant][storyId]; if (!cue) throw Error('Missing directions');
    const paragraphs = [...original.paragraphs, { text: cue.join(' '), kind: 'source_checked' as const, basis: `Desk navigation from public OpenStreetMap streets and ${sourceFile}, reviewed 2026-09-17. Approximate exterior positions; no current field sightline/access claim.`, sourceUrls: [osmUrl] }];
    const transcript = paragraphs.map(p => p.text).join('\n\n'), key = `${id}-${storyId}`;
    const digest = createHash('sha256').update(JSON.stringify(voiceConfig)).update(transcript).digest('hex'), audioPath = `${audioDir}/${key}.m4a`, textPath = `${audioDir}/${key}.txt`;
    if (!existsSync(`${audioPath}.sha256`) || readFileSync(`${audioPath}.sha256`, 'utf8').trim() !== digest || !existsSync(audioPath)) {
      writeFileSync(textPath, transcript + '\n');
      console.log(`Rendering George: ${key}`);
      await renderGeorge(transcript, audioPath);
      writeFileSync(`${audioPath}.sha256`, digest + '\n');
    }
    const bytes = readFileSync(audioPath), durationSeconds = Number(command('/usr/local/bin/ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audioPath]).trim());
    assets.push({ key, base64: bytes.toString('base64') });
    return { id: storyId, title: original.title, transcript, sources: [...original.sources, navigationSource], directions: cue,
      evidence: paragraphs.map(p => ({ paragraph: p.text, kind: p.kind, basis: p.basis, sourceUrls: p.sourceUrls })),
      audio: { key, bytes: bytes.length, md5: createHash('md5').update(bytes).digest('hex'), durationSeconds } };
  };
  const stories = [];
  for (const storyId of order) stories.push(await makeStory(storyId));
  const chapters: NonNullable<Fixture['narration']>['chapters'] = [];
  if (variant === 'B') {
    const from = stopIndices[2], to = stopIndices[3]; let metres = 0, startRouteIndex = -1, endRouteIndex = -1;
    for (let i = from + 1; i < to; i++) { metres += distance(route[i - 1], route[i]); if (startRouteIndex < 0 && metres >= 70) startRouteIndex = i; if (endRouteIndex < 0 && metres >= 160) endRouteIndex = i; }
    if (startRouteIndex < 0 || endRouteIndex <= startRouteIndex) throw Error('No usable departure chapter interval');
    chapters.push({ ...await makeStory('walking-neighbourhood'), afterStopIndex: 2, startRouteIndex, endRouteIndex });
  }
  const title = variant === 'A' ? 'A · Places people went for a good time' : 'B · How a neighbourhood makes itself';
  const stationarySeconds = stories.reduce((sum, s) => sum + s.audio.durationSeconds, 0), movingMinutes = response.trip.summary.time / 60;
  const ordinaryMinutes = Math.ceil(movingMinutes + stationarySeconds / 60 + 3);
  const fixture: Fixture = { schemaVersion: 1, id, version: 2, title,
    verification: { status: 'unverified', note: 'Desk-reviewed public exterior route, OSM/Valhalla geometry and published addresses, 17 September 2026. Current sightlines, pavement obstructions and access are not yet field-checked. First owner use supplies those observations; manual play/skip remains available.' },
    route, stops: order.map((stopId, i) => {
      const place = places[stopId], point = pointData[place.point];
      return { id: stopId, title: place.title, routeIndex: stopIndices[i], standing: pavement[stopId] ? { longitude: pavement[stopId][0], latitude: pavement[stopId][1] } : route[stopIndices[i]], landmark: { longitude: point[0], latitude: point[1] }, approach: place.approach, viewpoint: place.view, access: place.access };
    }),
    narration: { description: `George narration · v2 · ${order.length} stops${chapters.length ? ' + one walking chapter' : ''} · about ${response.trip.summary.length.toFixed(2)} km · allow ${ordinaryMinutes}–${ordinaryMinutes + 5} minutes, plus optional feedback.`,
      introduction: 'Begin on the public pavement at Tally Ho Corner, a short walk north along Ballards Lane from North Finchley bus station / artsdepot. Start the tour there. Both walks finish outside artsdepot. Use the numbered map and street-name directions; the line is approximate and can follow road centres, so remain on pavements and use pedestrian crossings. No indoor visits are required.',
      finishInstructions: 'Finish by artsdepot, beside the North Finchley bus station area. Tap End tour to stop location tracking. A useful final note is whether the walk was worth the time and one change you would make.',
      reviewNote: 'First personal review version. Choose Review after any story to save optional scores and a voice note; close it and Resume when ready. Allow roughly 45–60 seconds per review. If a view is blocked or an arrival misses, use manual Play or Skip. Current views and the walking experience are for your first-use feedback.',
      rightsNote: 'Original narration prepared for Sidi’s private tour review; rendered locally with Kokoro George (bm_george), selected by Sidi. Kokoro model and inference library: Apache-2.0; model https://huggingface.co/hexgrad/Kokoro-82M and runtime https://github.com/hexgrad/kokoro. No subscription or cloud synthesis. No music, source recordings or photographs copied. Map data © OpenStreetMap contributors (ODbL); Protomaps / Natural Earth and Noto font credits are available on the map. Public source links and paragraph evidence are stored with each transcript. Prepared for private review; public distribution of the complete tour is a separate decision.',
      stories, chapters,
    },
  };
  const transport = { format: 'walking-tour-package' as const, version: 1 as const, mapId: catalog.id, fixture, assets };
  parseTourPackage(transport);
  writeFileSync(`${root}/packages/${variant}.json`, JSON.stringify(transport) + '\n');
  writeFileSync(`${root}/${variant}-manifest.json`, JSON.stringify({ ...transport, assets: assets.map(a => ({ key: a.key, base64: '[audio is in the companion import package]' })) }, null, 2) + '\n');
  summaries.push({ variant, id, title, version: 2, routeResponse: sourceFile, distanceKm: response.trip.summary.length, routerMovingSeconds: response.trip.summary.time, stationaryAudioSeconds: stationarySeconds, chapterAudioSeconds: chapters.reduce((s,c) => s+c.audio.durationSeconds,0), ordinaryEstimateMinutes: [ordinaryMinutes,ordinaryMinutes+5], audio: [...stories,...chapters].map(s => s.audio) });
}
writeFileSync(`${root}/preparation.json`, JSON.stringify({ preparedAt: new Date().toISOString(), voice: 'Kokoro George', synthesis: voiceConfig, routeDataLicense: 'OpenStreetMap ODbL', variants: summaries }, null, 2) + '\n');
writeFileSync('src/tours/bundled.ts', "import type { TourTransport } from './package';\nimport B from '../../content/north-finchley/packages/B.json';\nimport A from '../../content/north-finchley/packages/A.json';\nexport const bundledTours = [B, A] as unknown as (TourTransport & { fixture: import('../domain/fixture').Fixture })[];\n");
console.log(JSON.stringify(summaries,null,2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(closeRenderer);
