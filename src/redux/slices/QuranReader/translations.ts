import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from '@/redux/actions/reset-settings';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getTranslationsInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import TranslationsSettings from '@/redux/types/TranslationsSettings';
import { areArraysEqual } from '@/utils/array';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const translationsSlice = createSlice({
  name: SliceName.TRANSLATIONS,
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
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences, locale },
      } = action;
      const remotePreferences = userPreferences[
        PreferenceGroup.TRANSLATIONS
      ] as TranslationsSettings;
      if (remotePreferences) {
        const { selectedTranslations: defaultTranslations } = getTranslationsInitialState(locale);
        const { selectedTranslations: remoteTranslations } = remotePreferences;
        return {
          ...state,
          ...remotePreferences,
          isUsingDefaultTranslations: areArraysEqual(defaultTranslations, remoteTranslations),
        };
      }
      return state;
    });
  },
});

export const { setSelectedTranslations } = translationsSlice.actions;

export const selectTranslations = (state: RootState) => state.translations;
export const selectSelectedTranslations = (state: RootState) =>
  state.translations.selectedTranslations;
export const selectIsUsingDefaultTranslations = (state: RootState) =>
  state.translations.isUsingDefaultTranslations;

export default translationsSlice.reducer;
