import { chapter } from '../../../tests/mocks/chapters';

import type Chapter from '@/types/Chapter';

// Spread is used instead of lodash/merge to ensure arrays (e.g. `pages`) are
// replaced wholesale by overrides, not merged by index — lodash would turn
// { pages: [1, 2] } + { pages: [50] } into { pages: [50, 2] }.
export const makeChapter = (overrides: Partial<Chapter> = {}): Chapter =>
  ({ ...chapter, ...overrides } as Chapter);
