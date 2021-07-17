import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const DEFAULT_TRANSLATIONS = ['20'];

const initialState: string[] = DEFAULT_TRANSLATIONS;

export const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setCurrentTranslations: (state, action: PayloadAction) => {
      // this is to handle if the user un-selects all translations, we will reset it to defaults.
      return action.payload.length ? action.payload : DEFAULT_TRANSLATIONS;
    },
  },
});

export const { setCurrentTranslations } = translationsSlice.actions;

export const selectCurrentTranslations = (state) => state.translations;

export default translationsSlice.reducer;
