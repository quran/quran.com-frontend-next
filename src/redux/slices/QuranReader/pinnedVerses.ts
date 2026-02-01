import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import { getVerseNumberFromKey, getChapterNumberFromKey } from '@/utils/verse';

export interface PinnedVerse {
  verseKey: string; // e.g., "1:1", "2:255"
  chapterNumber: number;
  verseNumber: number;
  timestamp: number; // for ordering when added
  serverId?: string; // backend PinnedItem.id (set after sync)
}

export interface PinnedVersesState {
  verses: PinnedVerse[];
}

export const initialState: PinnedVersesState = {
  verses: [],
};

export const pinnedVersesSlice = createSlice({
  name: 'pinnedVerses',
  initialState,
  reducers: {
    pinVerse: (state, action: PayloadAction<string>) => {
      const verseKey = action.payload;

      if (state.verses.some((v) => v.verseKey === verseKey)) {
        return state;
      }

      const newVerse: PinnedVerse = {
        verseKey,
        chapterNumber: getChapterNumberFromKey(verseKey),
        verseNumber: getVerseNumberFromKey(verseKey),
        timestamp: Date.now(),
      };

      return {
        ...state,
        verses: [...state.verses, newVerse],
      };
    },
    pinVerses: (state, action: PayloadAction<string[]>) => {
      const verseKeys = action.payload;
      const existingKeys = new Set(state.verses.map((v) => v.verseKey));
      const timestamp = Date.now();

      const newVerses: PinnedVerse[] = verseKeys
        .filter((key) => !existingKeys.has(key))
        .map((verseKey, index) => ({
          verseKey,
          chapterNumber: getChapterNumberFromKey(verseKey),
          verseNumber: getVerseNumberFromKey(verseKey),
          timestamp: timestamp + index, // Maintain order
        }));

      return {
        ...state,
        verses: [...state.verses, ...newVerses],
      };
    },
    unpinVerse: (state, action: PayloadAction<string>) => {
      const verseKey = action.payload;
      const newVerses = state.verses.filter((v) => v.verseKey !== verseKey);

      return {
        ...state,
        verses: newVerses,
      };
    },
    clearPinnedVerses: () => initialState,
    setServerIds: (state, action: PayloadAction<Record<string, string>>) => {
      const mapping = action.payload;
      return {
        ...state,
        verses: state.verses.map((v) =>
          mapping[v.verseKey] ? { ...v, serverId: mapping[v.verseKey] } : v,
        ),
      };
    },
    setPinnedVerses: (state, action: PayloadAction<PinnedVerse[]>) => ({
      ...state,
      verses: action.payload,
    }),
  },
});

export const {
  pinVerse,
  pinVerses,
  unpinVerse,
  clearPinnedVerses,
  setServerIds,
  setPinnedVerses,
} = pinnedVersesSlice.actions;

export const selectPinnedVerses = (state: RootState) => state.pinnedVerses.verses;

export const selectPinnedVersesCount = (state: RootState) => state.pinnedVerses.verses.length;

export const selectIsVersePinned = (state: RootState, verseKey: string) =>
  state.pinnedVerses.verses.some((v) => v.verseKey === verseKey);

export const selectPinnedVerseKeys = createSelector(selectPinnedVerses, (verses) =>
  verses.map((v) => v.verseKey),
);

export const selectPinnedVerseKeysSet = createSelector(selectPinnedVerseKeys, (keys) =>
  new Set(keys),
);

export default pinnedVersesSlice.reducer;
