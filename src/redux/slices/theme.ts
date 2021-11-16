import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getThemeInitialState } from '../defaultSettings/util';

import resetSettings from './reset-settings';

import { RootState } from 'src/redux/RootState';
import Theme from 'src/redux/types/Theme';
import ThemeType from 'src/redux/types/ThemeType';

export const themeSlice = createSlice({
  name: 'theme',
  initialState: getThemeInitialState(),
  reducers: {
    setTheme: (state: Theme, action: PayloadAction<ThemeType>) => ({
      ...state,
      type: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => {
      return getThemeInitialState(action.payload.locale);
    });
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme;

export default themeSlice.reducer;
