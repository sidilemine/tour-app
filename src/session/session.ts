import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { Fixture, parseFixture } from '../domain/fixture';
import { eligible, Event, initialState, recovered, reduce, State } from '../domain/engine';
import { Store } from '../storage/store';
import { PlayGate } from './playGate';
import buildInfo from '../buildInfo.json';
import { nativeAudioGeneration } from './nativeAudio';
const build = { ...buildInfo, variant: __DEV__ ? 'development' : 'offline-release' };

export const LOCATION_TASK = 'walking-tour-location-v1';
const assets = [require('../../assets/audio/a.m4a'), require('../../assets/audio/b.m4a'), require('../../assets/audio/c.m4a')];
const listeners = new Set<() => void>();
let store: Store;
let fixture: Fixture | null = null;
let state = initialState();
let player: AudioPlayer | null = null;
let statusListener: { remove(): void } | null = null;
let files: string[] = [];
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
async function prepareAudio() {
  if (!files.length) {
    const dir = `${FileSystem.documentDirectory}clips/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ready: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const target = `${dir}${i}.m4a`;
      if (!(await FileSystem.getInfoAsync(target)).exists) {
        const asset = await Asset.fromModule(assets[i]).downloadAsync();
        if (!asset.localUri) throw Error('Local audio asset is unavailable. Load all assets while Metro is connected.');
        await FileSystem.copyAsync({ from: asset.localUri, to: target });
      }
      const info = await FileSystem.getInfoAsync(target);
      if (!info.exists || info.size === 0) throw Error('Empty or missing audio clip.');
      ready.push(target);
    }
    files = ready;
  }
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix', allowsRecording: false });
}
function disposePlayer() {
  statusListener?.remove(); statusListener = null;
  if (player) { player.pause(); player.clearLockScreenControls(); player.release(); player = null; }
}
export function dispatch(event: Event): Promise<void> {
  // A queued pause cancels in-flight asynchronous preparation before any sound.
  const playEpoch = playGate.receive(event.type);
  if (event.type === 'pause' || event.type === 'end') player?.pause();
  const job = queue.then(async () => {
    init();
    if (fatal) throw Error(fatal);
    if (!fixture) throw Error('Load or record a three-stop fixture first.');
    const result = reduce(state, event, fixture);
    // A single synchronous transaction records policy BEFORE native effects.
    store.commit('progress', { fixture: JSON.stringify(fixture), state: result.state }, result.state.diagnostics ? { kind: 'transition', fixtureKey: fixtureKey(fixture), event, before: state, after: result.state, effects: result.effects, reason: result.reason } : undefined);
    state = result.state;
    recent.unshift({ reason: result.reason, at: event.at }); recent.splice(20); notify();
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
        const metadata = { title: fixture.stops[effect.index].title, artist: 'Walking Tour Lab', albumTitle: fixture.title };
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
  init(); await queue;
  if (state.active) throw Error('End the tour before replacing its fixture.');
  const next = parseFixture(text);
  // Same content keeps recovery state. Different content requires the UI's confirmation.
  if (JSON.stringify(fixture) === JSON.stringify(next)) return;
  if (fixture && fixtureKey(fixture) === fixtureKey(next)) throw Error('Changed fixture content needs a new version number.');
  const archiveKey = `archive:${fixtureKey(next)}`;
  const archived = store.read<{ fixture: string; state: State }>(archiveKey);
  if (archived && archived.fixture !== JSON.stringify(next)) throw Error('That fixture ID/version already names different content. Increment its version.');
  if (fixture) store.commit(`archive:${fixtureKey(fixture)}`, { fixture: JSON.stringify(fixture), state });
  disposePlayer();
  store.commit('fixture', next);
  fixture = next; state = archived ? recovered(archived.state) : initialState();
  store.commit('progress', { fixture: JSON.stringify(fixture), state });
  record('fixture-loaded');
}
export async function start(diagnostics: boolean) {
  init(); if (!fixture) throw Error('Configure a walking fixture first.');
  await prepareAudio();
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) throw Error('Location denied. Manual playback is available; grant location to start tracking.');
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) throw Error('Allow location “all the time” in Settings for this background test. Manual playback remains available.');
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2,
    deferredUpdatesInterval: 0, deferredUpdatesDistance: 0,
    foregroundService: { notificationTitle: 'Walking tour active', notificationBody: 'Location stays active through silence. Open to pause or end.', killServiceOnDestroy: true },
  });
  service = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK) ? 'Registered; waiting for fixes' : 'Not registered';
  await dispatch({ type: 'start', at: Date.now(), diagnostics });
  record('session-start', { battery: await Battery.getBatteryLevelAsync(), lowPower: await Battery.isLowPowerModeEnabledAsync(), foreground, background, service, model: Device.modelName, os: Device.osVersion });
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
  const fresh = initialState();
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
