import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReadingMode = 'translation' | 'mushaf';

const initialState: ReadingMode = 'translation';

export const readingModeSlice = createSlice({
  name: 'readingMode',
  initialState,
  reducers: {
    setReadingMode: (state: ReadingMode, action: PayloadAction<ReadingMode>) => {
      state = action.payload;
    },
  },
});

export const { setReadingMode } = readingModeSlice.actions;

export const selectReadingMode = (state) => state.readingMode;

export default readingModeSlice.reducer;
