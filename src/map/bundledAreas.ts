/* eslint-disable @typescript-eslint/no-require-imports */
import { bundledMapAssets } from './bundledAssets';
import finchley from './catalog.json';
import clerkenwell from './clerkenwell.json';
import hampstead from './hampstead.json';

export const bundledAreaAssets: Record<string, Record<string, number>> = {
  [finchley.id]: bundledMapAssets,
  [clerkenwell.id]: { ...bundledMapAssets,
    'basemap.pmtiles': require("../../assets/maps/clerkenwell/basemap.pmtiles") },
  [hampstead.id]: { ...bundledMapAssets,
    'basemap.pmtiles': require("../../assets/maps/hampstead/basemap.pmtiles") },
};
