import React, { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { AudioModule, createAudioPlayer, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { Fixture } from '../domain/fixture';
import { narrationAt } from '../domain/narration';
import { ExportDialog } from '../export/ExportDialog';
import { ExportDraft, makeExport } from '../export/jsonExport';
import { setReviewMode } from '../session/session';
import { FeedbackCapture, CapturePhase } from './capture';
import { exportReviews, Review, VoiceNote } from './model';
import { VoicePlayback } from './playback';
import { saveVoiceCopy } from './voiceExport';
import { feedbackStore, inspectVoice, recoverInterruptedNotes } from './native';

export function StoryReview({ fixture, storyIndex, onClose }: { fixture: Fixture; storyIndex: number; onClose: () => void }) {
  const story = narrationAt(fixture, storyIndex), storyId = story?.id ?? fixture.stops[storyIndex]?.id;
  const storyTitle = story?.title ?? fixture.stops[storyIndex]?.title ?? 'Story';
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, directory: 'document' });
  const recorderReleased = useRef(false);
  const [recorderBroken, setRecorderBroken] = useState(false), [recordingMillis, setRecordingMillis] = useState(0);
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);
  const voicePlayback = useRef<VoicePlayback | null>(null), voiceRequest = useRef(0);
  const [review, setReview] = useState<Review | null>(null), [history, setHistory] = useState<Review[]>([]);
  const [phase, setPhase] = useState<CapturePhase>('idle'), [message, setMessage] = useState('Pausing the tour…');
  const [exporting, setExporting] = useState(false);
  const [closing, setClosing] = useState(false), [draft, setDraft] = useState<ExportDraft | null>(null);
  const capture = useRef<FeedbackCapture | null>(null), current = useRef<Review | null>(null), mounted = useRef(true);
  const closePending = useRef(false);
  function refresh() {
    const all = feedbackStore().all();
    if (current.current) current.current = all.find(r => r.id === current.current?.id) ?? current.current;
    if (mounted.current) { setReview(current.current); setHistory(all.filter(r => r.tourId === fixture.id && r.tourVersion === fixture.version)); }
  }
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const requests = voiceRequest;
    recorderReleased.current = false;
    voicePlayback.current = new VoicePlayback({
      inspect: inspectVoice, foreground: () => !cancelled && !closePending.current && AppState.currentState === 'active',
      changed: (id, text) => { if (!cancelled) { setVoicePlaying(id); setMessage(text); } },
      create: uri => {
        const player = createAudioPlayer(uri, { updateInterval: 250 });
        return { play: () => player.play(), pause: () => player.pause(), release: () => player.release(),
          listen: done => {
            const listener = player.addListener('playbackStatusUpdate', status => {
              if (status.error) done(status.error); else if (status.didJustFinish) done();
            });
            return () => listener.remove();
          },
        };
      },
    });
    const repository = feedbackStore();
    const setup = (async () => {
      try {
        await setReviewMode(true);
        if (cancelled) return;
        await recoverInterruptedNotes(repository);
        if (cancelled) return;
        if (!storyId) throw Error('No story selected.');
        current.current = repository.create({ tourId: fixture.id, tourVersion: fixture.version, storyId, storyTitle, storyIndex });
        capture.current = new FeedbackCapture(repository, current.current.id, {
          permission: async () => (await AudioModule.requestRecordingPermissionsAsync()).granted,
          mode: recording => setAudioModeAsync({ allowsRecording: recording, playsInSilentMode: true,
            shouldPlayInBackground: true, allowsBackgroundRecording: false, interruptionMode: 'doNotMix' }),
          prepare: async () => {
            if (recorderReleased.current) throw Error('Close and reopen the review to reset the microphone.');
            await recorder.prepareToRecordAsync();
            if (!recorder.uri) throw Error('Recorder did not provide a private file.');
            return recorder.uri;
          },
          record: () => recorder.record(), stop: async () => {
            if (recorderReleased.current) return;
            try {
              // The pinned Android implementation returns its final status despite
              // the public void type; absence of url means native finalisation failed.
              const result: unknown = await recorder.stop();
              if (result && typeof result === 'object' && 'canRecord' in result && !('url' in result)) throw Error('Native recording did not finalise a usable file.');
            } catch (error) {
              // stopRecording normally releases in its native finally block. A JS
              // permission/bridge failure can precede that block: release explicitly.
              recorderReleased.current = true;
              try { recorder.release(); } catch { /* Native object may already be gone. */ }
              if (!cancelled) setRecorderBroken(true);
              throw error;
            }
          },
          durationMs: () => recorder.getStatus().durationMillis,
          inspect: inspectVoice, foreground: () => !cancelled && !closePending.current && AppState.currentState === 'active',
          changed: (next, text) => { if (!cancelled) { setPhase(next); setMessage(text); refresh(); } },
        });
        refresh(); setMessage('Ratings and text save as you go. The tour stays paused.');
      } catch (error) { if (!cancelled) setMessage(`Review unavailable: ${String(error)}`); }
    })();
    const poll = setInterval(() => {
      if (cancelled || recorderReleased.current) return;
      try { setRecordingMillis(recorder.getStatus().durationMillis); } catch { /* Native object may be releasing during unmount. */ }
    }, 250);
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') { ++voiceRequest.current; voicePlayback.current?.stop(); }
      if (state === 'background' || (state === 'inactive' && capture.current?.phase === 'recording')) void capture.current?.stop('background');
    });
    return () => {
      ++requests.current; voicePlayback.current?.stop();
      cancelled = true; mounted.current = false; subscription.remove(); clearInterval(poll);
      void setup.then(() => capture.current?.stop('close')).finally(() => setReviewMode(false)).catch(() => {});
    };
    // A review instance belongs to one presentation; changing story creates another attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture.id, fixture.version, storyId, storyIndex, storyTitle, recorder]);
  function update(patch: Parameters<ReturnType<typeof feedbackStore>['update']>[1]) {
    if (!current.current) return;
    try { current.current = feedbackStore().update(current.current.id, patch); refresh(); }
    catch (error) { setMessage(`Feedback did not save: ${String(error)}. Please retry before closing.`); }
  }
  async function close() {
    if (closePending.current || exporting) return;
    closePending.current = true; setClosing(true); ++voiceRequest.current; voicePlayback.current?.stop();
    try {
      await capture.current?.stop('close');
      if (current.current) feedbackStore().update(current.current.id, { status: 'saved' });
      await setReviewMode(false); onClose();
    } catch (error) { setMessage(`Could not finish saving: ${String(error)}. Earlier feedback is retained.`); closePending.current = false; setClosing(false); }
  }
  async function saveVoice(voice: VoiceNote, key = storyId) {
    if (phase !== 'idle' || closing || exporting) return;
    ++voiceRequest.current; voicePlayback.current?.stop(); setExporting(true);
    try {
      const destination = await saveVoiceCopy(voice.uri, `${key ?? 'story'}-${voice.id}`);
      if (mounted.current) setMessage(destination ? 'Voice copy saved and verified. The original remains on this phone.' : 'Save cancelled. The original voice note is unchanged.');
    } catch (error) { if (mounted.current) setMessage(`Voice copy did not save: ${String(error)}. The original is retained.`); }
    finally { if (mounted.current) setExporting(false); }
  }
  async function playVoice(voice: VoiceNote) {
    if (phase !== 'idle' || closing || exporting) return;
    const request = ++voiceRequest.current;
    if (voicePlaying === voice.id) { voicePlayback.current?.stop(); return; }
    await capture.current?.stop();
    if (request === voiceRequest.current && !closePending.current && mounted.current) await voicePlayback.current?.play(voice.id, voice.uri);
  }
  function recordOrStop() {
    ++voiceRequest.current;
    voicePlayback.current?.stop();
    void (phase === 'recording' ? capture.current?.stop() : capture.current?.start());
  }
  function exportRatings() {
    ++voiceRequest.current;
    voicePlayback.current?.stop();
    try {
      const exported = makeExport('walking-test-results', exportReviews(feedbackStore().all().filter(r => r.tourId === fixture.id && r.tourVersion === fixture.version)));
      setDraft({ ...exported, fileName: exported.fileName.replace('walking-test-results', 'walking-story-feedback') });
    } catch (error) { setMessage(`Export unavailable: ${String(error)}`); }
  }
  const busy = phase === 'starting' || phase === 'stopping' || closing || exporting;
  return <Modal visible animationType="slide" onRequestClose={() => void close()}>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.heading}>Review this story</Text><Text style={s.title}>{storyTitle}</Text>
      <Text style={s.text}>Stop somewhere comfortable. Scores are optional: 0 is lowest, 10 highest. Close this review, then choose Resume when you want narration again.</Text>
      {review && <>
        <Score title="Interest" question="How much did you want to hear this story?" value={review.interest} disabled={busy} onChange={interest => update({ interest })} />
        <Score title="Value of being here" question="How much did being here add to the story?" value={review.placeValue} disabled={busy} onChange={placeValue => update({ placeValue })} />
        <Score title="Storytelling" question="How well did the telling work?" value={review.storytelling} disabled={busy} onChange={storytelling => update({ storytelling })} />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: review.heardBefore, disabled: busy }} disabled={busy} style={s.check} onPress={() => update({ heardBefore: !review.heardBefore })}><Text style={s.text}>{review.heardBefore ? '☑' : '☐'} Heard this story before</Text></Pressable>
        <Text style={s.title}>What stayed with you, and what would you change?</Text>
        <TextInput accessibilityLabel="Story feedback text" placeholder="Optional text note" value={review.text} multiline maxLength={8000} editable={!closing} onChangeText={text => update({ text })} style={s.input} />
        <Text style={s.text}>A voice note of about 20–40 seconds is useful if convenient. The microphone starts only when you tap Record. Locking the phone or leaving this screen stops and saves it.</Text>
        {phase === 'recording' && <Text accessibilityRole="alert" style={s.recording}>Recording · {Math.floor(recordingMillis / 1000)} seconds</Text>}
        <Button title={phase === 'recording' ? 'Stop and save voice note' : busy ? 'Working…' : 'Record voice note'} disabled={busy || recorderBroken} onPress={recordOrStop} />
        {recorderBroken && <Text style={s.text}>The microphone was safely released after an error. Close and reopen this review to record another note.</Text>}
        <Text style={s.text}>Voice notes stay in private storage on this phone. There is no upload or transcription. JSON export includes ratings, text and note metadata. Save voice copy to folder creates a separate M4A file only when you choose it; its name includes the note ID for matching to the JSON.</Text>
        {review.voices.map(voice => <View key={voice.id} style={s.history}><Text style={s.text}>Voice note: {voice.status}{voice.durationMs ? ` · ${Math.round(voice.durationMs / 1000)} seconds` : ''}{voice.error ? ` — ${voice.error}` : ''}</Text>
          {voice.status === 'saved' && <Button title="Save voice copy to folder" disabled={phase !== 'idle' || closing || exporting} onPress={() => void saveVoice(voice)} />}
          {voice.status === 'saved' && <Button title={voicePlaying === voice.id ? 'Stop voice playback' : 'Play saved voice note'} disabled={phase !== 'idle' || closing || exporting} onPress={() => void playVoice(voice)} />}
        </View>)}
      </>}
      <Text accessibilityRole="alert" style={s.message}>{message}</Text>
      <Button title="Save review and close" disabled={closing || exporting} onPress={() => void close()} />
      {history.length > 0 && <>
        <Text style={s.title}>Saved history for this tour</Text>
        <Text style={s.text}>Each opening keeps a separate attempt. Earlier notes remain saved.</Text>
        {[...history].reverse().slice(0, 12).map(item => <View key={item.id} style={s.history}>
          <Text style={s.title}>#{item.presentationSequence} · {item.storyTitle}</Text>
          <Text style={s.text}>{new Date(item.createdAt).toLocaleString()} · {item.status}{item.heardBefore ? ' · heard before' : ''}</Text>
          <Text style={s.text}>Interest {item.interest ?? '—'} · Place {item.placeValue ?? '—'} · Telling {item.storytelling ?? '—'} · {item.voices.length} voice note(s)</Text>
          {!!item.text && <Text selectable style={s.text}>{item.text}</Text>}
          {item.id !== review?.id && item.voices.filter(v => v.status === 'saved').map((voice, i) => <View key={voice.id} style={s.history}><Button title={voicePlaying === voice.id ? 'Stop voice playback' : `Play saved voice note ${i + 1}`} disabled={phase !== 'idle' || closing || exporting} onPress={() => void playVoice(voice)} /><Button title="Save voice copy to folder" disabled={phase !== 'idle' || closing || exporting} onPress={() => void saveVoice(voice, item.storyId)} /></View>)}
        </View>)}
        <Button title="Export ratings and text as JSON" disabled={phase !== 'idle' || closing || exporting} onPress={exportRatings} />
      </>}
    </ScrollView>
    {draft && <ExportDialog draft={draft} onClose={() => setDraft(null)} />}
  </Modal>;
}
function Button({ title, onPress, disabled }: { title: string; onPress: () => void; disabled: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, disabled && s.disabled]}><Text style={s.buttonText}>{title}</Text></Pressable>;
}
function Score({ title, question, value, onChange, disabled }: { title: string; question: string; value: number | null; onChange: (value: number | null) => void; disabled: boolean }) {
  return <View style={s.score}><Text style={s.title}>{title}</Text><Text style={s.text}>{question}</Text><View style={s.numbers}>
    {Array.from({ length: 11 }, (_, n) => <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${title}: ${n} out of 10`} accessibilityState={{ selected: value === n, disabled }} disabled={disabled} onPress={() => onChange(n)} style={[s.number, value === n && s.selected]}><Text style={[s.numberText, value === n && s.selectedText]}>{n}</Text></Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel={`Clear ${title} rating`} disabled={disabled} onPress={() => onChange(null)} style={s.clear}><Text style={s.text}>{value === null ? 'Not rated' : 'Clear rating'}</Text></Pressable>
  </View></View>;
}
const s = StyleSheet.create({
  content: { padding: 20, paddingTop: (StatusBar.currentHeight || 24) + 20, paddingBottom: 60, gap: 18, backgroundColor: '#eef2ee' },
  heading: { fontSize: 27, fontWeight: '700', color: '#183c30' }, title: { fontSize: 18, fontWeight: '700', color: '#183c30' },
  text: { fontSize: 16, lineHeight: 23, color: '#344d40' }, score: { gap: 9 }, numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  number: { minHeight: 48, minWidth: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'white' },
  numberText: { fontSize: 18, color: '#183c30' }, selected: { backgroundColor: '#214f3d' }, selectedText: { color: 'white', fontWeight: '700' },
  clear: { padding: 12, justifyContent: 'center' }, check: { minHeight: 48, justifyContent: 'center' },
  input: { backgroundColor: 'white', borderRadius: 10, minHeight: 100, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  button: { backgroundColor: '#214f3d', padding: 15, minHeight: 48, borderRadius: 10 }, buttonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.4 }, message: { backgroundColor: 'white', padding: 15, fontSize: 16, lineHeight: 24, borderRadius: 10, color: '#183c30' },
  recording: { color: '#a31515', fontWeight: '700', fontSize: 19 }, history: { gap: 5, padding: 14, borderRadius: 10, backgroundColor: 'white' },
});
