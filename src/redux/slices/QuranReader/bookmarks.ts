import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';

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
        // inserting the new pair at beginning of the object will make it sorted by the date verses were bookmarked
        // +new Date() gets the timestamp that we bookmarked the verse at.
        bookmarkedVerses: { [verseKey]: +new Date(), ...state.bookmarkedVerses },
      };
    },
  },
});

export const { toggleVerseBookmark } = bookmarksSlice.actions;

export const selectBookmarks = (state: RootState) => state.bookmarks.bookmarkedVerses;
export const selectOrderedBookmarkedVerses = (state: RootState) =>
  // sort the bookmarked verses by the order they appear in the Mushaf.
  Object.fromEntries(Object.entries(state.bookmarks.bookmarkedVerses).sort());

export default bookmarksSlice.reducer;
