/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import reducer, { setGuestReadingBookmark, clearGuestBookmarks } from './guestBookmark';

import BookmarkType from '@/types/BookmarkType';

describe('guestBookmark slice', () => {
  it('sets a valid ayah reading bookmark', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 1,
        type: BookmarkType.Ayah,
        verseNumber: 5,
        mushafId: 1,
      }),
    ) as any;
    expect(state.readingBookmark).toEqual({
      key: 1,
      type: BookmarkType.Ayah,
      verseNumber: 5,
      mushafId: 1,
    });
  });

  it('sets a valid page reading bookmark', () => {
    const state = reducer(
      undefined,
      setGuestReadingBookmark({
        key: 42,
        type: BookmarkType.Page,
        mushafId: 1,
      }),
    ) as any;
    expect(state.readingBookmark).toEqual({
      key: 42,
      type: BookmarkType.Page,
      mushafId: 1,
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
      }),
    ) as any;
    const cleared = reducer(initial, clearGuestBookmarks()) as any;
    expect(cleared.readingBookmark).toBeNull();
  });

  it('throws on invalid format - missing key', () => {
    expect(() =>
      reducer(
        undefined,
        setGuestReadingBookmark({ key: 0, type: BookmarkType.Ayah, mushafId: 1 } as any),
      ),
    ).toThrow();
  });

  it('throws on invalid format - invalid type', () => {
    expect(() =>
      reducer(undefined, setGuestReadingBookmark({ key: 1, type: 'invalid' as any, mushafId: 1 })),
    ).toThrow();
  });

  it('throws on ayah bookmark without verseNumber', () => {
    expect(() =>
      reducer(undefined, setGuestReadingBookmark({ key: 1, type: BookmarkType.Ayah, mushafId: 1 })),
    ).toThrow();
  });
});
