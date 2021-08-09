import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ThemeType {
  Light = 'light',
  Dark = 'dark',
  Sepia = 'sepia',
}

export type Theme = {
  type: ThemeType;
};

const initialState: Theme = {
  type: ThemeType.Light,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state: Theme, action: PayloadAction<ThemeType>) => {
      return {
        ...state,
        type: action.payload,
      };
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state) => state.theme;

export default themeSlice.reducer;
