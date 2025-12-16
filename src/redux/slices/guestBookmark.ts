/* eslint-disable no-param-reassign */ // Required for Redux Toolkit's Immer-based state mutations
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Reading bookmark format: "ayah:chapterId:verseNumber" or "page:pageNumber"
// Examples: "ayah:1:5" (chapter 1, verse 5), "page:42" (page 42)
export type ReadingBookmark = string | null;

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
     *
     * Expected formats:
     * - Verse bookmark: "ayah:chapterId:verseNumber" (e.g. "ayah:1:5")
     * - Page bookmark: "page:pageNumber" (e.g. "page:42")
     * - null to clear bookmark
     *
     * @param {GuestBookmarkState} state Current state
     * @param {PayloadAction<ReadingBookmark>} action Payload contains bookmark value in the above formats or null to clear
     */
    setGuestReadingBookmark: (state, action: PayloadAction<ReadingBookmark>) => {
      const bookmark = action.payload;

      // Validate bookmark format if not null
      if (bookmark !== null) {
        const isValidAyah = /^ayah:\d+:\d+$/.test(bookmark);
        const isValidPage = /^page:\d+$/.test(bookmark);

        if (!isValidAyah && !isValidPage) {
          // eslint-disable-next-line no-console
          console.error(
            `Invalid bookmark format: "${bookmark}". Expected "ayah:chapterId:verseNumber" or "page:pageNumber"`,
          );
          return; // Don't update state with invalid bookmark
        }
      }

      state.readingBookmark = bookmark;
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
