import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ReadingView from 'src/components/QuranReader/types';

const initialState: ReadingView = ReadingView.Translation;

export const readingModeSlice = createSlice({
  name: 'readingMode',
  initialState,
  reducers: {
    setReadingMode: (state: ReadingView, action: PayloadAction<ReadingView>) => {
      state = action.payload;
    },
  },
});

export const { setReadingMode } = readingModeSlice.actions;

export const selectReadingMode = (state) => state.readingMode;

export default readingModeSlice.reducer;
