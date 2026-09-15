import { Fixture } from '../domain/fixture';

// A distinct durable filename prevents a cached normal A from masking the long
// test asset, or the long asset leaking into a later baseline. Never loop audio.
export function clipNames(fixture: Fixture | null): readonly string[] {
  return [fixture?.audioProfile === 'edge-long-a' ? 'edge-a-v1' : '0', '1', '2'];
}
