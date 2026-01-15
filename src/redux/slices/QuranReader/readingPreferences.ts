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

const getWordByWordFieldsFromRemote = (p: ReadingPreferences) => {
  if (p.wordByWordTooltipContentType !== undefined || p.wordByWordInlineContentType !== undefined) {
    const tooltip = p.wordByWordTooltipContentType || [];
    const inline = p.wordByWordInlineContentType || [];
    const display: WordByWordDisplay[] = [];
    if (tooltip.length > 0) display.push(WordByWordDisplay.TOOLTIP);
    if (inline.length > 0) display.push(WordByWordDisplay.INLINE);
    return { tooltip, inline, display };
  }
  const oldContent = p.wordByWordContentType || [];
  const oldDisplay = p.wordByWordDisplay || [];
  return {
    tooltip: oldDisplay.includes(WordByWordDisplay.TOOLTIP) ? oldContent : [],
    inline: oldDisplay.includes(WordByWordDisplay.INLINE) ? oldContent : [],
    display: oldDisplay,
  };
};

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
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (unusedState, action) =>
      getReadingPreferencesInitialState(action.payload.locale),
    );
    builder.addCase(syncUserPreferences, (state, action) => {
      const { userPreferences, locale } = action.payload;
      const remotePreferences = userPreferences[PreferenceGroup.READING] as ReadingPreferences;
      if (!remotePreferences) return state;

      const { tooltip, inline, display } = getWordByWordFieldsFromRemote(remotePreferences);
      const defaultLocale = getReadingPreferencesInitialState(locale).selectedWordByWordLocale;
      return {
        ...state,
        readingPreference: remotePreferences.readingPreference ?? state.readingPreference,
        selectedWordByWordLocale:
          remotePreferences.selectedWordByWordLocale ?? state.selectedWordByWordLocale,
        wordClickFunctionality:
          remotePreferences.wordClickFunctionality ?? state.wordClickFunctionality,
        wordByWordTooltipContentType: tooltip,
        wordByWordInlineContentType: inline,
        wordByWordDisplay: display,
        wordByWordContentType: tooltip,
        isUsingDefaultWordByWordLocale:
          remotePreferences.selectedWordByWordLocale === defaultLocale,
      };
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

export const selectInlineDisplayWordByWordPreferences = (state: RootState) => {
  const { wordByWordDisplay, wordByWordInlineContentType } = state.readingPreferences;
  const shouldDisplayInline = wordByWordDisplay.includes(WordByWordDisplay.INLINE);
  return {
    showWordByWordTranslation:
      shouldDisplayInline && wordByWordInlineContentType.includes(WordByWordType.Translation),
    showWordByWordTransliteration:
      shouldDisplayInline && wordByWordInlineContentType.includes(WordByWordType.Transliteration),
  };
};

export const selectIsTooltipContentEnabled = (state: RootState): boolean => {
  const { wordByWordTooltipContentType, wordByWordDisplay } = state.readingPreferences;
  if (!wordByWordDisplay.includes(WordByWordDisplay.TOOLTIP)) return false;
  return (
    wordByWordTooltipContentType.includes(WordByWordType.Translation) ||
    wordByWordTooltipContentType.includes(WordByWordType.Transliteration)
  );
};

export const selectReadingPreferences = (state: RootState) => state.readingPreferences;

export const selectTooltipContentType = (state: RootState): WordByWordType[] => {
  const { wordByWordDisplay, wordByWordTooltipContentType } = state.readingPreferences;
  const noTooltip = !wordByWordDisplay?.includes(WordByWordDisplay.TOOLTIP);
  return noTooltip || !wordByWordTooltipContentType?.length ? [] : wordByWordTooltipContentType;
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
