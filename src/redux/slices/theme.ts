import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getThemeInitialState } from '../defaultSettings/util';

import resetSettings from '@/redux/actions/reset-settings';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import Theme from '@/redux/types/Theme';
import ThemeType from '@/redux/types/ThemeType';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const themeSlice = createSlice({
  name: SliceName.THEME,
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
