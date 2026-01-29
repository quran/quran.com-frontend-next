/* eslint-disable no-param-reassign */ // Required for Redux Toolkit's Immer-based state mutations
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { logErrorToSentry } from '../../lib/sentry';

import BookmarkType from '@/types/BookmarkType';
import { GuestReadingBookmark } from '@/utils/bookmark';

interface GuestBookmarkState {
  /** Guest reading bookmark with structured data */
  readingBookmark: GuestReadingBookmark | null;
}

const initialState: GuestBookmarkState = {
  readingBookmark: null,
};

/**
 * Validates the guest reading bookmark data
 * @param {GuestReadingBookmark | null} bookmark Bookmark data to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidGuestBookmark = (bookmark: GuestReadingBookmark | null): boolean => {
  if (!bookmark) return true;

  // Validate required fields
  if (typeof bookmark.key !== 'number' || bookmark.key < 1) return false;
  if (!bookmark.type || ![BookmarkType.Ayah, BookmarkType.Page].includes(bookmark.type)) {
    return false;
  }
  if (typeof bookmark.mushafId !== 'number' || bookmark.mushafId < 1) return false;

  // Ayah bookmarks require verseNumber
  if (bookmark.type === BookmarkType.Ayah) {
    if (typeof bookmark.verseNumber !== 'number' || bookmark.verseNumber < 1) return false;
  }

  return true;
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
     * Uses structured format: {key, type, verseNumber?, mushafId}
     *
     * @param {GuestBookmarkState} state Current state
     * @param {PayloadAction<GuestReadingBookmark | null>} action Bookmark data or null to clear
     */
    setGuestReadingBookmark: (state, action: PayloadAction<GuestReadingBookmark | null>) => {
      if (!isValidGuestBookmark(action.payload)) {
        logErrorToSentry('Invalid guest reading bookmark format', {
          transactionName: 'setGuestReadingBookmark',
          metadata: { state, action },
        });
        state.readingBookmark = null;
      } else {
        state.readingBookmark = action.payload;
      }
    },

    /**
     * Clear guest bookmarks
     * @param {GuestBookmarkState} state Current state
     */
    clearGuestBookmarks: (state) => {
      state.readingBookmark = null;
    },
  },
});

// Selectors

/**
 * Get guest reading bookmark data
 * @param {{ guestBookmark: GuestBookmarkState }} state Redux state
 *
 * @returns {GuestReadingBookmark | null} Guest reading bookmark or null
 */
export const selectGuestReadingBookmark = (state: {
  guestBookmark: GuestBookmarkState;
}): GuestReadingBookmark | null => state.guestBookmark?.readingBookmark ?? null;

export const { setGuestReadingBookmark, clearGuestBookmarks } = guestBookmarkSlice.actions;

export default guestBookmarkSlice.reducer;
