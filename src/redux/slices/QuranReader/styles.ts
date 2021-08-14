import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuranFont } from 'src/components/QuranReader/types';

export const MAXIMUM_FONT_STEP = 5;

export type QuranReaderStyles = {
  tafsirFontScale: number;
  translationFontScale: number;
  quranTextFontScale: number;
  quranFont: QuranFont;
};

const initialState: QuranReaderStyles = {
  // the base sizes in rem
  tafsirFontScale: 1,
  quranTextFontScale: 1,
  translationFontScale: 1,
  quranFont: QuranFont.QPCHafs,
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
});

export const {
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
  setQuranFont,
  increaseQuranTextFontScale,
  decreaseQuranTextFontScale,
  increaseTranslationFontScale,
  decreaseTranslationFontScale,
} = quranReaderStylesSlice.actions;

export const selectQuranReaderStyles = (state) => state.quranReaderStyles;

export default quranReaderStylesSlice.reducer;
