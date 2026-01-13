import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from '@/redux/actions/reset-settings';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getReadingPreferencesInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import ReadingPreferences from '@/redux/types/ReadingPreferences';
import SliceName from '@/redux/types/SliceName';
import {
  ReadingPreference,
  WordByWordDisplay,
  WordByWordType,
  WordClickFunctionality,
} from '@/types/QuranReader';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const readingPreferencesSlice = createSlice({
  name: SliceName.READING_PREFERENCES,
  initialState: getReadingPreferencesInitialState(),
  reducers: {
    setReadingPreference: (state, action: PayloadAction<ReadingPreference>) => ({
      ...state,
      readingPreference: action.payload,
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
    setWordClickFunctionality: (state, action: PayloadAction<WordClickFunctionality>) => ({
      ...state,
      wordClickFunctionality: action.payload,
    }),
    setWordByWordContentType: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      wordByWordContentType: action.payload,
    }),
    setWordByWordTooltipContentType: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      wordByWordTooltipContentType: action.payload,
    }),
    setWordByWordInlineContentType: (state, action: PayloadAction<WordByWordType[]>) => ({
      ...state,
      wordByWordInlineContentType: action.payload,
    }),
    setWordByWordDisplay: (state, action: PayloadAction<WordByWordDisplay[]>) => ({
      ...state,
      wordByWordDisplay: action.payload,
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

        // Map backend wordByWordContentType to tooltip content
        // Backend only knows about wordByWordContentType, which we use for tooltip
        const wordByWordTooltipContentType = remotePreferences.wordByWordContentType || [];

        const mappedPreferences = {
          ...remotePreferences,
          wordByWordTooltipContentType,
          // IMPORTANT: Keep local inline content, don't overwrite from backend
          // wordByWordInlineContentType is local-only and persists via redux-persist
        };

        return {
          ...state,
          ...mappedPreferences,
          // Preserve local inline content type from current state
          wordByWordInlineContentType: state.wordByWordInlineContentType || [],
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
  setSelectedWordByWordLocale,
  setWordClickFunctionality,
  setWordByWordContentType,
  setWordByWordTooltipContentType,
  setWordByWordInlineContentType,
  setWordByWordDisplay,
} = readingPreferencesSlice.actions;

/**
 * Check whether we should display inline wbw translation/transliteration.
 *
 * @param {RootState} state
 * @returns {{showWordByWordTranslation: boolean, showWordByWordTransliteration: boolean}}
 */
export const selectInlineDisplayWordByWordPreferences = (
  state: RootState,
): { showWordByWordTranslation: boolean; showWordByWordTransliteration: boolean } => {
  const { readingPreferences } = state;
  const { wordByWordDisplay, wordByWordInlineContentType } = readingPreferences;

  const shouldDisplayInline = wordByWordDisplay.includes(WordByWordDisplay.INLINE);

  return {
    showWordByWordTranslation:
      shouldDisplayInline && wordByWordInlineContentType.includes(WordByWordType.Translation),
    showWordByWordTransliteration:
      shouldDisplayInline && wordByWordInlineContentType.includes(WordByWordType.Transliteration),
  };
};

/**
 * Check whether the tooltip content is enabled or not.
 * To be considered enabled, the following conditions need to be met:
 *
 * 1. display options need to include tooltip.
 * 2. word by word content need to contain either translation or transliteration.
 *
 * @param {RootState} state
 * @returns {boolean}
 */
export const selectIsTooltipContentEnabled = (state: RootState): boolean => {
  const { readingPreferences } = state;
  const { wordByWordTooltipContentType, wordByWordDisplay } = readingPreferences;

  const shouldDisplayTooltip = wordByWordDisplay.includes(WordByWordDisplay.TOOLTIP);

  if (!shouldDisplayTooltip) {
    return false;
  }

  return (
    wordByWordTooltipContentType.includes(WordByWordType.Translation) ||
    wordByWordTooltipContentType.includes(WordByWordType.Transliteration)
  );
};
export const selectReadingPreferences = (state: RootState): ReadingPreferences =>
  state.readingPreferences;

/**
 * Select which tooltip content to show. We should not show any tooltips when:
 *
 * 1. Display options does not include tooltip.
 * 2. Display options does include tooltip but no translation/transliterations were selected.
 *
 * @param {RootState} state
 * @returns {WordByWordType[]}
 */
export const selectTooltipContentType = (state: RootState): WordByWordType[] => {
  const { readingPreferences } = state;
  const { wordByWordDisplay, wordByWordTooltipContentType } = readingPreferences;
  if (
    !wordByWordDisplay ||
    !wordByWordDisplay.includes(WordByWordDisplay.TOOLTIP) ||
    !wordByWordTooltipContentType ||
    !wordByWordTooltipContentType.length
  ) {
    return [];
  }
  return wordByWordTooltipContentType;
};
export const selectReadingPreference = (state: RootState) =>
  state.readingPreferences.readingPreference;
export const selectWordClickFunctionality = (state: RootState) =>
  state.readingPreferences.wordClickFunctionality;
export const selectWordByWordLocale = (state: RootState) =>
  state.readingPreferences.selectedWordByWordLocale;
export const selectIsUsingDefaultWordByWordLocale = (state: RootState) =>
  state.readingPreferences.isUsingDefaultWordByWordLocale;

export default readingPreferencesSlice.reducer;
