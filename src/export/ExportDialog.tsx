import React, { useRef, useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExportDraft } from './jsonExport';
import { saveExport, shareExport } from './nativeExport';
export function ExportDialog({ draft, onClose }: { draft: ExportDraft; onClose: () => void }) {
  const [name, setName] = useState(draft.fileName), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const inFlight = useRef(false);
  async function run(kind: 'save' | 'share') {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(''); Keyboard.dismiss();
    try {
      if (kind === 'save') setMessage(await saveExport(draft, name) ? 'Saved and verified in your selected folder. If you reused a name, Android may add a number. Your original records are unchanged.' : 'Folder selection cancelled. Nothing was saved. You can retry.');
      else { await shareExport(draft, name); setMessage('Share chooser closed. Delivery depends on the app you chose; this is not confirmation of a local save.'); }
    } catch (error) { setMessage(`Export did not finish: ${String(error)}. Your records are unchanged; retry here.`); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <Modal visible animationType="slide" onRequestClose={() => { if (!busy) onClose(); }}>
    <View style={s.screen}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.heading}>Save or share JSON</Text>
      <Text style={s.text}>A separate date-and-time name is ready for this export. Edit it here if you prefer.</Text>
      <Text style={s.label}>Filename</Text>
      <TextInput accessibilityLabel="Export filename" editable={!busy} value={name} onChangeText={setName} autoCapitalize="none" autoCorrect={false} selectTextOnFocus style={s.input} />
      <Text style={s.text}>For a local copy, choose Save to folder. In the folder picker, choose or create a Walking Tour Tests folder under Documents or Downloads, then tap Use this folder and Allow. Android may block selecting Downloads itself; use a subfolder.</Text>
      {Platform.OS === 'android' && <Button title={busy ? 'Working…' : 'Save to folder'} disabled={busy} onPress={() => void run('save')} />}
      <Button title="Share instead" disabled={busy} onPress={() => void run('share')} />
      {!!message && <Text accessibilityRole="alert" selectable style={s.message}>{message}</Text>}
      <Text style={s.text}>Diagnostics and route files can contain precise locations. Choose local phone storage for an offline save. Share sends only when you choose a recipient; there is no automatic upload. Exporting does not reset a walk or remove earlier records.</Text>
      <Button title="Done / back" disabled={busy} onPress={onClose} />
    </ScrollView></View>
  </Modal>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef2ee' }, content: { padding: 20, paddingTop: (StatusBar.currentHeight || 24) + 24, paddingBottom: 60, gap: 18 },
  heading: { fontSize: 26, fontWeight: '700', color: '#183c30' }, text: { fontSize: 16, lineHeight: 24, color: '#344d40' }, label: { fontSize: 16, fontWeight: '700', color: '#183c30' },
  input: { backgroundColor: 'white', padding: 14, fontSize: 16, borderRadius: 10, minHeight: 56 }, button: { backgroundColor: '#214f3d', padding: 15, minHeight: 48, borderRadius: 10 }, buttonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '700' }, disabled: { opacity: 0.4 }, message: { backgroundColor: '#fff', padding: 15, borderRadius: 10, fontSize: 16, lineHeight: 24, color: '#183c30' },
});

function Button({ title, onPress, disabled }: { title: string; onPress: () => void; disabled: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} style={[s.button, disabled && s.disabled]} onPress={onPress}><Text style={s.buttonText}>{title}</Text></Pressable>;
}
