import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getThemeInitialState } from '../defaultSettings/util';

import resetSettings from 'src/redux/actions/reset-settings';
import syncUserPreferences from 'src/redux/actions/sync-user-preferences';
import { RootState } from 'src/redux/RootState';
import Theme from 'src/redux/types/Theme';
import ThemeType from 'src/redux/types/ThemeType';
import PreferenceGroup from 'types/auth/PreferenceGroup';

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
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences },
      } = action;
      if (userPreferences[PreferenceGroup.THEME]) {
        return { ...state, ...userPreferences[PreferenceGroup.THEME] } as Theme;
      }
      return state;
    });
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme;

export default themeSlice.reducer;
