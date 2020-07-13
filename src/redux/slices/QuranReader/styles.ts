import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuranFont } from 'src/components/QuranReader/types';

const FONT_SCALING_FACTOR = 1.1;

export type QuranReaderStyles = {
  translationFontSize: number;
  quranTextFontSize: number;
  quranTextLineHeight: number;
  quranTextLetterSpacing: number;
  quranFont: QuranFont;
};

const initialState: QuranReaderStyles = {
  // the base sizes in rem
  translationFontSize: 1,
  quranTextFontSize: 2,
  quranTextLineHeight: 3,
  quranTextLetterSpacing: 0.25,
  quranFont: QuranFont.Uthmani,
};

export const quranReaderStylesSlice = createSlice({
  name: 'quranReaderStyles',
  initialState,
  reducers: {
    increaseTranslationTextSize: (state) => {
      return {
        ...state,
        translationFontSize: state.translationFontSize * FONT_SCALING_FACTOR,
      };
    },
    increaseQuranTextSize: (state) => {
      return {
        ...state,
        quranTextFontSize: state.quranTextFontSize * FONT_SCALING_FACTOR,
        quranTextLineHeight: state.quranTextLineHeight * FONT_SCALING_FACTOR,
        quranTextLetterSpacing: state.quranTextLetterSpacing * FONT_SCALING_FACTOR,
      };
    },
    decreaseTranslationTextSize: (state) => {
      return {
        ...state,
        translationFontSize: state.translationFontSize / FONT_SCALING_FACTOR,
      };
    },
    decreaseQuranTextSize: (state) => {
      return {
        ...state,
        quranTextFontSize: state.quranTextFontSize / FONT_SCALING_FACTOR,
        quranTextLineHeight: state.quranTextLineHeight / FONT_SCALING_FACTOR,
        quranTextLetterSpacing: state.quranTextLetterSpacing / FONT_SCALING_FACTOR,
      };
    },
    setQuranFont: (state: QuranReaderStyles, action: PayloadAction<QuranFont>) => {
      return {
        ...state,
        quranFont: action.payload,
      };
    },
  },
});

export const {
  increaseTranslationTextSize,
  increaseQuranTextSize,
  decreaseQuranTextSize,
  decreaseTranslationTextSize,
} = quranReaderStylesSlice.actions;

export const selectQuranReaderStyles = (state) => state.quranReaderStyles;

export default quranReaderStylesSlice.reducer;
