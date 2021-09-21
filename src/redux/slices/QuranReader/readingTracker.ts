import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type ReadingTracker = {
  lastReadVerseKey: string;
};

const initialState: ReadingTracker = { lastReadVerseKey: null };

export const readingTrackerSlice = createSlice({
  name: 'readingTracker',
  initialState,
  reducers: {
    setLastReadVerse: (state: ReadingTracker, action: PayloadAction<string>) => {
      return {
        ...state,
        lastReadVerseKey: action.payload,
      };
    },
  },
});

export const { setLastReadVerse } = readingTrackerSlice.actions;

export const selectLastReadVerseKey = (state: RootState) => state.readingTracker.lastReadVerseKey;

export default readingTrackerSlice.reducer;
