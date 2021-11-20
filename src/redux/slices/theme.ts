import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from './reset-settings';

import { RootState } from 'src/redux/RootState';

export enum ThemeType {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
  // Sepia = 'sepia',
}

export type Theme = {
  type: ThemeType;
};

const initialState: Theme = {
  type: ThemeType.System,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state: Theme, action: PayloadAction<ThemeType>) => ({
      ...state,
      type: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(resetSettings, () => initialState);
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme;

export default themeSlice.reducer;
