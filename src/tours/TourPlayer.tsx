import React, { useState, useSyncExternalStore } from 'react';
import { Alert, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as session from '../session/session';
import { eligible } from '../domain/engine';
import { narrationAt } from '../domain/narration';
import { OfflineMap } from '../map/OfflineMap';
import { importTour, tourLibrary, tourMapId } from './nativeLibrary';
import { bundledTours } from './bundled';
import { StoryReview } from '../feedback/StoryReview';
import { ExportDialog } from '../export/ExportDialog';
import { ExportDraft, makeExport } from '../export/jsonExport';

function Button({ label, action, disabled = false, secondary = false }: { label: string; action: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={action} style={[styles.button, secondary && styles.secondary, disabled && { opacity: 0.4 }]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
}
export function TourPlayer({ onOpenLab }: { onOpenLab: () => void }) {
  const { fixture, state, fatal } = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [busy, setBusy] = useState(false), [map, setMap] = useState(false), [library, setLibrary] = useState(() => tourLibrary());
  const [review, setReview] = useState<number | null>(null), [reading, setReading] = useState<number | null>(null);
  const [exportDraft, setExportDraft] = useState<ExportDraft | null>(null);
  const tour = fixture?.narration ? fixture : null, narration = tour?.narration;
  const playing = state.playback.index === null || !tour ? undefined : narrationAt(tour, state.playback.index);
  const next = eligible(state);
  // Retain old packages/progress, but show the latest edition of each walk.
  // An older selected edition stays visible until the user changes tours.
  const visibleLibrary = library.filter(entry =>
    (entry.fixture.id === tour?.id && entry.fixture.version === tour.version)
    || !library.some(newer => newer.fixture.id === entry.fixture.id && newer.fixture.version > entry.fixture.version));
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try { await action(); } catch (error) { Alert.alert('Could not finish', String(error)); }
    finally { setBusy(false); setLibrary(tourLibrary()); }
  }
  async function chooseFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled) return;
    const info = await FileSystem.getInfoAsync(result.assets[0].uri);
    if (!info.exists || info.size > 100_000_000) throw Error('Tour package is missing or larger than 100 MB.');
    await importTour(JSON.parse(await FileSystem.readAsStringAsync(result.assets[0].uri)));
  }
  function selectStory(index: number) {
    if (!tour) return;
    const earlier = state.stops.slice(0, index).some(s => s === 'unplayed' || s === 'in-progress');
    if (earlier && index < tour.stops.length) {
      Alert.alert('Start from this stop?', 'Earlier unfinished stops will be marked skipped. Their stories remain available to replay.', [{ text: 'Cancel' }, { text: 'Start here', onPress: () => void run(async () => {
        for (let i = 0; i < index; i++) if (state.stops[i] === 'unplayed' || state.stops[i] === 'in-progress') await session.dispatch({ type: 'skip', index: i, at: Date.now() });
        await session.dispatch({ type: 'manual', index, at: Date.now() });
      }) }]);
    } else void run(() => session.dispatch({ type: 'manual', index, at: Date.now() }));
  }
  const readStory = reading !== null && tour ? narrationAt(tour, reading) : undefined;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>YOUR OFFLINE WALKS</Text>
    <Text style={styles.heading}>A different view of familiar streets.</Text>
    {fatal ? <Text selectable style={styles.warning}>{fatal}</Text> : null}
    <View style={styles.card}>
      <Text style={styles.title}>Your tours</Text>
      {visibleLibrary.map(entry => <View key={`${entry.fixture.id}@${entry.fixture.version}`} style={styles.item}>
        <Text style={styles.title}>{entry.fixture.title}</Text><Text style={styles.body}>{entry.fixture.narration?.description}</Text>
        <Button label={tour?.id === entry.fixture.id && tour.version === entry.fixture.version ? 'Selected' : 'Choose this tour'} disabled={busy || state.active || (tour?.id === entry.fixture.id && tour.version === entry.fixture.version)} action={() => void run(() => session.loadFixture(JSON.stringify(entry.fixture)))} />
      </View>)}
      {bundledTours.some(t => !library.some(e => e.fixture.id === t.fixture.id && e.fixture.version === t.fixture.version)) && <Button label="Prepare bundled tours offline" disabled={busy || state.active} action={() => void run(async () => {
        for (const p of bundledTours) await importTour(p);
        await session.loadFixture(JSON.stringify(bundledTours[0].fixture));
      })} />}
      <Button secondary label="Import tour package" disabled={busy || state.active} action={() => void run(chooseFile)} />
      {state.active && <Text style={styles.body}>End the current tour before choosing another. Each tour keeps its own progress.</Text>}
    </View>
    {tour && narration && <>
      <View style={styles.card}>
        <Text style={styles.title}>{tour.title}</Text>
        <Text style={styles.body}>{narration.introduction}</Text>
        <Text style={styles.body}>{narration.reviewNote.replace('close it and Resume when ready', 'save and close it to resume the tour')}</Text>
        <Button secondary label="Map and numbered stops" action={() => setMap(true)} />
      </View>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{state.active ? 'TOUR ACTIVE' : 'TOUR STOPPED'}</Text>
        <Text style={styles.title}>{playing?.title ?? (next < 0 ? 'All stops complete' : 'Time to walk')}</Text>
        <Text style={styles.body}>{playing ? `${state.playback.status} · ${Math.floor(state.playback.offset)} seconds` : next >= 0 ? `Next: ${tour.stops[next]?.title}` : narration.finishInstructions}</Text>
        {state.hold && <Text style={styles.hold}>Paused. Resume when you’re ready.</Text>}
        <Button label={state.startedAt ? 'Start location tracking' : `Start tour at ${tour.stops[0].title}`} disabled={busy || state.active} action={() => void run(() => session.start(false))} />
        <View style={styles.row}>
          <View style={styles.flex}><Button label="Pause" disabled={busy} action={() => void run(() => session.dispatch({ type: 'pause', at: Date.now() }))} /></View>
          <View style={styles.flex}><Button label="Resume" disabled={busy} action={() => void run(() => session.dispatch({ type: 'resume', at: Date.now() }))} /></View>
        </View>
        <View style={styles.row}><Switch accessibilityLabel="Automatic narration" value={state.automatic} onValueChange={enabled => void run(() => session.dispatch({ type: 'automatic', enabled, at: Date.now() }))} disabled={busy} /><Text style={styles.body}>Automatic narration on arrival</Text></View>
        <Button secondary label="End tour / stop location" disabled={busy} action={() => void run(session.end)} />
        <Button secondary label="Take this tour again" disabled={busy || state.active} action={() => Alert.alert('Start a new walk?', 'Resets this tour’s playback progress. All story reviews and voice notes are kept.', [{ text: 'Cancel' }, { text: 'New walk', onPress: () => void run(session.newWalk) }])} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Stops and stories</Text>
        <Text style={styles.body}>Stop somewhere comfortable before using the screen. You can play or skip any story if GPS misses it.</Text>
        {narration.stories.map((story, index) => <View key={story.id} style={styles.item}>
          <Text style={styles.title}>{index + 1}. {story.title}</Text>
          <Text style={styles.small}>{state.stops[index]}</Text>
          <Text style={styles.body}>{tour.stops[index].viewpoint}</Text>
          <Button label="I’m here / play story" disabled={busy} action={() => selectStory(index)} />
          <View style={styles.row}><View style={styles.flex}><Button secondary label="Read / directions" action={() => setReading(index)} /></View><View style={styles.flex}><Button secondary label="Review story" disabled={busy} action={() => setReview(index)} /></View></View>
          <Button secondary label="Skip this stop" disabled={busy} action={() => void run(() => session.dispatch({ type: 'skip', index, at: Date.now() }))} />
          {narration.chapters.map((chapter, c) => chapter.afterStopIndex === index ? <View key={chapter.id} style={styles.chapter}>
            <Text style={styles.title}>On the walk: {chapter.title}</Text><Text style={styles.body}>Plays after onward departure when narration is enabled. Manual playback is also available.</Text>
            <Button secondary label="Play walking chapter" disabled={busy} action={() => selectStory(tour.stops.length + c)} />
            <View style={styles.row}><View style={styles.flex}><Button secondary label="Read chapter" action={() => setReading(tour.stops.length + c)} /></View><View style={styles.flex}><Button secondary label="Review chapter" action={() => setReview(tour.stops.length + c)} /></View></View>
            <Button secondary label="Skip walking chapter" disabled={busy} action={() => void run(() => session.dispatch({ type: 'skip', index: tour.stops.length + c, at: Date.now() }))} />
          </View> : null)}
        </View>)}
      </View>
      <Text style={styles.body}>{narration.finishInstructions}</Text>
      <Text style={styles.small}>{narration.rightsNote}</Text>
    </>}
    <Button secondary label="Technical tools and saved test results" disabled={busy} action={onOpenLab} />
    <Button secondary label="Export local diagnostics" disabled={busy} action={() => void run(async () => setExportDraft(makeExport('walking-diagnostics', await session.diagnosticSnapshot())))} />
    {map && <OfflineMap state={state} fixture={tour} mapId={tourMapId(tour)} onClose={() => setMap(false)} />}
    {review !== null && tour && <StoryReview fixture={tour} storyIndex={review} onClose={() => setReview(null)} />}
    {exportDraft && <ExportDialog draft={exportDraft} onClose={() => setExportDraft(null)} />}
    {readStory && tour && <Modal visible animationType="slide" onRequestClose={() => setReading(null)}><ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Button label="Back to tour" action={() => setReading(null)} />
      <Text style={styles.heading}>{readStory.title}</Text>
      {reading !== null && reading < tour.stops.length && <>
        <Text style={styles.title}>Approach and viewing place</Text>
        <Text selectable style={styles.body}>{tour.stops[reading].approach}</Text>
        <Text selectable style={styles.body}>{tour.stops[reading].viewpoint}</Text>
        <Text selectable style={styles.body}>{tour.stops[reading].access}</Text>
      </>}
      <Text style={styles.title}>Next directions</Text>{readStory.directions.map((line, i) => <Text selectable style={styles.body} key={i}>{i + 1}. {line}</Text>)}
      <Text style={styles.title}>Transcript</Text><Text selectable style={styles.body}>{readStory.transcript}</Text>
      <Text style={styles.title}>Sources and evidence</Text>
      {readStory.sources.map(source => <Text selectable style={styles.small} key={source.url}>{source.title}{'\n'}{source.url}</Text>)}
      {readStory.evidence.map((e, i) => <Text selectable style={styles.small} key={i}>{e.kind.replaceAll('_', ' ')}: {e.paragraph}{'\n'}{e.basis}</Text>)}
    </ScrollView></Modal>}
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef2ee' }, content: { padding: 20, paddingTop: (StatusBar.currentHeight || 28) + 24, paddingBottom: 50, gap: 18 },
  heading: { fontSize: 32, lineHeight: 38, fontWeight: '700', color: '#183c30' }, eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.6, color: '#466354' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 14 }, title: { fontSize: 20, fontWeight: '700', color: '#183c30' }, body: { color: '#40594b', fontSize: 16, lineHeight: 24 }, small: { color: '#52645c', fontSize: 13, lineHeight: 20 },
  button: { backgroundColor: '#214f3d', padding: 14, borderRadius: 10, minHeight: 48, justifyContent: 'center', alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 }, secondary: { backgroundColor: '#edf3ef' }, secondaryText: { color: '#214f3d' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' }, flex: { flex: 1 }, item: { borderTopWidth: 1, borderColor: '#dce5df', paddingTop: 16, gap: 10 }, chapter: { backgroundColor: '#f5f3e8', borderRadius: 10, padding: 12, gap: 10 }, hold: { color: '#805019', fontWeight: '700' }, warning: { padding: 15, backgroundColor: '#ffe6cc' },
});
