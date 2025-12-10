import { describe, it, expect } from 'vitest';

import bookmarksReducer, {
  toggleVerseBookmark,
  togglePageBookmark,
  clearBookmarks,
  Bookmarks,
} from './bookmarks';

// eslint-disable-next-line react-func/max-lines-per-function
describe('bookmarks slice', () => {
  const initialState: Bookmarks = {
    bookmarkedVerses: {},
    bookmarkedPages: {},
  };

  describe('clearBookmarks', () => {
    it('should reset bookmarks to initial state when bookmarks exist', () => {
      const stateWithBookmarks: Bookmarks = {
        bookmarkedVerses: { '1:1': 1234567890, '2:255': 1234567891 },
        bookmarkedPages: { '1': 1234567890, '50': 1234567891 },
      };

      const result = bookmarksReducer(stateWithBookmarks, clearBookmarks());

      expect(result).toEqual(initialState);
      expect(result.bookmarkedVerses).toEqual({});
      expect(result.bookmarkedPages).toEqual({});
    });

    it('should return initial state when already empty', () => {
      const result = bookmarksReducer(initialState, clearBookmarks());

      expect(result).toEqual(initialState);
    });
  });

  describe('toggleVerseBookmark', () => {
    it('should add a verse bookmark when it does not exist', () => {
      const result = bookmarksReducer(initialState, toggleVerseBookmark('1:1'));

      expect(result.bookmarkedVerses['1:1']).toBeDefined();
      expect(typeof result.bookmarkedVerses['1:1']).toBe('number');
    });

    it('should remove a verse bookmark when it exists', () => {
      const stateWithBookmark: Bookmarks = {
        bookmarkedVerses: { '1:1': 1234567890 },
        bookmarkedPages: {},
      };

      const result = bookmarksReducer(stateWithBookmark, toggleVerseBookmark('1:1'));

      expect(result.bookmarkedVerses['1:1']).toBeUndefined();
    });
  });

  describe('togglePageBookmark', () => {
    it('should add a page bookmark when it does not exist', () => {
      const result = bookmarksReducer(initialState, togglePageBookmark('1'));

      expect(result.bookmarkedPages['1']).toBeDefined();
      expect(typeof result.bookmarkedPages['1']).toBe('number');
    });

    it('should remove a page bookmark when it exists', () => {
      const stateWithBookmark: Bookmarks = {
        bookmarkedVerses: {},
        bookmarkedPages: { '1': 1234567890 },
      };

      const result = bookmarksReducer(stateWithBookmark, togglePageBookmark('1'));

      expect(result.bookmarkedPages['1']).toBeUndefined();
    });
  });
});
