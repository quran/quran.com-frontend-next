import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const DEFAULT_TRANSLATIONS = [20, 131];

const initialState: number[] = DEFAULT_TRANSLATIONS;

export const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setSelectedTranslations: (state, action: PayloadAction<number[]>) => action.payload,
  },
});

export const { setSelectedTranslations } = translationsSlice.actions;

export const selectTranslations = (state) => state.translations;

export default translationsSlice.reducer;
