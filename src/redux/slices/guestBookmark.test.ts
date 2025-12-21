import { describe, it, expect } from 'vitest';

import reducer, { setGuestReadingBookmark, clearGuestBookmarks } from './guestBookmark';

describe('guestBookmark slice', () => {
  it('sets a valid ayah reading bookmark', () => {
    const state = reducer(undefined, setGuestReadingBookmark('ayah:1:5')) as any;
    expect(state.readingBookmark).toBe('ayah:1:5');
  });

  it('sets a valid page reading bookmark', () => {
    const state = reducer(undefined, setGuestReadingBookmark('page:42')) as any;
    expect(state.readingBookmark).toBe('page:42');
  });

  it('clears reading bookmarks', () => {
    const initial = reducer(undefined, setGuestReadingBookmark('ayah:2:1')) as any;
    const cleared = reducer(initial, clearGuestBookmarks()) as any;
    expect(cleared.readingBookmark).toBeNull();
  });

  it('throws on invalid format', () => {
    expect(() => reducer(undefined, setGuestReadingBookmark('invalid'))).toThrow();
  });
});
