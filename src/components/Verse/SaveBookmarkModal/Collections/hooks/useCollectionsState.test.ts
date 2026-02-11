/* eslint-disable react-func/max-lines-per-function */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCollectionsState } from './useCollectionsState';

import { DEFAULT_COLLECTION_ID } from '@/utils/auth/constants';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

const makeCollectionListData = (
  collections: Array<{
    id: string;
    name: string;
    updatedAt?: string;
    isDefault?: boolean;
  }>,
) => ({
  data: collections,
});

const getSortedCollectionIds = ({
  isVerse = true,
  collectionListData,
  bookmarkCollectionIdsData,
  sortingMode,
}: {
  isVerse?: boolean;
  collectionListData?: {
    data?: Array<{ id: string; name: string; updatedAt?: string; isDefault?: boolean }>;
  };
  bookmarkCollectionIdsData?: string[];
  sortingMode?: 'legacy' | 'saveBookmark';
}) => {
  const { result } = renderHook(() =>
    useCollectionsState({
      isVerse,
      collectionListData,
      bookmarkCollectionIdsData,
      sortingMode,
    }),
  );

  return result.current.sortedCollections.map((collection) => collection.id);
};

describe('useCollectionsState', () => {
  it('returns no collections when mode is not verse', () => {
    const ids = getSortedCollectionIds({
      isVerse: false,
      collectionListData: makeCollectionListData([
        { id: 'c1', name: 'Collection 1', updatedAt: '2026-01-01T00:00:00Z' },
      ]),
      bookmarkCollectionIdsData: ['c1'],
      sortingMode: 'saveBookmark',
    });

    expect(ids).toEqual([]);
  });

  it('sorts selected collections first by most recently updated in saveBookmark mode', () => {
    const ids = getSortedCollectionIds({
      collectionListData: makeCollectionListData([
        { id: DEFAULT_COLLECTION_ID, name: 'Favs', updatedAt: '2026-01-01T00:00:00Z' },
        { id: 'c-old', name: 'Old Selected', updatedAt: '2026-01-10T00:00:00Z' },
        { id: 'c-new', name: 'New Selected', updatedAt: '2026-02-10T00:00:00Z' },
        { id: 'c-unselected', name: 'Unselected', updatedAt: '2026-02-01T00:00:00Z' },
      ]),
      bookmarkCollectionIdsData: ['c-old', 'c-new'],
      sortingMode: 'saveBookmark',
    });

    expect(ids).toEqual(['c-new', 'c-old', DEFAULT_COLLECTION_ID, 'c-unselected']);
  });

  it('keeps favorites in selected group when selected and does not duplicate it', () => {
    const ids = getSortedCollectionIds({
      collectionListData: makeCollectionListData([
        { id: DEFAULT_COLLECTION_ID, name: 'Favs', updatedAt: '2026-02-15T00:00:00Z' },
        { id: 'c1', name: 'Collection 1', updatedAt: '2026-02-10T00:00:00Z' },
        { id: 'c2', name: 'Collection 2', updatedAt: '2026-02-09T00:00:00Z' },
      ]),
      bookmarkCollectionIdsData: [DEFAULT_COLLECTION_ID, 'c1'],
      sortingMode: 'saveBookmark',
    });

    expect(ids).toEqual([DEFAULT_COLLECTION_ID, 'c1', 'c2']);
    expect(ids.filter((id) => id === DEFAULT_COLLECTION_ID)).toHaveLength(1);
  });

  it('places unselected favorites before other unselected collections', () => {
    const ids = getSortedCollectionIds({
      collectionListData: makeCollectionListData([
        { id: DEFAULT_COLLECTION_ID, name: 'Favs', updatedAt: '2026-01-01T00:00:00Z' },
        { id: 'c-selected', name: 'Selected', updatedAt: '2026-03-01T00:00:00Z' },
        { id: 'c-unselected-new', name: 'Unselected New', updatedAt: '2026-02-15T00:00:00Z' },
        { id: 'c-unselected-old', name: 'Unselected Old', updatedAt: '2026-02-10T00:00:00Z' },
      ]),
      bookmarkCollectionIdsData: ['c-selected'],
      sortingMode: 'saveBookmark',
    });

    expect(ids).toEqual([
      'c-selected',
      DEFAULT_COLLECTION_ID,
      'c-unselected-new',
      'c-unselected-old',
    ]);
  });

  it('uses alphabetical tie-breaker for equal or missing updatedAt in saveBookmark mode', () => {
    const ids = getSortedCollectionIds({
      collectionListData: makeCollectionListData([
        { id: DEFAULT_COLLECTION_ID, name: 'Favs' },
        { id: 'c-beta', name: 'Beta', updatedAt: undefined },
        { id: 'c-alpha', name: 'Alpha', updatedAt: undefined },
        { id: 'c-gamma', name: 'Gamma', updatedAt: 'invalid-date' },
      ]),
      bookmarkCollectionIdsData: [],
      sortingMode: 'saveBookmark',
    });

    expect(ids).toEqual([DEFAULT_COLLECTION_ID, 'c-alpha', 'c-beta', 'c-gamma']);
  });

  it('adds manual favorites item when default collection is missing from API data', () => {
    const ids = getSortedCollectionIds({
      collectionListData: makeCollectionListData([
        { id: 'c2', name: 'Collection 2', updatedAt: '2026-02-12T00:00:00Z' },
      ]),
      bookmarkCollectionIdsData: [],
      sortingMode: 'saveBookmark',
    });

    expect(ids[0]).toBe(DEFAULT_COLLECTION_ID);
    expect(ids).toEqual([DEFAULT_COLLECTION_ID, 'c2']);
  });

  it('keeps legacy order when sortingMode is omitted', () => {
    const ids = getSortedCollectionIds({
      collectionListData: makeCollectionListData([
        { id: 'c1', name: 'Collection 1', updatedAt: '2026-02-15T00:00:00Z' },
        { id: 'c2', name: 'Collection 2', updatedAt: '2026-02-14T00:00:00Z' },
      ]),
      bookmarkCollectionIdsData: ['c2'],
    });

    expect(ids).toEqual([DEFAULT_COLLECTION_ID, 'c1', 'c2']);
  });
});
