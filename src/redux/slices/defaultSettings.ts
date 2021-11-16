import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type DefaultSettings = {
  isUsingDefaultSettings: boolean;
};

const initialState: DefaultSettings = { isUsingDefaultSettings: true };

export const defaultSettingsSlice = createSlice({
  name: 'defaultSettings',
  initialState,
  reducers: {
    setIsUsingDefaultSettings: (state: DefaultSettings, action: PayloadAction<boolean>) => ({
      ...state,
      isUsingDefaultSettings: action.payload,
    }),
  },
});

export const { setIsUsingDefaultSettings } = defaultSettingsSlice.actions;

export default defaultSettingsSlice.reducer;

export const selectIsUsingDefaultSettings = (state: RootState) =>
  state.defaultSettings.isUsingDefaultSettings;
