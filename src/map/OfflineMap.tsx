import React, { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, LogManager, Map, NetworkManager } from '@maplibre/maplibre-react-native';
import type { State } from '../domain/engine';
import type { Fixture } from '../domain/fixture';
import { prepareLocalMap } from './localMap';
import { bounds, centre, makeMapStyle, visibleFix } from './style';
import catalog from './catalog.json';
import notices from './notices.json';

const initialViewState = { center: centre, zoom: 15.5 };

export function OfflineMap({ state, fixture, onClose }: { state: State; fixture?: Fixture | null; onClose: () => void }) {
  const [directory, setDirectory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0), [credits, setCredits] = useState(false);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const openedAt = useRef(0), rendered = useRef(false);
  const style = React.useMemo(() => directory ? makeMapStyle(directory) : null, [directory]);
  useEffect(() => {
    let cancelled = false;
    openedAt.current = Date.now(); rendered.current = false;
    void prepareLocalMap(attempt > 0).then(path => {
      if (cancelled) return;
      NetworkManager.setConnected(false);
      setDirectory(path);
    }).catch(reason => { if (!cancelled) setError(String(reason)); });
    const timeout = setTimeout(() => { if (!rendered.current && !cancelled) setError('The map has not finished drawing. Return to the player or rebuild the local map copy.'); }, 45000);
    LogManager.onLog(log => { if (!cancelled && log.level === 'error') setError(`Map rendering error: ${log.message}`); return false; });
    return () => { cancelled = true; clearTimeout(timeout); LogManager.onLog(() => false); };
  }, [attempt]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const sub = AppState.addEventListener('change', () => setNow(Date.now()));
    return () => { clearInterval(timer); sub.remove(); };
  }, []);
  const fix = visibleFix(state.location.fix, state.active, now);
  function didRender() {
    if (!rendered.current) { rendered.current = true; setRenderMs(Date.now() - openedAt.current); }
  }
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.button}><Text style={styles.link}>Back to player</Text></Pressable>
        <Text style={styles.title}>North Finchley</Text>
        <Text style={styles.body}>{fixture?.narration ? fixture.title : 'Offline area map'}</Text>
      </View>
      {credits ? <ScrollView style={styles.credits}>
        <Pressable accessibilityRole="button" onPress={() => setCredits(false)} style={styles.button}><Text style={styles.link}>Back to map</Text></Pressable>
        <Text selectable style={styles.body}>{notices.attribution}{'\n\n'}{notices.fontLicense}{'\n\n'}{notices.rendererLicenses}</Text>
      </ScrollView> : error ? <View style={styles.message}>
        <Text style={styles.title}>Map unavailable</Text><Text selectable style={styles.body}>{error}</Text>
        <Text style={styles.body}>The player and saved tour progress remain available.</Text>
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setDirectory(null); setError(null); setRenderMs(null); setAttempt(n => n + 1); }}><Text style={styles.link}>Rebuild local map copy</Text></Pressable>
      </View> : style ? <Map style={styles.map} mapStyle={style} attribution={false} logo={false} compass={false} touchRotate={false} touchPitch={false} preferredFramesPerSecond={30}
        onDidFinishRenderingMapFully={didRender} onDidFailLoadingMap={() => setError('The local map could not be loaded.')}>
        <Camera initialViewState={initialViewState} minZoom={14} maxZoom={18} maxBounds={bounds} />
        {fixture?.narration && <>
          <GeoJSONSource id="planned-route" data={{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: fixture.route.map(p => [p.longitude, p.latitude]) } }}>
            <Layer id="planned-route-line" type="line" paint={{ 'line-color': '#216846', 'line-width': 4, 'line-opacity': 0.8 }} />
          </GeoJSONSource>
          <GeoJSONSource id="planned-stops" data={{ type: 'FeatureCollection', features: fixture.stops.map((s, i) => ({ type: 'Feature', properties: { number: String(i + 1) }, geometry: { type: 'Point', coordinates: [s.standing.longitude, s.standing.latitude] } })) }}>
            <Layer id="planned-stop-dots" type="circle" paint={{ 'circle-color': '#214f3d', 'circle-radius': 13, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }} />
            <Layer id="planned-stop-numbers" type="symbol" layout={{ 'text-field': ['get', 'number'], 'text-font': ['Noto Sans Regular'], 'text-size': 14, 'text-allow-overlap': true }} paint={{ 'text-color': '#fff' }} />
          </GeoJSONSource>
        </>}
        {fix && <GeoJSONSource id="session-position" data={{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [fix.longitude, fix.latitude] } }}>
          <Layer id="session-position-dot" type="circle" paint={{ 'circle-color': '#196ca1', 'circle-radius': 7, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 }} />
        </GeoJSONSource>}
      </Map> : <View style={styles.message}><Text style={styles.body}>Checking the bundled map and fonts…</Text></View>}
      <View style={styles.footer}>
        <Text style={styles.body}>{fix ? `Recent tour position · ±${Math.round(fix.accuracy)} m` : 'No recent tour position inside this map area.'}</Text>
        <Text style={styles.small}>Grey areas are outside the saved coverage. Street data does not verify access or a safe place to stop.</Text>
        <Pressable accessibilityRole="button" onPress={() => setCredits(!credits)} style={styles.button}><Text style={styles.link}>© OpenStreetMap contributors · Map credits</Text></Pressable>
        <Text selectable style={styles.small}>{catalog.id}{'\n'}{renderMs === null ? 'Waiting for a complete map frame' : `First complete frame: ${(renderMs / 1000).toFixed(1)} s · files checked`}</Text>
      </View>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f5ef' }, header: { paddingHorizontal: 18, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 24, paddingBottom: 10, gap: 4 },
  title: { fontSize: 23, fontWeight: '700', color: '#183c30' }, body: { fontSize: 14, lineHeight: 20, color: '#40594b' }, small: { fontSize: 11, lineHeight: 16, color: '#52645c' },
  button: { minHeight: 44, justifyContent: 'center' }, link: { fontSize: 14, fontWeight: '600', color: '#215b44' }, map: { flex: 1 },
  message: { flex: 1, padding: 22, gap: 16, justifyContent: 'center' }, footer: { padding: 16, paddingBottom: 24, gap: 4 }, credits: { flex: 1, padding: 20 },
});
