/* eslint-disable no-param-reassign */ // Required for Redux Toolkit's Immer-based state mutations
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GuestBookmarkState {
  readingBookmark: string | null;
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
     * Set the reading bookmark for guest user
     * @param {GuestBookmarkState} state Current state
     * @param {PayloadAction<string | null>} action Payload contains bookmark value (format: "ayah:chapterId:verseNumber" or "page:pageNumber")
     */
    setGuestReadingBookmark: (state, action: PayloadAction<string | null>) => {
      // Validation happens at call site before dispatch
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
}): string | null => state.guestBookmark?.readingBookmark ?? null;

export const { setGuestReadingBookmark, clearGuestBookmarks } = guestBookmarkSlice.actions;

export default guestBookmarkSlice.reducer;
