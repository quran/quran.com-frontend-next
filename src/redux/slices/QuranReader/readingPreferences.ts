import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReadingPreference } from 'src/components/QuranReader/types';
import reset from '../reset';

const DEFAULT_TRANSLATION = 20; // just a placeholder.
const DEFAULT_TRANSLITERATION = 12; // just a placeholder.

export type ReadingPreferences = {
  readingPreference: ReadingPreference;
  showWordByWordTranslation: boolean;
  selectedWordByWordTranslation: number;
  showWordByWordTransliteration: boolean;
  selectedWordByWordTransliteration: number;
};

const initialState: ReadingPreferences = {
  readingPreference: ReadingPreference.Translation,
  showWordByWordTranslation: false,
  selectedWordByWordTranslation: DEFAULT_TRANSLATION,
  showWordByWordTransliteration: false,
  selectedWordByWordTransliteration: DEFAULT_TRANSLITERATION,
};

export const readingPreferencesSlice = createSlice({
  name: 'readingPreferences',
  initialState,
  reducers: {
    setReadingPreference: (state, action: PayloadAction<ReadingPreference>) => ({
      ...state,
      readingPreference: action.payload,
    }),
    setShowWordByWordTranslation: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showWordByWordTranslation: action.payload,
    }),
    setShowWordByWordTransliteration: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showWordByWordTransliteration: action.payload,
    }),
    setSelectedWordByWordTranslation: (state, action: PayloadAction<number>) => ({
      ...state,
      selectedWordByWordTranslation: action.payload,
    }),
    setSelectedWordByWordTransliteration: (state, action: PayloadAction<number>) => ({
      ...state,
      selectedWordByWordTransliteration: action.payload,
    }),
  },
  // reset the state to initial state
  // when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(reset, () => initialState);
  },
});

export const {
  setReadingPreference,
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setSelectedWordByWordTranslation,
  setSelectedWordByWordTransliteration,
} = readingPreferencesSlice.actions;

export const selectReadingPreferences = (state) => state.readingPreferences as ReadingPreferences;
export const selectReadingPreference = (state) => state.readingPreferences.readingPreference;

export default readingPreferencesSlice.reducer;
