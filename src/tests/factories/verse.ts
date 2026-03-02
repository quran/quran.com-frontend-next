import merge from 'lodash/merge';

import type Verse from '@/types/Verse';

const defaults: Verse = {
  id: 1,
  verseNumber: 1,
  chapterId: 1,
  pageNumber: 1,
  juzNumber: 1,
  hizbNumber: 1,
  rubNumber: 1,
  rubElHizbNumber: 1,
  verseKey: '1:1',
  verseIndex: 0,
  words: [],
  sajdahNumber: null,
  sajdahType: null,
};

export const makeVerse = (overrides: Partial<Verse> = {}): Verse =>
  merge({}, defaults, overrides) as Verse;
