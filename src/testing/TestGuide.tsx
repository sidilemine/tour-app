import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { availability, guide, JournalState, Outcome } from './journal';
import { currentContext, exportTestResults, getJournal } from './nativeJournal';
function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={[s.button, disabled && s.disabled]}><Text style={s.buttonText}>{title}</Text></Pressable>;
}
const labels = { 'observed-pass': 'Observed pass', 'observed-fail': 'Observed fail', inconclusive: 'Inconclusive', 'in-progress': 'In progress' };
export function TestGuide({ onClose }: { onClose: () => void }) {
  const [initial] = useState(() => {
    try { return { data: getJournal().read(), error: '' }; }
    catch (e) { return { data: null, error: `Saved guide data could not be read. It has not been deleted. ${String(e)}` }; }
  });
  const [data, setData] = useState<JournalState | null>(initial.data), [error, setError] = useState(initial.error);
  const [exporting, setExporting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const update = (fn: () => JournalState) => { try { setData(fn()); setError(''); } catch (e) { setError(String(e)); } };
  const item = guide.cases.find(c => c.id === data?.selectedCase), active = data?.active;
  const context = currentContext();
  const unavailable = item ? availability(item, context.variant) : null;
  const finish = (outcome: Outcome) => Alert.alert('Save observation?', `${labels[outcome]} is your observation, not an M1 acceptance decision. Previous attempts are retained.`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Save result', onPress: () => update(() => getJournal().finish(outcome, Date.now(), currentContext())) },
  ]);
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}><Text style={s.heading}>Offline test guide</Text><Button title="Back to player" onPress={onClose} /></View>
      <ScrollView key={data?.selectedCase ?? 'case-list'} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.description}>M1: implemented; awaiting physical test. Guide {guide.revision} · {context.variant === 'development' ? 'Development build' : 'Self-contained build'}.</Text>
        {!!error && <Text accessibilityRole="alert" selectable style={s.error}>{error}</Text>}
        {data && <>
          {item ? <>
            <Button title="All test cases" onPress={() => update(() => getJournal().select(null))} />
            <Text style={s.heading}>{item.title}</Text>
            <Text style={s.tag}>{item.preparation === 'engineer' ? 'Engineer preparation required' : 'Independent test with stated equipment'}</Text>
            <Text style={s.description}>{item.needs}</Text>
            {!!unavailable && <Text style={s.error}>{unavailable}</Text>}
            <Text style={s.subheading}>Steps</Text>
            {item.steps.map((step, i) => <Text key={i} style={s.description}>{i + 1}. {step}</Text>)}
            <Text style={s.subheading}>Expected result</Text><Text style={s.description}>{item.expected}</Text>
            {!active && <Button title="Begin attempt — save a record" disabled={!!unavailable} onPress={() => {
              const begin = () => update(() => getJournal().begin(item.id, Date.now(), currentContext()));
              if (item.preparation === 'engineer') Alert.alert('Preparation required', item.needs, [{ text: 'Not prepared', style: 'cancel' }, { text: 'Prepared — begin', onPress: begin }]);
              else begin();
            }} />}
            {active?.caseId === item.id ? <View style={s.card}>
              <Text style={s.subheading}>Attempt in progress</Text>
              <Text style={s.description}>Started {new Date(active.startedAt).toLocaleString()}. Notes save as you type. Return to the player for Start / Pause / Resume / End.</Text>
              <Text style={s.label}>Conditions</Text><TextInput accessibilityLabel="Test conditions" multiline maxLength={2000} style={s.input} value={active.conditions} onChangeText={conditions => update(() => getJournal().edit({ conditions }))} placeholder="Network, battery start/end, saver, app battery policy, permissions, speaker/headphones" />
              <Text style={s.label}>What happened?</Text><TextInput accessibilityLabel="Test observations" multiline maxLength={6000} style={s.input} value={active.notes} onChangeText={notes => update(() => getJournal().edit({ notes }))} placeholder="Actual silence / arrival times, pause behavior, crashes, duplicates, export filename. Note untested subcases." />
              <Text style={s.description}>End the tour in the player after the test. Saving a result does not stop tracking. An untested subcase means this case is inconclusive.</Text>
              {(['observed-pass','observed-fail','inconclusive'] as Outcome[]).map(outcome => <Button key={outcome} title={`Save ${labels[outcome].toLowerCase()}`} onPress={() => finish(outcome)} />)}
            </View> : active ? <Text style={s.error}>Another attempt is in progress. Open it from All test cases and save its result first.</Text> : null}
            <Text style={s.subheading}>Saved attempts</Text>
            {data.attempts.filter(a => a.caseId === item.id).length === 0 && <Text style={s.description}>No observations saved for this case yet. Earlier physical evidence remains in the engineer’s result record.</Text>}
            {data.attempts.filter(a => a.caseId === item.id).slice().reverse().map(a => <View key={a.id} style={s.card}>
              <Text style={s.label}>{labels[a.outcome]} · {new Date(a.startedAt).toLocaleString()}</Text>
              <Text selectable style={s.description}>{a.conditions}{'\n'}{a.notes}</Text>
              <Text style={s.small}>{a.start.variant} · {a.start.sourceId} · guide {a.guideRevision}. Awaiting evidence review.</Text>
            </View>)}
          </> : <>
            <Text style={s.description}>{guide.intro}</Text>
            {active && <Button title="Continue saved attempt" onPress={() => update(() => getJournal().select(active.caseId))} />}
            <Button title={showSetup ? 'Hide setup and export instructions' : 'Read setup and export instructions'} onPress={() => setShowSetup(!showSetup)} />
            {showSetup && guide.common.map((line, i) => <Text key={i} style={s.description}>{i + 1}. {line}</Text>)}
            <Text style={s.subheading}>Choose a test</Text>
            {guide.cases.map(c => {
              const count = data.attempts.filter(a => a.caseId === c.id).length;
              return <View key={c.id} style={s.card}><Button title={c.title} onPress={() => update(() => getJournal().select(c.id))} /><Text style={s.small}>{c.preparation === 'engineer' ? 'Needs engineer preparation' : 'Independent'} · {c.build === 'either' ? 'Either build' : c.build} · {count} saved attempt{count === 1 ? '' : 's'}{active?.caseId === c.id ? ' · IN PROGRESS' : ''}</Text></View>;
            })}
          </>}
          <Button title={exporting ? 'Exporting…' : 'Export test results JSON'} disabled={exporting} onPress={() => {
            setExporting(true); void exportTestResults().catch(e => setError(String(e))).finally(() => setExporting(false));
          }} />
          <Text style={s.description}>Save locally with the matching Private diagnostics export from the player. Nothing is uploaded automatically. Build {context.sourceId}. Viewing this guide does not control playback.</Text>
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </Modal>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef2ee' }, header: { padding: 16, paddingTop: (StatusBar.currentHeight || 24) + 12, gap: 10, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 60, gap: 16 }, heading: { fontSize: 24, fontWeight: '700', color: '#183c30' }, subheading: { fontSize: 19, fontWeight: '700', color: '#183c30' },
  description: { fontSize: 16, lineHeight: 24, color: '#344d40' }, label: { fontSize: 16, fontWeight: '700', color: '#183c30' }, small: { fontSize: 13, lineHeight: 20, color: '#52645c' }, tag: { fontSize: 14, fontWeight: '700', color: '#75501c' },
  button: { padding: 14, minHeight: 48, backgroundColor: '#214f3d', borderRadius: 10 }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }, disabled: { opacity: 0.4 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 12 },
  input: { minHeight: 110, backgroundColor: '#f1f4f2', padding: 12, borderRadius: 8, fontSize: 16, textAlignVertical: 'top' }, error: { padding: 14, backgroundColor: '#ffe6cc', color: '#6c3517', lineHeight: 22 },
});
