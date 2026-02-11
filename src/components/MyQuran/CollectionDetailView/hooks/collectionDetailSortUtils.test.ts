/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import {
  normalizeCollectionDetailSort,
  sortCollectionBookmarks,
} from './collectionDetailSortUtils';

import BookmarkType from '@/types/BookmarkType';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const b = (params: { id: string; key: number; verseNumber: number; createdAt?: string }) => ({
  id: params.id,
  key: params.key,
  verseNumber: params.verseNumber,
  type: BookmarkType.Ayah,
  ...(params.createdAt ? { createdAt: params.createdAt } : {}),
});

describe('collectionDetailSortUtils', () => {
  it('normalizes legacy sort ids', () => {
    expect(normalizeCollectionDetailSort(CollectionDetailSortOption.RecentlyAdded)).toBe(
      CollectionDetailSortOption.DateDesc,
    );
    expect(normalizeCollectionDetailSort(CollectionDetailSortOption.VerseKey)).toBe(
      CollectionDetailSortOption.QuranicOrderAsc,
    );
  });

  it('sorts DateAsc from oldest to newest (unknown dates last)', () => {
    const bookmarks = [
      b({ id: 'b1', key: 1, verseNumber: 1, createdAt: '2024-01-02T00:00:00.000Z' }),
      b({ id: 'b2', key: 1, verseNumber: 2, createdAt: '2024-01-01T00:00:00.000Z' }),
      b({ id: 'b3', key: 114, verseNumber: 6 }), // missing createdAt
    ] as any[];

    expect(
      sortCollectionBookmarks(bookmarks, CollectionDetailSortOption.DateAsc).map((x) => x.id),
    ).toEqual(['b2', 'b1', 'b3']);
  });

  it('sorts DateDesc from newest to oldest (unknown dates last)', () => {
    const bookmarks = [
      b({ id: 'b1', key: 1, verseNumber: 1, createdAt: '2024-01-01T00:00:00.000Z' }),
      b({ id: 'b2', key: 1, verseNumber: 2, createdAt: '2024-01-02T00:00:00.000Z' }),
      b({ id: 'b3', key: 114, verseNumber: 6 }), // missing createdAt
    ] as any[];

    expect(
      sortCollectionBookmarks(bookmarks, CollectionDetailSortOption.DateDesc).map((x) => x.id),
    ).toEqual(['b2', 'b1', 'b3']);
  });

  it('sorts QuranicOrderAsc from 1:1 to 114:last', () => {
    const bookmarks = [
      b({ id: 'b1', key: 2, verseNumber: 10, createdAt: '2024-01-01T00:00:00.000Z' }),
      b({ id: 'b2', key: 1, verseNumber: 1, createdAt: '2024-01-02T00:00:00.000Z' }),
      b({ id: 'b3', key: 114, verseNumber: 6, createdAt: '2023-12-31T00:00:00.000Z' }),
    ] as any[];

    expect(
      sortCollectionBookmarks(bookmarks, CollectionDetailSortOption.QuranicOrderAsc).map(
        (x) => x.id,
      ),
    ).toEqual(['b2', 'b1', 'b3']);
  });

  it('sorts QuranicOrderDesc from 114:last to 1:1', () => {
    const bookmarks = [
      b({ id: 'b1', key: 2, verseNumber: 10, createdAt: '2024-01-01T00:00:00.000Z' }),
      b({ id: 'b2', key: 1, verseNumber: 1, createdAt: '2024-01-02T00:00:00.000Z' }),
      b({ id: 'b3', key: 114, verseNumber: 6, createdAt: '2023-12-31T00:00:00.000Z' }),
    ] as any[];

    expect(
      sortCollectionBookmarks(bookmarks, CollectionDetailSortOption.QuranicOrderDesc).map(
        (x) => x.id,
      ),
    ).toEqual(['b3', 'b1', 'b2']);
  });
});
