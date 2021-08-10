import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuranFont } from 'src/components/QuranReader/types';

const FONT_SCALING_FACTOR = 1.1;

export enum LetterSpacingMultiplyer { // Used to justify the words on the line, fonts with smaller words need a smaller multiplier
  MadaniV1 = 17,
  MadaniV2 = 17,
  IndoPak = 13,
  None = 1,
}

export type QuranReaderStyles = {
  translationFontSize: number;
  quranTextFontSize: number;
  quranTextLineHeight: number;
  quranTextLetterSpacing: number;
  quranFont: QuranFont;
  letterSpacingMultiplier: LetterSpacingMultiplyer;
};

const initialState: QuranReaderStyles = {
  // the base sizes in rem
  translationFontSize: 1,
  quranTextFontSize: 2,
  quranTextLineHeight: 3,
  quranTextLetterSpacing: 0,
  quranFont: QuranFont.QPCHafs,
  letterSpacingMultiplier: LetterSpacingMultiplyer.None,
};

export const quranReaderStylesSlice = createSlice({
  name: 'quranReaderStyles',
  initialState,
  reducers: {
    increaseTranslationTextSize: (state) => ({
      ...state,
      translationFontSize: state.translationFontSize * FONT_SCALING_FACTOR,
    }),
    increaseQuranTextSize: (state) => ({
      ...state,
      quranTextFontSize: state.quranTextFontSize * FONT_SCALING_FACTOR,
      quranTextLineHeight: state.quranTextLineHeight * FONT_SCALING_FACTOR,
      quranTextLetterSpacing: state.quranTextLetterSpacing * FONT_SCALING_FACTOR,
    }),
    decreaseTranslationTextSize: (state) => ({
      ...state,
      translationFontSize: state.translationFontSize / FONT_SCALING_FACTOR,
    }),
    decreaseQuranTextSize: (state) => ({
      ...state,
      quranTextFontSize: state.quranTextFontSize / FONT_SCALING_FACTOR,
      quranTextLineHeight: state.quranTextLineHeight / FONT_SCALING_FACTOR,
      quranTextLetterSpacing: state.quranTextLetterSpacing / FONT_SCALING_FACTOR,
    }),
    setQuranFont: (state: QuranReaderStyles, action: PayloadAction<QuranFont>) => {
      switch (action.payload) {
        case QuranFont.MadaniV1:
          return {
            ...state,
            quranFont: action.payload,
            letterSpacingMultiplier: LetterSpacingMultiplyer.MadaniV1,
          };
        case QuranFont.IndoPak:
          return {
            ...state,
            quranFont: action.payload,
            letterSpacingMultiplier: LetterSpacingMultiplyer.IndoPak,
          };
        default:
          return {
            ...state,
            quranFont: action.payload,
            letterSpacingMultiplier: LetterSpacingMultiplyer.None,
          };
      }
    },
  },
});

export const {
  decreaseQuranTextSize,
  decreaseTranslationTextSize,
  increaseQuranTextSize,
  increaseTranslationTextSize,
  setQuranFont,
} = quranReaderStylesSlice.actions;

export const selectQuranReaderStyles = (state) => state.quranReaderStyles;

export default quranReaderStylesSlice.reducer;
