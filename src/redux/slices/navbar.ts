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
  disableSearchDrawerTransition: boolean;
  lockVisibilityState: boolean; // Flag to temporarily lock visibility state during tab switching
};

const initialState: Navbar = {
  isVisible: true,
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
  isSettingsDrawerOpen: false,
  settingsView: SettingsView.Body,
  disableSearchDrawerTransition: false,
  lockVisibilityState: false,
};

export const navbarSlice = createSlice({
  name: SliceName.NAVBAR,
  initialState,
  reducers: {
    setIsVisible: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      // Only update visibility if the lock is not active
      isVisible: state.lockVisibilityState ? state.isVisible : action.payload,
    }),
    setLockVisibilityState: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      lockVisibilityState: action.payload,
    }),
    setIsNavigationDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isNavigationDrawerOpen: action.payload,
    }),
    setIsSearchDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isSearchDrawerOpen: action.payload,
    }),
    toggleSearchDrawerIsOpen: (state: Navbar) => ({
      ...state,
      isSearchDrawerOpen: !state.isSearchDrawerOpen,
    }),
    setIsSettingsDrawerOpen: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      isSettingsDrawerOpen: action.payload,
    }),
    setSettingsView: (state: Navbar, action: PayloadAction<SettingsView>) => ({
      ...state,
      settingsView: action.payload,
    }),
    setDisableSearchDrawerTransition: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      disableSearchDrawerTransition: action.payload,
    }),
  },
});

export const {
  setIsVisible,
  setLockVisibilityState,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
  setSettingsView,
  toggleSearchDrawerIsOpen,
  setDisableSearchDrawerTransition,
} = navbarSlice.actions;

export const selectNavbar = (state: RootState) => state.navbar;
export const selectIsSearchDrawerOpen = (state: RootState) => state.navbar.isSearchDrawerOpen;
export const selectIsNavigationDrawerOpen = (state: RootState) =>
  state.navbar.isNavigationDrawerOpen;
export const selectIsSettingsDrawerOpen = (state: RootState) => state.navbar.isSettingsDrawerOpen;

export default navbarSlice.reducer;
