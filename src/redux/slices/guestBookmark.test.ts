/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import reducer, { setGuestReadingBookmark, clearGuestBookmarks } from './guestBookmark';

import BookmarkType from '@/types/BookmarkType';

describe('guestBookmark slice', () => {
  const mockCreatedAt = '2026-01-26T12:00:00.000Z';

  it('sets a valid ayah reading bookmark', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 1,
        type: BookmarkType.Ayah,
        verseNumber: 5,
        mushafId: 1,
        createdAt: mockCreatedAt,
      }),
    ) as any;
    expect(state.readingBookmark).toEqual({
      key: 1,
      type: BookmarkType.Ayah,
      verseNumber: 5,
      mushafId: 1,
      createdAt: mockCreatedAt,
    });
  });

  it('sets a valid page reading bookmark', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 42,
        type: BookmarkType.Page,
        mushafId: 1,
        createdAt: mockCreatedAt,
      }),
    ) as any;
    expect(state.readingBookmark).toEqual({
      key: 42,
      type: BookmarkType.Page,
      mushafId: 1,
      createdAt: mockCreatedAt,
    });
  });

  it('clears reading bookmarks', () => {
    const initial = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 2,
        type: BookmarkType.Ayah,
        verseNumber: 1,
        mushafId: 1,
        createdAt: mockCreatedAt,
      }),
    ) as any;
    const cleared = reducer(initial, clearGuestBookmarks()) as any;
    expect(cleared.readingBookmark).toBeNull();
  });

  it('sanitizes invalid format - missing key', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 0,
        type: BookmarkType.Ayah,
        mushafId: 1,
        createdAt: mockCreatedAt,
      } as any),
    ) as any;
    expect(state.readingBookmark).toBeNull();
  });

  it('sanitizes invalid format - invalid type', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 1,
        type: 'invalid' as any,
        mushafId: 1,
        createdAt: mockCreatedAt,
      }),
    ) as any;
    expect(state.readingBookmark).toBeNull();
  });

  it('sanitizes ayah bookmark without verseNumber', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 1,
        type: BookmarkType.Ayah,
        mushafId: 1,
        createdAt: mockCreatedAt,
      }),
    ) as any;
    expect(state.readingBookmark).toBeNull();
  });
});
