import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReadingPreference } from 'src/components/QuranReader/types';

const initialState: ReadingPreference = ReadingPreference.QuranPage;

export const readingPreferenceSlice = createSlice({
  name: 'readingPreference',
  initialState,
  reducers: {
    setReadingPreference: (draft, action: PayloadAction) => action.payload,
  },
});

export const { setReadingPreference } = readingPreferenceSlice.actions;

export const selectReadingPreference = (state) => state.readingPreference;

export default readingPreferenceSlice.reducer;
