import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getTranslationsInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import { areArraysEqual } from 'src/utils/array';

export const translationsSlice = createSlice({
  name: 'translations',
  initialState: getTranslationsInitialState(),
  reducers: {
    setSelectedTranslations: (
      state,
      action: PayloadAction<{ translations: number[]; locale: string }>,
    ) => ({
      ...state,
      // we need to before we compare because there is a corner case when the user changes the default translations then re-selects them which results in the same array as the default one but reversed e.g. instead of [20, 131] it becomes [131, 20].
      isUsingDefaultTranslations: areArraysEqual(
        getTranslationsInitialState(action.payload.locale).selectedTranslations,
        action.payload.translations,
      ), // check if the user is using the default translations on each translation change.
      selectedTranslations: action.payload.translations,
    }),
  },
  // reset the translation state to initial state
  // when `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => {
      return getTranslationsInitialState(action.payload.locale);
    });
  },
});

export const { setSelectedTranslations } = translationsSlice.actions;

export const selectSelectedTranslations = (state: RootState) =>
  state.translations.selectedTranslations;
export const selectIsUsingDefaultTranslations = (state: RootState) =>
  state.translations.isUsingDefaultTranslations;

export default translationsSlice.reducer;
