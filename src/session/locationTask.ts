import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { LOCATION_TASK, locationBatch, locationError } from './session';

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK, async ({ data, error }) => {
  if (error) { await locationError(error.message); return; }
  try { if (data?.locations) await locationBatch(data.locations); }
  catch (error) { await locationError(error); }
});
