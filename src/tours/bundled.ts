import type { TourTransport } from './package';
import B from '../../content/north-finchley/packages/B.json';
import A from '../../content/north-finchley/packages/A.json';
import C from '../../content/clerkenwell/packages/working-lives.json';
import H from '../../content/hampstead/packages/room-to-breathe.json';
import Q from '../../content/queensway/packages/behind-the-fronts.json';
export const bundledTours = [Q, H, C, B, A] as unknown as (TourTransport & { fixture: import('../domain/fixture').Fixture })[];
