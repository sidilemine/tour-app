import { Fixture, parseFixture } from '../domain/fixture';

export function edgeFixture(original: Fixture): Fixture {
  if (original.audioProfile) throw Error('Select the original standard-clip fixture first.');
  return parseFixture(JSON.stringify({ ...original,
    id: `${original.id.slice(0, 65)}-edge-long-a`,
    title: `Edge tests — ${original.title}`.slice(0, 120),
    audioProfile: 'edge-long-a',
  }));
}
