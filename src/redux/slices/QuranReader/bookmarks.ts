import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

export type Bookmarks = {
  bookmarkedVerses: Record<string, number>;
};

const initialState: Bookmarks = {
  bookmarkedVerses: {},
};

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    toggleVerseBookmark: (state, action: PayloadAction<string>) => {
      const verseKey = action.payload;
      // if the verseKey exists, we should remove it.
      if (state.bookmarkedVerses[verseKey]) {
        const newBookmarkedVerses = { ...state.bookmarkedVerses };
        delete newBookmarkedVerses[verseKey];
        return {
          ...state,
          bookmarkedVerses: newBookmarkedVerses,
        };
      }
      return {
        ...state,
        bookmarkedVerses: { [verseKey]: +new Date(), ...state.bookmarkedVerses },
      };
    },
  },
});

export const { toggleVerseBookmark } = bookmarksSlice.actions;

export const selectBookmarks = (state) => state.bookmarks;
export const selectOrderedBookmarkedVerses = (state) =>
  _(state.bookmarks.bookmarkedVerses).toPairs().sortBy(0).fromPairs().value();

export default bookmarksSlice.reducer;
