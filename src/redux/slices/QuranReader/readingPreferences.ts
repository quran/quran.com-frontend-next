import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from 'src/redux/actions/reset-settings';
import syncUserPreferences from 'src/redux/actions/sync-user-preferences';
import { getReadingPreferencesInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import ReadingPreferences from 'src/redux/types/ReadingPreferences';
import SliceName from 'src/redux/types/SliceName';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { ReadingPreference, WordByWordType, WordClickFunctionality } from 'types/QuranReader';

export const readingPreferencesSlice = createSlice({
  name: SliceName.READING_PREFERENCES,
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
    setSelectedWordByWordLocale: (
      state,
      action: PayloadAction<{ value: string; locale: string }>,
    ) => ({
      ...state,
      selectedWordByWordLocale: action.payload.value,
      isUsingDefaultWordByWordLocale:
        action.payload.value ===
        getReadingPreferencesInitialState(action.payload.locale).selectedWordByWordLocale,
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
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences, locale },
      } = action;
      const remotePreferences = userPreferences[PreferenceGroup.READING] as ReadingPreferences;
      if (remotePreferences) {
        const { selectedWordByWordLocale: defaultWordByWordLocale } =
          getReadingPreferencesInitialState(locale);
        return {
          ...state,
          ...remotePreferences,
          isUsingDefaultWordByWordLocale:
            remotePreferences.selectedWordByWordLocale === defaultWordByWordLocale,
        };
      }
      return state;
    });
  },
});

export const {
  setReadingPreference,
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setSelectedWordByWordTranslation,
  setSelectedWordByWordTransliteration,
  setSelectedWordByWordLocale,
  setShowTooltipFor,
  setWordClickFunctionality,
} = readingPreferencesSlice.actions;

export const selectWordByWordPreferences = (state: RootState) => ({
  showWordByWordTranslation: state.readingPreferences.showWordByWordTranslation,
  selectedWordByWordTranslation: state.readingPreferences.selectedWordByWordTranslation,
  showWordByWordTransliteration: state.readingPreferences.showWordByWordTransliteration,
  selectedWordByWordTransliteration: state.readingPreferences.selectedWordByWordTransliteration,
  selectedWordByWordLocale: state.readingPreferences.selectedWordByWordLocale,
});
export const selectReadingPreferences = (state: RootState): ReadingPreferences =>
  state.readingPreferences;
export const selectShowTooltipFor = (state: RootState) => state.readingPreferences.showTooltipFor;
export const selectReadingPreference = (state: RootState) =>
  state.readingPreferences.readingPreference;
export const selectWordClickFunctionality = (state: RootState) =>
  state.readingPreferences.wordClickFunctionality;
export const selectWordByWordLocale = (state: RootState) =>
  state.readingPreferences.selectedWordByWordLocale;
export const selectIsUsingDefaultWordByWordLocale = (state: RootState) =>
  state.readingPreferences.isUsingDefaultWordByWordLocale;

export default readingPreferencesSlice.reducer;
