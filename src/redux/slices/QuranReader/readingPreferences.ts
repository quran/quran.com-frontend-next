import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getReadingPreferencesInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import { ReadingPreference, WordByWordType, WordClickFunctionality } from 'types/QuranReader';

export const readingPreferencesSlice = createSlice({
  name: 'readingPreferences',
  initialState: getReadingPreferencesInitialState(),
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
    setShowTooltipFor: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      showTooltipFor: action.payload,
    }),
    setWordClickFunctionality: (state, action: PayloadAction<WordClickFunctionality>) => ({
      ...state,
      wordClickFunctionality: action.payload,
    }),
  },
  // reset the state to initial state
  // when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => {
      return getReadingPreferencesInitialState(action.payload.locale);
    });
  },
});

export const {
  setReadingPreference,
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setSelectedWordByWordTranslation,
  setSelectedWordByWordTransliteration,
  setShowTooltipFor,
  setWordClickFunctionality,
} = readingPreferencesSlice.actions;

export const selectWordByWordByWordPreferences = (state: RootState) => ({
  showWordByWordTranslation: state.readingPreferences.showWordByWordTranslation,
  selectedWordByWordTranslation: state.readingPreferences.selectedWordByWordTranslation,
  showWordByWordTransliteration: state.readingPreferences.showWordByWordTransliteration,
  selectedWordByWordTransliteration: state.readingPreferences.selectedWordByWordTransliteration,
});
export const selectShowTooltipFor = (state: RootState) => state.readingPreferences.showTooltipFor;
export const selectReadingPreference = (state: RootState) =>
  state.readingPreferences.readingPreference;
export const selectWordClickFunctionality = (state: RootState) =>
  state.readingPreferences.wordClickFunctionality;

export default readingPreferencesSlice.reducer;
