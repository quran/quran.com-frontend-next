import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont } from 'types/QuranReader';

export const MAXIMUM_QURAN_FONT_STEP = 10;
export const MAXIMUM_FONT_STEP = 5;
export const MINIMUM_FONT_STEP = 1;

export const quranReaderStylesSlice = createSlice({
  name: 'quranReaderStyles',
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
      switch (quranFont) {
        case QuranFont.MadaniV1:
          return {
            ...state,
            quranFont,
            isUsingDefaultFont,
          };
        case QuranFont.IndoPak:
          return {
            ...state,
            quranFont,
            isUsingDefaultFont,
          };
        default:
          return {
            ...state,
            quranFont,
            isUsingDefaultFont,
          };
      }
    },
  },
  // reset the state to the initial state
  // when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => {
      return getQuranReaderStylesInitialState(action.payload.locale);
    });
  },
});

export const {
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
  setQuranFont,
  increaseQuranTextFontScale,
  decreaseQuranTextFontScale,
  increaseTranslationFontScale,
  decreaseTranslationFontScale,
  setMushafLines,
} = quranReaderStylesSlice.actions;

export const selectQuranReaderStyles = (state: RootState) => state.quranReaderStyles;
export const selectQuranFont = (state: RootState) => state.quranReaderStyles.quranFont;
export const selectIsUsingDefaultFont = (state: RootState) =>
  !!state.quranReaderStyles.isUsingDefaultFont;

export default quranReaderStylesSlice.reducer;
