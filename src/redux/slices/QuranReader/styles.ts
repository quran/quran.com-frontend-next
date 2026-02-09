/* eslint-disable max-lines */
/**
 * NOTE:
 * This file intentionally disables the `max-lines` ESLint rule to keep all
 * QuranReader styles logic (state, reducers, configuration, and side-effects)
 * colocated in one place. This improves maintainability, discoverability, and
 * navigation for a domain that is cohesive and low in functional complexity.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from '@/redux/actions/reset-settings';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import SliceName from '@/redux/types/SliceName';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const MAXIMUM_QURAN_FONT_STEP = 10;
export const MAXIMUM_TRANSLATIONS_FONT_STEP = 10;
export const MAXIMUM_TAFSIR_FONT_STEP = 10;
export const MAXIMUM_REFLECTION_FONT_STEP = 10;
export const MAXIMUM_LESSON_FONT_STEP = 10;
export const MAXIMUM_WORD_BY_WORD_FONT_STEP = 6;
export const MINIMUM_FONT_STEP = 1;

export const quranReaderStylesSlice = createSlice({
  name: SliceName.QURAN_READER_STYLES,
  initialState: getQuranReaderStylesInitialState(),
  reducers: {
    increaseQuranTextFontScale: (state) => ({
      ...state,
      quranTextFontScale: state.quranTextFontScale + 1,
    }),
    decreaseQuranTextFontScale: (state) => ({
      ...state,
      quranTextFontScale: state.quranTextFontScale - 1,
    }),
    increaseTranslationFontScale: (state) => ({
      ...state,
      translationFontScale: state.translationFontScale + 1,
    }),
    decreaseTranslationFontScale: (state) => ({
      ...state,
      translationFontScale: state.translationFontScale - 1,
    }),
    increaseTafsirFontScale: (state) => ({
      ...state,
      tafsirFontScale: state.tafsirFontScale + 1,
    }),
    decreaseTafsirFontScale: (state) => ({
      ...state,
      tafsirFontScale: state.tafsirFontScale - 1,
    }),
    increaseReflectionFontScale: (state) => ({
      ...state,
      reflectionFontScale: (state.reflectionFontScale ?? 3) + 1,
    }),
    decreaseReflectionFontScale: (state) => ({
      ...state,
      reflectionFontScale: (state.reflectionFontScale ?? 3) - 1,
    }),
    increaseLessonFontScale: (state) => ({
      ...state,
      lessonFontScale: (state.lessonFontScale ?? 3) + 1,
    }),
    decreaseLessonFontScale: (state) => ({
      ...state,
      lessonFontScale: (state.lessonFontScale ?? 3) - 1,
    }),
    increaseWordByWordFontScale: (state) => ({
      ...state,
      wordByWordFontScale: state.wordByWordFontScale + 1,
    }),
    decreaseWordByWordFontScale: (state) => ({
      ...state,
      wordByWordFontScale: state.wordByWordFontScale - 1,
    }),
    increaseQnaFontScale: (state) => ({ ...state, qnaFontScale: state.qnaFontScale + 1 }),
    decreaseQnaFontScale: (state) => ({ ...state, qnaFontScale: state.qnaFontScale - 1 }),
    increaseSurahInfoFontScale: (state) => ({
      ...state,
      surahInfoFontScale: state.surahInfoFontScale + 1,
    }),
    decreaseSurahInfoFontScale: (state) => ({
      ...state,
      surahInfoFontScale: state.surahInfoFontScale - 1,
    }),
    increaseHadithFontScale: (state) => ({ ...state, hadithFontScale: state.hadithFontScale + 1 }),
    decreaseHadithFontScale: (state) => ({ ...state, hadithFontScale: state.hadithFontScale - 1 }),
    setMushafLines: (
      state,
      action: PayloadAction<{ mushafLines: MushafLines; locale: string }>,
    ) => {
      const { mushafLines, locale } = action.payload;
      const defaultQuranStylesForLocale = getQuranReaderStylesInitialState(locale);
      return {
        ...state,
        mushafLines,
        isUsingDefaultFont:
          defaultQuranStylesForLocale.mushafLines === mushafLines &&
          state.quranFont === defaultQuranStylesForLocale.quranFont,
      };
    },
    setQuranFont: (
      state: QuranReaderStyles,
      action: PayloadAction<{ quranFont: QuranFont; locale: string }>,
    ) => {
      const { quranFont, locale } = action.payload;
      const defaultQuranStylesForLocale = getQuranReaderStylesInitialState(locale);
      const isUsingDefaultFont =
        defaultQuranStylesForLocale.quranFont === quranFont &&
        state.mushafLines === defaultQuranStylesForLocale.mushafLines;
      return { ...state, quranFont, isUsingDefaultFont };
    },
    setShowTajweedRules: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showTajweedRules: action.payload,
    }),
  },
  // reset the state to the initial state when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => {
      return getQuranReaderStylesInitialState(action.payload.locale);
    });
    builder.addCase(syncUserPreferences, (state, action) => {
      const { userPreferences, locale } = action.payload;
      const remotePreferences = userPreferences[
        PreferenceGroup.QURAN_READER_STYLES
      ] as QuranReaderStyles;
      if (remotePreferences) {
        const { quranFont: defaultQuranFont, mushafLines: defaultMushafLines } =
          getQuranReaderStylesInitialState(locale);
        return {
          ...state,
          ...remotePreferences,
          isUsingDefaultFont:
            defaultQuranFont === remotePreferences.quranFont &&
            defaultMushafLines === remotePreferences.mushafLines,
        };
      }
      return state;
    });
  },
});

export const {
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
  increaseReflectionFontScale,
  decreaseReflectionFontScale,
  increaseLessonFontScale,
  decreaseLessonFontScale,
  setQuranFont,
  increaseQuranTextFontScale,
  decreaseQuranTextFontScale,
  increaseTranslationFontScale,
  decreaseTranslationFontScale,
  increaseWordByWordFontScale,
  decreaseWordByWordFontScale,
  increaseQnaFontScale,
  decreaseQnaFontScale,
  increaseSurahInfoFontScale,
  decreaseSurahInfoFontScale,
  increaseHadithFontScale,
  decreaseHadithFontScale,
  setMushafLines,
  setShowTajweedRules,
} = quranReaderStylesSlice.actions;

export const selectQuranReaderStyles = (state: RootState) => state.quranReaderStyles;
export const selectQuranFont = (state: RootState) => state.quranReaderStyles.quranFont;
export const selectQuranMushafLines = (state: RootState) => state.quranReaderStyles.mushafLines;
export const selectWordByWordFontScale = (s: RootState) => s.quranReaderStyles.wordByWordFontScale;
export const selectIsUsingDefaultFont = (s: RootState) => !!s.quranReaderStyles.isUsingDefaultFont;
export const selectShowTajweedRules = (s: RootState) => s.quranReaderStyles.showTajweedRules;

export default quranReaderStylesSlice.reducer;
