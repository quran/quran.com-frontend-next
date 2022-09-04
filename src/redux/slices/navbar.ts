import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export enum SettingsView {
  Body = 'body',
  Translation = 'translation',
  Reciter = 'reciter',
  Tafsir = 'tafsir',
  RepeatSettings = 'repeatSettings',
}

export type Navbar = {
  isVisible: boolean;
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
  settingsView: SettingsView;
};

const initialState: Navbar = {
  isVisible: true,
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
  isSettingsDrawerOpen: false,
  settingsView: SettingsView.Body,
};

export const navbarSlice = createSlice({
  name: SliceName.NAVBAR,
  initialState,
  reducers: {
    setIsVisible: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
    setIsNavigationDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isNavigationDrawerOpen: action.payload,
    }),
    setIsSearchDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isSearchDrawerOpen: action.payload,
    }),
    setIsSettingsDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isSettingsDrawerOpen: action.payload,
    }),
    setSettingsView: (state: Navbar, action: PayloadAction<SettingsView>) => ({
      ...state,
      settingsView: action.payload,
    }),
  },
});

export const {
  setIsVisible,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
  setSettingsView,
} = navbarSlice.actions;

export const selectNavbar = (state: RootState) => state.navbar;

export default navbarSlice.reducer;
