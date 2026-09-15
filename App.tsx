import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Alert, AppState, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Coordinate, distance, Fixture } from './src/domain/fixture';
import { eligible, pendingArrivalNeedsFreshFix } from './src/domain/engine';
import * as session from './src/session/session';
import { TestGuide } from './src/testing/TestGuide';
import { ExportDialog } from './src/export/ExportDialog';
import { makeExport, ExportDraft } from './src/export/jsonExport';

type Draft = { route: Coordinate[]; stops: Fixture['stops'] };
function Button({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.secondary, disabled && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
}
export default function App() {
  const { fixture, state, fatal, service, recent } = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [busy, setBusy] = useState(false), [editing, setEditing] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [exportDraft, setExportDraft] = useState<ExportDraft | null>(null);
  const [json, setJson] = useState(''), [diagnostics, setDiagnostics] = useState(true);
  const [recording, setRecording] = useState(false), [checked, setChecked] = useState(false);
  const [draft, setDraft] = useState<Draft>({ route: [], stops: [] });
  const latest = useRef<Location.LocationObject | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  useEffect(() => { session.init(); }, []);
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try { await action(); } catch (error) { Alert.alert('Action could not finish', String(error)); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    if (!recording) return;
    let cancelled = false, sub: Location.LocationSubscription | undefined;
    const foregroundOnly = AppState.addEventListener('change', status => { if (status !== 'active') setRecording(false); });
    void (async () => {
      if (!(await Location.requestForegroundPermissionsAsync()).granted) throw Error('Location permission is needed to record the path.');
      sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 3 }, fix => {
        latest.current = fix; setAccuracy(fix.coords.accuracy);
        if ((fix.coords.accuracy ?? 999) > 35) return;
        const point = { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
        setDraft(old => old.route.length && distance(old.route[old.route.length - 1], point) < 8 ? old : { ...old, route: [...old.route, point] });
      });
      if (cancelled) sub.remove();
    })().catch(error => { Alert.alert('Path recording', String(error)); setRecording(false); });
    return () => { cancelled = true; sub?.remove(); foregroundOnly.remove(); };
  }, [recording]);
  function captureStop() {
    const fix = latest.current;
    if (!fix || Date.now() - fix.timestamp > 15000 || (fix.coords.accuracy ?? 999) > 35) { Alert.alert('Wait for a usable fix', 'Stand safely outdoors; the fix must be recent and accuracy within 35 m.'); return; }
    const standing = { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
    setDraft(old => {
      const route = [...old.route, standing];
      const i = old.stops.length;
      return { route, stops: [...old.stops, { id: ['a', 'b', 'c'][i], title: `Stop ${['A', 'B', 'C'][i]}`, standing, routeIndex: route.length - 1, approach: 'Recorded walking path; review before testing.', viewpoint: 'No landmark orientation asserted.', access: 'User must check access and safe standing position.' }] };
    });
    if (draft.stops.length === 2) setRecording(false);
  }
  async function importFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled) setJson(await FileSystem.readAsStringAsync(result.assets[0].uri));
  }
  async function saveDraft() {
    const f: Fixture = { schemaVersion: 1, id: `recorded-${Date.now()}`, version: 1, title: 'My three-stop test walk', verification: { status: checked ? 'user_checked' : 'unverified', note: checked ? 'User reports checking this path and standing areas. No independent verification.' : 'Recorded GPS geometry only; physical access/orientation not verified.' }, ...draft };
    await session.loadFixture(JSON.stringify(f)); setJson(JSON.stringify(f, null, 2)); setEditing(false);
  }
  async function exportFixture() { setExportDraft(makeExport('walking-fixture', fixture)); }
  async function exportDiagnostics() { setExportDraft(makeExport('walking-diagnostics', await session.diagnosticSnapshot())); }
  function requestStart() {
    Alert.alert('Start the physical test', 'Use a path and standing areas you have checked. Background location remains active through silence and pause until End. With diagnostics enabled, precise GPS is stored only on this phone and included in your export.', [
      { text: 'Cancel', style: 'cancel' }, { text: 'Path checked — Start', onPress: () => void run(() => session.start(diagnostics)) },
    ]);
  }
  const next = eligible(state);
  const current = state.playback.index === null ? 'Silence' : fixture?.stops[state.playback.index].title;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>WALKING TOUR LAB · M1</Text>
    <Text style={styles.heading}>{'A walk. A pause.\nThe next arrival.'}</Text>
    <Text style={styles.description}>A device experiment, with real silence between local clips. The guide retains procedures for reference and targeted checks.</Text>
    <Button secondary label="Offline test guide / saved results" onPress={() => setGuideOpen(true)} />
    {exportDraft && <ExportDialog draft={exportDraft} onClose={() => setExportDraft(null)} />}
    {guideOpen && <TestGuide onClose={() => setGuideOpen(false)} />}
    {fatal ? <View style={styles.warning}><Text selectable>{fatal}</Text></View> : null}
    <View style={styles.card}>
      <Text style={styles.section}>{fixture?.title || 'Set up your test walk'}</Text>
      <Text style={styles.description}>{fixture ? `3 stops · ${fixture.verification.status.replace('_', ' ')} · ${fixture.route.length} route points` : 'Record your own path or load a three-stop JSON fixture. No sample route is represented as safe or verified.'}</Text>
      {fixture && <Text style={fixture.audioProfile ? styles.hold : styles.description}>{fixture.audioProfile ? 'EDGE TEST: A lasts 3:30. Use only for early-arrival / pass-pending checks.' : 'STANDARD CLIPS: short A/B/C. Use for baseline, detour and battery-saver walks.'}</Text>}
      <Button secondary label={editing ? 'Close configuration' : 'Configure / load fixture'} disabled={state.active || busy} onPress={() => { setEditing(!editing); setJson(fixture ? JSON.stringify(fixture, null, 2) : ''); }} />
      {fixture && !editing ? <Button secondary label="Export fixture JSON" onPress={() => void run(exportFixture)} disabled={busy} /> : null}
    </View>
    {editing ? <View style={styles.card}>
      <Text style={styles.section}>Record a path you know</Text>
      <Text style={styles.description}>Pre-walk with this screen open. Capture A, walk the first path for 3–5 minutes, capture B, then do the same to C. Path points are recorded between stops. Stop walking before tapping. Backgrounding pauses recording.</Text>
      <Text>{draft.route.length} points · {draft.stops.length}/3 stops · GPS {accuracy === null ? 'waiting' : `±${Math.round(accuracy)} m`}</Text>
      <Button secondary label={recording ? 'Pause path recording' : 'Record / continue path'} disabled={draft.stops.length === 3 || state.active} onPress={() => setRecording(!recording)} />
      <Button label={`Capture stop ${['A', 'B', 'C'][draft.stops.length] || 'complete'}`} disabled={!recording || draft.stops.length >= 3} onPress={captureStop} />
      <View style={styles.row}><Switch value={checked} onValueChange={setChecked} /><Text style={styles.flex}>I checked access and standing areas myself</Text></View>
      <Button label="Use recorded fixture" disabled={draft.stops.length !== 3 || busy} onPress={() => void run(saveDraft)} />
      <Button secondary label="Reset draft" onPress={() => { setRecording(false); setDraft({ route: [], stops: [] }); }} />
      <Text style={styles.section}>Or import / edit JSON</Text>
      <Button secondary label="Choose JSON file" onPress={() => void run(importFile)} disabled={busy || recording} />
      <TextInput accessibilityLabel="Walking fixture JSON" multiline autoCapitalize="none" autoCorrect={false} style={styles.input} value={json} onChangeText={setJson} placeholder="Paste a three-stop fixture here" />
      <Button label="Validate and load JSON" disabled={!json || busy || recording} onPress={() => Alert.alert('Load fixture', 'Different content starts separate progress. Existing diagnostics are kept; export them before changing routes.', [{ text: 'Cancel' }, { text: 'Load', onPress: () => void run(async () => { await session.loadFixture(json); setEditing(false); }) }])} />
    </View> : null}
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{state.active ? 'TOUR ACTIVE' : 'TOUR STOPPED'}</Text>
      <Text style={styles.section}>{current} · {state.playback.status}</Text>
      <Text style={styles.description}>Next: {next >= 0 ? fixture?.stops[next].title || '—' : 'No unplayed stops'}{state.playback.index !== null ? `\nSaved position: ${state.playback.offset.toFixed(1)} s` : ''}</Text>
      <Text style={state.hold ? styles.hold : styles.description}>{state.hold ? `Playback held: ${state.hold}` : 'Automatic speech may play on eligible arrival'}</Text>
      <View style={styles.row}><Switch accessibilityLabel="Record private diagnostics" value={diagnostics} onValueChange={setDiagnostics} disabled={state.active} /><Text style={styles.flex}>Record private diagnostics (includes GPS)</Text></View>
      <Button label={busy ? 'Working…' : 'Start tracking + first clip'} disabled={!fixture || state.active || busy || recording || !!fatal} onPress={requestStart} />
      <View style={styles.row}>
        <View style={styles.flex}><Button label="Pause" disabled={!fixture || busy} onPress={() => void run(() => session.dispatch({ type: 'pause', at: Date.now() }))} /></View>
        <View style={styles.flex}><Button label="Resume" disabled={!fixture || busy} onPress={() => void run(() => session.dispatch({ type: 'resume', at: Date.now() }))} /></View>
      </View>
      <Button secondary label="End tour / stop location" disabled={!fixture || busy} onPress={() => void run(session.end)} />
      <Button secondary label="New walk / reset progress" disabled={!fixture || state.active || busy} onPress={() => Alert.alert('Start a new attempt?', 'This resets stop progress and audio position. Existing diagnostics are retained.', [{ text: 'Cancel' }, { text: 'New walk', onPress: () => void run(session.newWalk) }])} />
      <View style={styles.row}><Switch accessibilityLabel="Automatic arrival playback" value={state.automatic} disabled={!fixture || busy} onValueChange={enabled => void run(() => session.dispatch({ type: 'automatic', at: Date.now(), enabled }))} /><Text style={styles.flex}>Automatic arrival playback</Text></View>
    </View>
    {fixture ? <View style={styles.card}><Text style={styles.section}>Manual playback</Text><Text style={styles.description}>Play a clip deliberately, even while automatic speech is held.</Text>{fixture.stops.map((stop, index) => <View key={stop.id} style={styles.stop}><Text style={styles.stopTitle}>{stop.title} · {state.stops[index]}</Text><View style={styles.row}><View style={styles.flex}><Button label={`Play ${['A', 'B', 'C'][index]}`} disabled={busy} onPress={() => void run(() => session.dispatch({ type: 'manual', index, at: Date.now() }))} /></View><View style={styles.flex}><Button secondary label="Skip" disabled={busy} onPress={() => void run(() => session.dispatch({ type: 'skip', index, at: Date.now() }))} /></View></View></View>)}</View> : null}
    <View style={styles.card}>
      <Text style={styles.section}>Why it spoke — or stayed quiet</Text>
      {pendingArrivalNeedsFreshFix(state, recent[0]?.at ?? 0) ? <Text style={styles.hold}>Waiting for a fresh location before the next clip. Stay at the checked stop; manual playback is available.</Text> : null}
      <Text selectable style={styles.mono}>{service}{'\n'}{state.location.reason}{'\n'}{state.location.fix ? `Last fix ${new Date(state.location.fix.timestamp).toLocaleTimeString()} · ±${state.location.fix.accuracy.toFixed(0)} m` : 'No usable fix'}{'\n'}{state.location.distance !== undefined ? `To eligible stop: ${state.location.distance.toFixed(0)} m\nCross-track: ${state.location.crossTrack?.toFixed(0)} m\nAlong-route: ${state.location.along?.toFixed(0)} m\nArrival agreement: ${state.location.count} fixes` : ''}</Text>
      <Button secondary label="Export private diagnostics" disabled={busy} onPress={() => void run(exportDiagnostics)} />
      <Button secondary label="Delete diagnostic log" disabled={state.active} onPress={() => Alert.alert('Delete local diagnostics?', 'Export first if you need this walk for debugging. Progress is kept.', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: session.clearDiagnostics }])} />
      {recent.slice(0, 8).map((event, i) => <Text key={i} style={styles.log}>{new Date(event.at).toLocaleTimeString()} · {event.reason}</Text>)}
    </View>
    <Text style={styles.footer}>Read the Offline test guide before your next attempt. Use the self-contained build away from the Mac; development tests need preparation. Pause stays respected. End stops location. Reopening requires Start then deliberate Resume.</Text>
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef2ee' }, content: { padding: 20, paddingTop: (StatusBar.currentHeight || 28) + 24, paddingBottom: 50, gap: 18 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8, color: '#466354' }, heading: { fontSize: 34, lineHeight: 39, fontWeight: '700', color: '#183c30' },
  description: { color: '#52645c', lineHeight: 22, fontSize: 15 }, card: { backgroundColor: '#fff', padding: 18, borderRadius: 18, gap: 12 }, section: { fontSize: 20, fontWeight: '700', color: '#183c30' },
  button: { backgroundColor: '#214f3d', padding: 15, borderRadius: 10, alignItems: 'center', minHeight: 48 }, buttonText: { color: 'white', fontWeight: '700', fontSize: 15 }, secondary: { backgroundColor: '#edf3ef' }, secondaryText: { color: '#214f3d' }, disabled: { opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flex: { flex: 1 }, hold: { color: '#845621', fontWeight: '700' }, warning: { backgroundColor: '#ffe6cc', padding: 16, borderRadius: 10 }, input: { fontFamily: 'monospace', fontSize: 12, backgroundColor: '#f1f4f2', minHeight: 150, maxHeight: 260, padding: 12, textAlignVertical: 'top' },
  stop: { borderTopWidth: 1, borderColor: '#e3eae5', paddingTop: 14, gap: 10 }, stopTitle: { fontWeight: '600', color: '#234b3b' }, mono: { fontFamily: 'monospace', fontSize: 12, lineHeight: 20 }, log: { fontSize: 11, color: '#607468' }, footer: { fontSize: 13, color: '#52645c', lineHeight: 21 },
});
