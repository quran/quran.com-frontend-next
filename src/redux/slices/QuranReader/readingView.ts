import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReadingView } from 'src/components/QuranReader/types';

const initialState: ReadingView = ReadingView.Translation;

export const readingViewSlice = createSlice({
  name: 'readingView',
  initialState,
  reducers: {
    setReadingView: (state: ReadingView, action: PayloadAction<ReadingView>) => {
      state = action.payload;
    },
  },
});

export const { setReadingView } = readingViewSlice.actions;

export const selectReadingView = (state) => state.readingView;

export default readingViewSlice.reducer;
