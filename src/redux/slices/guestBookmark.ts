/* eslint-disable no-param-reassign */ // Required for Redux Toolkit's Immer-based state mutations
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isValidReadingBookmarkFormat, ReadingBookmark } from '@/utils/bookmark';

interface GuestBookmarkState {
  readingBookmark: ReadingBookmark;
}

const initialState: GuestBookmarkState = {
  readingBookmark: null,
};

/**
 * Redux slice for managing guest user bookmarks
 * Stores reading bookmark for guest users before sign-in
 * Persisted to localStorage via redux-persist
 */
const guestBookmarkSlice = createSlice({
  name: 'guestBookmark',
  initialState,
  reducers: {
    /**
     * Set the reading bookmark for guest user.
     * Validation of the bookmark format should happen at the call site.
     *
     * Expected formats:
     * - Verse bookmark: "ayah:chapterId:verseNumber" (e.g. "ayah:1:5")
     * - Page bookmark: "page:pageNumber" (e.g. "page:42")
     *
     * @param {GuestBookmarkState} state Current state
     * @param {PayloadAction<ReadingBookmark>} action Payload contains bookmark value in the above formats or null to clear
     */
    setGuestReadingBookmark: (state, action: PayloadAction<ReadingBookmark>) => {
      if (!isValidReadingBookmarkFormat(action.payload)) {
        // Invalid format - do not update state
        return;
      }
      state.readingBookmark = action.payload;
    },

    /**
     * Clear guest bookmarks when user acknowledges cancellation
     * @param {GuestBookmarkState} state Current state
     */
    clearGuestBookmarks: (state) => {
      state.readingBookmark = null;
    },
  },
});

// Selectors
export const selectGuestReadingBookmark = (state: {
  guestBookmark: GuestBookmarkState;
}): ReadingBookmark => state.guestBookmark?.readingBookmark ?? null;

export const { setGuestReadingBookmark, clearGuestBookmarks } = guestBookmarkSlice.actions;

export default guestBookmarkSlice.reducer;
