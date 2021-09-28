import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import { MushafLines, QuranFont } from 'types/QuranReader';

export const MAXIMUM_FONT_STEP = 5;
export const MINIMUM_FONT_STEP = 1;

export type QuranReaderStyles = {
  tafsirFontScale: number;
  translationFontScale: number;
  quranTextFontScale: number;
  quranFont: QuranFont;
  mushafLines: MushafLines;
};

export const initialState: QuranReaderStyles = {
  // the base sizes in rem
  tafsirFontScale: 3,
  quranTextFontScale: 3,
  translationFontScale: 3,
  quranFont: QuranFont.QPCHafs,
  mushafLines: MushafLines.SixteenLines,
};

export const quranReaderStylesSlice = createSlice({
  name: 'quranReaderStyles',
  initialState,
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
    setMushafLines: (state, action: PayloadAction<MushafLines>) => ({
      ...state,
      mushafLines: action.payload,
    }),
    setQuranFont: (state: QuranReaderStyles, action: PayloadAction<QuranFont>) => {
      switch (action.payload) {
        case QuranFont.MadaniV1:
          return {
            ...state,
            quranFont: action.payload,
          };
        case QuranFont.IndoPak:
          return {
            ...state,
            quranFont: action.payload,
          };
        default:
          return {
            ...state,
            quranFont: action.payload,
          };
      }
    },
  },
  // reset the state to the initial state
  // when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, () => initialState);
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

export default quranReaderStylesSlice.reducer;
