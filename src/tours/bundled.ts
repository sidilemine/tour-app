import type { TourTransport } from './package';
import B from '../../content/north-finchley/packages/B.json';
import A from '../../content/north-finchley/packages/A.json';
export const bundledTours = [B, A] as unknown as (TourTransport & { fixture: import('../domain/fixture').Fixture })[];
