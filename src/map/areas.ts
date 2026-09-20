import finchley from './catalog.json';
import clerkenwell from './clerkenwell.json';

export type MapCatalog = typeof finchley;
export const defaultMapId = finchley.id;
// Two reviewed, bundled areas. Arbitrary imported map assets remain out of scope.
export const mapAreas = [
  { title: 'North Finchley', catalog: finchley },
  { title: 'Clerkenwell / Farringdon', catalog: clerkenwell },
] as const;
export function mapArea(id: string = defaultMapId) {
  const area = mapAreas.find(candidate => candidate.catalog.id === id);
  if (!area) throw Error('This offline map is not bundled in this app.');
  return area;
}
export function mapCentre(catalog: MapCatalog): [number, number] {
  const [west, south, east, north] = catalog.bounds;
  return [(west + east) / 2, (south + north) / 2];
}
