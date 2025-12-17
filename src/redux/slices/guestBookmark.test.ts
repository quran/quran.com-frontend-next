import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';

import guestBookmarkReducer, {
  clearGuestBookmarks,
  selectGuestReadingBookmark,
  setGuestReadingBookmark,
} from './guestBookmark';

const makeStore = () =>
  configureStore({
    reducer: { guestBookmark: guestBookmarkReducer },
  });

describe('guestBookmark slice (init and validation)', () => {
  it('initializes with null readingBookmark', () => {
    const store = makeStore();
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBeNull();
  });

  it('ignores invalid bookmark formats', () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('invalid'));
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBeNull();
  });
});

describe('guestBookmark slice (set and clear)', () => {
  it('sets valid ayah bookmark', () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('ayah:1:5'));
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBe('ayah:1:5');
  });

  it('sets valid page bookmark', () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('page:42'));
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBe('page:42');
  });

  it('clears bookmarks', () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('ayah:1:5'));
    store.dispatch(clearGuestBookmarks());
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBeNull();
  });
});

describe('guestBookmark slice (replacement behavior)', () => {
  it('replaces existing bookmark with new valid value', () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('ayah:1:5'));
    store.dispatch(setGuestReadingBookmark('page:7'));
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBe('page:7');
  });

  it('ignores invalid replacement', () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('ayah:1:5'));
    store.dispatch(setGuestReadingBookmark('invalid'));
    const state = store.getState();
    expect(selectGuestReadingBookmark(state as any)).toBe('ayah:1:5');
  });
});
