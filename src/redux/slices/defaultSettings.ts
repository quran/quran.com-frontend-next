import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getLocaleInitialState } from '../defaultSettings/util';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { addOrUpdateBulkUserPreferences } from '@/utils/auth/api';
import { stateToPreferenceGroups } from '@/utils/auth/preferencesMapper';

export type DefaultSettings = {
  isUsingDefaultSettings: boolean;
};

const initialState: DefaultSettings = { isUsingDefaultSettings: true };

export const defaultSettingsSlice = createSlice({
  name: SliceName.DEFAULT_SETTINGS,
  initialState,
  reducers: {
    setIsUsingDefaultSettings: (state: DefaultSettings, action: PayloadAction<boolean>) => ({
      ...state,
      isUsingDefaultSettings: action.payload,
    }),
  },
});

export const persistDefaultSettings = createAsyncThunk<void, string, { state: RootState }>(
  `${SliceName.DEFAULT_SETTINGS}/persistDefaultSettings`,
  async (locale) => {
    const localeDefaultSettings = stateToPreferenceGroups({
      ...getLocaleInitialState(locale),
      [SliceName.LOCALE]: locale,
    });
    await addOrUpdateBulkUserPreferences(localeDefaultSettings);
  },
);

export const { setIsUsingDefaultSettings } = defaultSettingsSlice.actions;

export default defaultSettingsSlice.reducer;

export const selectIsUsingDefaultSettings = (state: RootState) =>
  state.defaultSettings.isUsingDefaultSettings;
