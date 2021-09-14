import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/RootState';
import { areArraysEqual } from 'src/utils/array';
import resetSettings from '../reset-settings';

export const DEFAULT_TRANSLATIONS = [20, 131];

type TranslationsSettings = {
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
      isUsingDefaultTranslations: areArraysEqual(DEFAULT_TRANSLATIONS, action.payload), // check if the user is using the default translations on each translation change.
      selectedTranslations: action.payload,
    }),
  },
  // reset the translation state to initial state
  // when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, () => initialState);
  },
});

export const { setSelectedTranslations } = translationsSlice.actions;

export const selectSelectedTranslations = (state: RootState) =>
  state.translations.selectedTranslations;
export const selectIsUsingDefaultTranslations = (state: RootState) =>
  state.translations.isUsingDefaultTranslations;

export default translationsSlice.reducer;
