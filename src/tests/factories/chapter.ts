import { chapter } from '../../../tests/mocks/chapters';

import type Chapter from '@/types/Chapter';

// structuredClone deep-copies the base object so nested fields (defaultSlug,
// pages) are not shared references with the module-level `chapter` constant.
// Without this, a test that mutates a factory result would corrupt subsequent
// makeChapter() calls in the same test run.
//
// Spread is used (not lodash/merge) so array overrides like { pages: [50] }
// replace the default array wholesale rather than merging by index.
export const makeChapter = (overrides: Partial<Chapter> = {}): Chapter =>
  ({ ...structuredClone(chapter), ...overrides } as Chapter);
