import merge from 'lodash/merge';

import type Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';

const defaults: Bookmark = {
  id: 'bookmark-1',
  key: 1,
  type: BookmarkType.Ayah,
  verseNumber: 1,
  isInDefaultCollection: false,
  isReading: false,
  collectionsCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const makeBookmark = (overrides: Partial<Bookmark> = {}): Bookmark =>
  merge({ ...defaults }, overrides) as Bookmark;
