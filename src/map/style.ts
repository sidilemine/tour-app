import type { StyleSpecification, LngLatBounds } from '@maplibre/maplibre-react-native';
import type { Fix } from '../domain/engine';
import catalog from './catalog.json';

export const bounds = catalog.bounds as LngLatBounds;
export const centre: [number, number] = [-0.1785, 51.6130];
export function covered(longitude: number, latitude: number): boolean {
  return longitude >= bounds[0] && longitude <= bounds[2] && latitude >= bounds[1] && latitude <= bounds[3];
}
export function visibleFix(fix: Fix | undefined, active: boolean, now: number): Fix | null {
  return active && fix && now - fix.timestamp <= 15000 && now >= fix.timestamp - 2000 && fix.accuracy >= 0 && fix.accuracy <= 35 && covered(fix.longitude, fix.latitude) ? fix : null;
}

// Only embedded GeoJSON and local file sources. No default style, sprite,
// terrain, remote glyphs, or MapLibre location subscription.
export function makeMapStyle(directory: string): StyleSpecification {
  if (!directory.startsWith('file:///') || !directory.endsWith('/')) throw Error('Map needs an absolute local directory');
  const [w, s, e, n] = bounds;
  return {
    version: 8, name: 'North Finchley offline proof',
    glyphs: `${directory}fonts/{fontstack}/{range}.pbf`,
    sources: {
      basemap: { type: 'vector', url: `pmtiles://${directory}basemap.pmtiles`, bounds, minzoom: 0, maxzoom: 15,
        attribution: '© OpenStreetMap contributors · Natural Earth · Protomaps' },
      outside: { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [
        [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
        [[w, s], [w, n], [e, n], [e, s], [w, s]],
      ] } } },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#f4f0e7' } },
      { id: 'landuse', type: 'fill', source: 'basemap', 'source-layer': 'landuse', paint: { 'fill-color': ['match', ['get', 'kind'], ['park', 'forest', 'wood', 'grass', 'recreation_ground', 'cemetery', 'nature_reserve'], '#d7e5c9', '#e9e5dc'] } },
      { id: 'water', type: 'fill', source: 'basemap', 'source-layer': 'water', paint: { 'fill-color': '#b3d9e9' } },
      { id: 'buildings', type: 'fill', source: 'basemap', 'source-layer': 'buildings', minzoom: 14, paint: { 'fill-color': '#dbd3c7', 'fill-outline-color': '#c5bdb2' } },
      { id: 'road-edge', type: 'line', source: 'basemap', 'source-layer': 'roads', filter: ['match', ['get', 'kind'], ['highway', 'major_road', 'minor_road'], true, false], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#c3b9a9', 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 2, 16, 8, 18, 18] } },
      { id: 'roads', type: 'line', source: 'basemap', 'source-layer': 'roads', filter: ['match', ['get', 'kind'], ['highway', 'major_road', 'minor_road'], true, false], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['match', ['get', 'kind'], ['highway', 'major_road'], '#f4d69d', '#ffffff'], 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1, 16, 5, 18, 14] } },
      { id: 'rail', type: 'line', source: 'basemap', 'source-layer': 'roads', filter: ['==', ['get', 'kind'], 'rail'], paint: { 'line-color': '#8e9292', 'line-dasharray': [4, 2], 'line-width': 2 } },
      { id: 'paths', type: 'line', source: 'basemap', 'source-layer': 'roads', filter: ['==', ['get', 'kind'], 'path'], paint: { 'line-color': '#9d8e7d', 'line-dasharray': [2, 2], 'line-width': 1.5 } },
      { id: 'road-labels', type: 'symbol', source: 'basemap', 'source-layer': 'roads', minzoom: 14, layout: { 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 12 }, paint: { 'text-color': '#4d4b44', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } },
      { id: 'place-labels', type: 'symbol', source: 'basemap', 'source-layer': 'places', layout: { 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 16 }, paint: { 'text-color': '#344c40', 'text-halo-color': '#f4f0e7', 'text-halo-width': 2 } },
      { id: 'outside-coverage', type: 'fill', source: 'outside', paint: { 'fill-color': '#d5d9d5', 'fill-opacity': 1 } },
    ],
  };
}
