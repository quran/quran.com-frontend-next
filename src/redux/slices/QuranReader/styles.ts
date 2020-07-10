import { createSlice } from '@reduxjs/toolkit';

const FONT_SCALING_FACTOR = 1.1;

export const quranReaderStylesSlice = createSlice({
  name: 'quranReaderStyles',
  initialState: {
    // the base sizes in rem
    translationFontSize: 2,
    quranTextFontSize: 3,
    quranTextlineHeight: 0.25,
  },
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
        quranTextlineHeight: state.quranTextlineHeight * FONT_SCALING_FACTOR,
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
        quranTextlineHeight: state.quranTextlineHeight / FONT_SCALING_FACTOR,
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

export const selectQuranReaderStyle = (state) => state.quranReaderStyle;

export default quranReaderStylesSlice.reducer;
