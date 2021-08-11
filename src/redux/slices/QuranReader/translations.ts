import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { areArraysEquals } from 'src/utils/array';

export const DEFAULT_TRANSLATIONS = [20, 131];

export type TranslationsSettings = {
  selectedTranslations: number[];
  isUsingDefaultTranslations: boolean;
};

const initialState: TranslationsSettings = {
  selectedTranslations: DEFAULT_TRANSLATIONS,
  isUsingDefaultTranslations: true,
};

export const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setSelectedTranslations: (state, action: PayloadAction<number[]>) => ({
      ...state,
      // we need to before we compare because there is a corner case when the user changes the default translations then re-selects them which results in the same array as the default one but reversed e.g. instead of [20, 131] it becomes [131, 20].
      isUsingDefaultTranslations: areArraysEquals(DEFAULT_TRANSLATIONS, action.payload), // check if the user is using the default translations on each translation change.
      selectedTranslations: action.payload,
    }),
  },
});

export const { setSelectedTranslations } = translationsSlice.actions;

export const selectTranslations = (state) => state.translations;

export default translationsSlice.reducer;
