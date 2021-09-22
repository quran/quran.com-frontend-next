import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

interface LastReadVerse {
  verseKey: string;
  chapterId: string;
  page: string;
}

export type ReadingTracker = {
  lastReadVerse: LastReadVerse;
};

const initialState: ReadingTracker = {
  lastReadVerse: { verseKey: null, chapterId: null, page: null },
};

export const readingTrackerSlice = createSlice({
  name: 'readingTracker',
  initialState,
  reducers: {
    setLastReadVerse: (state: ReadingTracker, action: PayloadAction<LastReadVerse>) => {
      return {
        ...state,
        lastReadVerse: action.payload,
      };
    },
  },
});

export const { setLastReadVerse } = readingTrackerSlice.actions;

export const selectLastReadVerseKey = (state: RootState) => state.readingTracker.lastReadVerse;

export default readingTrackerSlice.reducer;
