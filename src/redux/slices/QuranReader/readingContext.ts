import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type ReadingContext = {
  currentlyReadingVerseKey: string;
};

const initialState: ReadingContext = { currentlyReadingVerseKey: null };

export const readingContextSlice = createSlice({
  name: 'readingContext',
  initialState,
  reducers: {
    updateVerseVisibility: (state: ReadingContext, action: PayloadAction<string>) => {
      return {
        ...state,
        currentlyReadingVerseKey: action.payload,
      };
    },
  },
});

export const { updateVerseVisibility } = readingContextSlice.actions;

export const selectCurrentlyReadingVerseKey = (state: RootState) =>
  state.readingContext.currentlyReadingVerseKey;

export default readingContextSlice.reducer;
