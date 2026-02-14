/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it, vi } from 'vitest';

import { filterCollectionBookmarks } from './collectionDetailFilterUtils';

import BookmarkType from '@/types/BookmarkType';

describe('collectionDetailFilterUtils', () => {
  it('filters bookmarks by searchQuery', () => {
    const getJuzNumberByVerse = vi.fn();
    const bookmarks = [
      { id: 'b1', key: 1, verseNumber: 1, type: BookmarkType.Ayah },
      { id: 'b2', key: 2, verseNumber: 10, type: BookmarkType.Ayah },
    ] as any[];

    expect(
      filterCollectionBookmarks({ bookmarks, searchQuery: '2:10', getJuzNumberByVerse }).map(
        (b) => b.id,
      ),
    ).toEqual(['b2']);
    expect(
      filterCollectionBookmarks({ bookmarks, searchQuery: '1:1', getJuzNumberByVerse }).map(
        (b) => b.id,
      ),
    ).toEqual(['b1']);
  });

  it('filters bookmarks by selectedChapterIds', () => {
    const getJuzNumberByVerse = vi.fn();
    const bookmarks = [
      { id: 'b1', key: 1, verseNumber: 1, type: BookmarkType.Ayah },
      { id: 'b2', key: 2, verseNumber: 10, type: BookmarkType.Ayah },
    ] as any[];

    expect(
      filterCollectionBookmarks({
        bookmarks,
        selectedChapterIds: ['2'],
        getJuzNumberByVerse,
      }).map((b) => b.id),
    ).toEqual(['b2']);
  });

  it('filters bookmarks by selectedJuzNumbers', () => {
    const getJuzNumberByVerse = vi.fn((chapter: number) => (chapter === 1 ? 1 : 2));
    const bookmarks = [
      { id: 'b1', key: 1, verseNumber: 1, type: BookmarkType.Ayah },
      { id: 'b2', key: 2, verseNumber: 10, type: BookmarkType.Ayah },
    ] as any[];

    expect(
      filterCollectionBookmarks({
        bookmarks,
        selectedJuzNumbers: ['1'],
        getJuzNumberByVerse,
      }).map((b) => b.id),
    ).toEqual(['b1']);
  });

  it('ORs chapter and juz filters when both are active', () => {
    const getJuzNumberByVerse = vi.fn((chapter: number) => (chapter === 1 ? 1 : 2));
    const bookmarks = [
      { id: 'b1', key: 1, verseNumber: 1, type: BookmarkType.Ayah },
      { id: 'b2', key: 2, verseNumber: 10, type: BookmarkType.Ayah },
    ] as any[];

    expect(
      filterCollectionBookmarks({
        bookmarks,
        selectedChapterIds: ['2'], // matches b2
        selectedJuzNumbers: ['1'], // matches b1
        getJuzNumberByVerse,
      })
        .map((b) => b.id)
        .sort(),
    ).toEqual(['b1', 'b2']);
  });
});
