import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { Fixture, parseFixture } from '../domain/fixture';
import { eligible, Event, initialState, pendingArrivalNeedsFreshFix, recovered, reduce, State } from '../domain/engine';
import { Store } from '../storage/store';
import { PlayGate } from './playGate';
import buildInfo from '../buildInfo.json';
import { nativeAudioGeneration } from './nativeAudio';
import { clipNames } from './clipPlan';
import { narrationAt } from '../domain/narration';
import { tourAudio, tourAudioProfile } from '../tours/nativeLibrary';
const build = { ...buildInfo, variant: __DEV__ ? 'development' : 'offline-release' };

export const LOCATION_TASK = 'walking-tour-location-v1';
const assets = [require('../../assets/audio/a.m4a'), require('../../assets/audio/b.m4a'), require('../../assets/audio/c.m4a')];
const edgeA = require('../../assets/audio/edge-a.m4a');
const listeners = new Set<() => void>();
let store: Store;
let fixture: Fixture | null = null;
let state = initialState();
let player: AudioPlayer | null = null;
let statusListener: { remove(): void } | null = null;
let files: string[] = [];
let preparedProfile = '';
let reviewActive = false;
let startEpoch = 0;
let fatal = '';
let initialized = false;
let service = 'Stopped';
let queue: Promise<void> = Promise.resolve();
const playGate = new PlayGate();
let snapshot: { fixture: Fixture | null; state: State; fatal: string; service: string; recent: { reason: string; at: number }[] } = { fixture, state, fatal, service, recent: [] };
const recent: { reason: string; at: number }[] = [];
const fixtureKey = (f: Fixture | null) => f ? `${f.id}@${f.version}` : 'none';
function notify() { snapshot = { fixture, state, fatal, service, recent: [...recent] }; listeners.forEach(l => l()); }
export const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getSnapshot = () => snapshot;
function record(reason: string, extra?: unknown) {
  recent.unshift({ reason, at: Date.now() }); recent.splice(20);
  try {
    if (store && state.diagnostics) store.commit('lastDiagnostic', reason, { kind: 'diagnostic', fixtureKey: fixtureKey(fixture), at: Date.now(), walkId: state.startedAt, reason, extra });
  } catch (error) { player?.pause(); fatal = `Diagnostic storage failed: ${String(error)}`; }
  notify();
}
export function init() {
  if (initialized) return;
  initialized = true;
  try {
    store = new Store(SQLite.openDatabaseSync('walking-tour.db'));
    const saved = store.read<Fixture>('fixture');
    fixture = saved ? parseFixture(JSON.stringify(saved)) : null;
    state = initialState(fixture ?? undefined);
    const progress = store.read<{ fixture: string; state: State }>('progress');
    if (fixture && progress?.fixture === JSON.stringify(fixture)) state = recovered(progress.state);
    record('opened: explicit resume required', { model: Device.modelName, os: Device.osVersion, ...build });
    // Never leave a previous process's task running after cold recovery.
    void Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).then(async running => {
      if (running && !state.active) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    }).catch(error => record('service-reconcile-error', String(error)));
    AppState.addEventListener('change', value => record(`app-state:${value}`));
  } catch (error) { fatal = `Storage/recovery error: ${String(error)}. Saved data has not been deleted.`; }
  notify();
}
async function prepareAudio(recheck = false) {
  if (fixture?.narration) {
    const profile = tourAudioProfile(fixture);
    if (recheck || preparedProfile !== profile || !files.length) { files = await tourAudio(fixture); preparedProfile = profile; }
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix', allowsRecording: false });
    return;
  }
  const names = clipNames(fixture), profile = names.join(',');
  if (!files.length || preparedProfile !== profile) {
    const dir = `${FileSystem.documentDirectory}clips/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ready: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const target = `${dir}${names[i]}.m4a`;
      if (!(await FileSystem.getInfoAsync(target)).exists) {
        const asset = await Asset.fromModule(i === 0 && fixture?.audioProfile === 'edge-long-a' ? edgeA : assets[i]).downloadAsync();
        if (!asset.localUri) throw Error('Local audio asset is unavailable. Load all assets while Metro is connected.');
        await FileSystem.copyAsync({ from: asset.localUri, to: target });
      }
      const info = await FileSystem.getInfoAsync(target);
      if (!info.exists || info.size === 0) throw Error('Empty or missing audio clip.');
      ready.push(target);
    }
    files = ready;
    preparedProfile = profile;
  }
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix', allowsRecording: false });
}
function disposePlayer() {
  statusListener?.remove(); statusListener = null;
  if (player) { player.pause(); player.clearLockScreenControls(); player.release(); player = null; }
}
export async function setReviewMode(enabled: boolean): Promise<void> {
  reviewActive = enabled;
  if (enabled) await dispatch({ type: 'pause', at: Date.now(), reason: 'review' });
  // Closing/saving a review never resumes narration.
}
export function dispatch(event: Event): Promise<void> {
  if (event.type === 'end') startEpoch++;
  if (reviewActive && ['manual', 'resume', 'start'].includes(event.type)) return Promise.reject(Error('Close the story review before resuming narration.'));
  // A queued pause cancels in-flight asynchronous preparation before any sound.
  const playEpoch = playGate.receive(event.type);
  if (event.type === 'pause' || event.type === 'end') player?.pause();
  const job = queue.then(async () => {
    init();
    if (fatal) throw Error(fatal);
    if (!fixture) throw Error('Choose a tour or load a fixture first.');
    const result = reduce(state, event, fixture);
    // A single synchronous transaction records policy BEFORE native effects.
    store.commit('progress', { fixture: JSON.stringify(fixture), state: result.state }, result.state.diagnostics ? { kind: 'transition', fixtureKey: fixtureKey(fixture), event, before: state, after: result.state, effects: result.effects, reason: result.reason } : undefined);
    state = result.state;
    recent.unshift({ reason: result.reason, at: event.at }); recent.splice(20); notify();
    if ((event.type === 'resume' || (event.type === 'audio' && event.finished) || event.type === 'automatic')
      && pendingArrivalNeedsFreshFix(state, event.at)) {
      record('pending-arrival-waiting-for-fresh-location', {
        index: eligible(state), fixAgeMs: state.location.fix ? event.at - state.location.fix.timestamp : null,
      });
    }
    for (const effect of result.effects) {
      if (effect.type === 'pause') { player?.pause(); continue; }
      try {
        await prepareAudio();
        if (!playGate.allows(playEpoch)) { record('play-cancelled-by-pending-pause', effect); continue; }
        statusListener?.remove();
        // Preserve the same native player/media service across real silence.
        const existing = player;
        const p = existing ?? createAudioPlayer({ uri: files[effect.index] }, { updateInterval: 1000 });
        if (existing) { p.pause(); p.replace({ uri: files[effect.index] }); }
        player = p;
        const generation = nativeAudioGeneration(p.currentStatus);
        statusListener = p.addListener('playbackStatusUpdate', (status: AudioStatus) => {
          if (player !== p || (status as AudioStatus & { tourGeneration?: number }).tourGeneration !== generation) return;
          const control = (status as AudioStatus & { tourCommand?: string }).tourCommand;
          if (control) {
            record('remote-command', { command: control });
            void dispatch({ type: control === 'play' ? 'resume' : 'pause', at: Date.now() }).catch(() => {});
            return;
          }
          void dispatch({ type: 'audio', token: effect.token, at: Date.now(), playing: status.playing, finished: status.didJustFinish, offset: status.currentTime, buffering: status.isBuffering || !status.isLoaded, error: status.error }).catch(() => {});
        });
        const metadata = { title: narrationAt(fixture, effect.index)?.title ?? fixture.stops[effect.index]?.title ?? 'Walking chapter', artist: 'Walking Tour Lab', albumTitle: fixture.title };
        if (existing) p.updateLockScreenMetadata(metadata);
        else p.setActiveForLockScreen(true, metadata, { showSeekBackward: false, showSeekForward: false });
        if (effect.offset) await p.seekTo(effect.offset);
        if (!playGate.allows(playEpoch)) { p.pause(); record('play-cancelled-after-seek', effect); continue; }
        p.play();
        record('play-request-issued', effect);
      } catch (error) {
        // Do not await recursively on our own serialized queue.
        void dispatch({ type: 'audio', at: Date.now(), token: effect.token, playing: false, finished: false, offset: effect.offset, buffering: false, error: String(error) }).catch(() => {});
        record('play-effect-failed', String(error));
      }
    }
  });
  queue = job.catch(error => { player?.pause(); fatal = String(error); notify(); });
  return job;
}
export async function loadFixture(text: string) {
  init();
  const next = parseFixture(text);
  const job = queue.then(() => {
    if (reviewActive) throw Error('Close the story review before choosing another tour.');
    if (fatal) throw Error(fatal);
    if (state.active) throw Error('End the tour before replacing its fixture.');
    // Same content keeps recovery state. Different content keeps an archive.
    if (JSON.stringify(fixture) === JSON.stringify(next)) return;
    if (fixture && fixtureKey(fixture) === fixtureKey(next)) throw Error('Changed fixture content needs a new version number.');
    const archiveKey = `archive:${fixtureKey(next)}`;
    const archived = store.read<{ fixture: string; state: State }>(archiveKey);
    if (archived && archived.fixture !== JSON.stringify(next)) throw Error('That fixture ID/version already names different content. Increment its version.');
    const nextState = archived ? recovered(archived.state) : initialState(next);
    const writes: [string, unknown][] = [
      ['fixture', next], ['progress', { fixture: JSON.stringify(next), state: nextState }],
    ];
    if (fixture) writes.push([`archive:${fixtureKey(fixture)}`, { fixture: JSON.stringify(fixture), state }]);
    // Keep the old in-memory session and files if any part of the write fails.
    store.commitMany(writes);
    startEpoch++;
    fixture = next; state = nextState; files = []; preparedProfile = '';
    try { disposePlayer(); } finally { record('fixture-loaded'); }
  });
  queue = job.catch(() => {});
  return job;
}
export async function start(diagnostics: boolean) {
  init(); if (reviewActive) throw Error('Close the story review first.');
  if (!fixture) throw Error('Configure a walking fixture first.');
  const requestEpoch = ++startEpoch;
  await prepareAudio(true);
  if (requestEpoch !== startEpoch) return;
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  if (requestEpoch !== startEpoch) return;
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (requestEpoch !== startEpoch) return;
  if (!foreground.granted) throw Error('Location denied. Manual playback is available; grant location to start tracking.');
  const background = await Location.requestBackgroundPermissionsAsync();
  if (requestEpoch !== startEpoch || reviewActive) return;
  if (!background.granted) throw Error('Allow location “all the time” in Settings for this background test. Manual playback remains available.');
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    // A visitor can wait motionless at a held stop. Displacement filtering
    // otherwise starves the 15-second freshness gate when Resume is pressed.
    accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 0,
    deferredUpdatesInterval: 0, deferredUpdatesDistance: 0,
    foregroundService: { notificationTitle: 'Walking tour active', notificationBody: 'Location stays active through silence. Open to pause or end.', killServiceOnDestroy: true },
  });
  // End can arrive while Android is still registering the task. Reconcile
  // that completed registration instead of silently restarting tracking.
  if (requestEpoch !== startEpoch || reviewActive) {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    service = 'Stopped'; notify(); return;
  }
  service = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK) ? 'Registered; waiting for fixes' : 'Not registered';
  if (requestEpoch !== startEpoch) return;
  await dispatch({ type: 'start', at: Date.now(), diagnostics });
  record('session-start', { locationRequest: { accuracy: 'high', timeIntervalMs: 2000, distanceIntervalM: 0 }, battery: await Battery.getBatteryLevelAsync(), lowPower: await Battery.isLowPowerModeEnabledAsync(), foreground, background, service, model: Device.modelName, os: Device.osVersion });
}
export async function end() {
  try { await dispatch({ type: 'end', at: Date.now() }); }
  finally {
    try {
      if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      service = 'Stopped';
    } finally { state = { ...state, active: false }; disposePlayer(); notify(); }
  }
  record('session-end', { battery: await Battery.getBatteryLevelAsync() });
}
export async function newWalk() {
  init(); await queue;
  if (state.active) throw Error('End the current tour first.');
  disposePlayer();
  const fresh = initialState(fixture ?? undefined);
  store.commit('progress', { fixture: JSON.stringify(fixture), state: fresh });
  state = fresh; record('new-walk: old diagnostics retained');
}
export async function locationBatch(locations: Location.LocationObject[]) {
  init();
  if (!state.active || !fixture) return;
  service = 'Receiving background-capable fixes';
  for (const loc of [...locations].sort((a, b) => a.timestamp - b.timestamp)) {
    await dispatch({ type: 'fix', at: Date.now(), fix: { latitude: loc.coords.latitude, longitude: loc.coords.longitude, accuracy: loc.coords.accuracy ?? Infinity, speed: loc.coords.speed ?? undefined, timestamp: loc.timestamp } });
  }
}
export async function locationError(error: unknown) {
  init();
  if (fixture) await dispatch({ type: 'unavailable', at: Date.now(), reason: `location-task-error:${String(error)}` });
}
export async function diagnosticSnapshot() {
  init(); await queue;
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), fixture, state, build: { ...build, model: Device.modelName, os: Device.osVersion }, events: store.events().filter(event => event.fixtureKey === fixtureKey(fixture)) };
}
export function clearDiagnostics() { init(); store.clearLogs(); record('logs-cleared'); }
export function nextTitle() { const i = eligible(state); return i >= 0 ? fixture?.stops[i].title : 'No unplayed stops'; }
