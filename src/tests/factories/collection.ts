import merge from 'lodash/merge';

import type { Collection } from '@/types/Collection';

const defaults: Collection = {
  id: 'collection-1',
  updatedAt: '2024-01-01T00:00:00.000Z',
  name: 'My Favourites',
  url: '/collections/collection-1',
  count: 0,
  bookmarksCount: 0,
  isDefault: false,
};

export const makeCollection = (overrides: Partial<Collection> = {}): Collection =>
  merge({ ...defaults }, overrides) as Collection;
