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

export enum SettingsTab {
  Arabic = 'arabic',
  Translation = 'translation',
  More = 'more',
}

export type Navbar = {
  isVisible: boolean;
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
  settingsView: SettingsView;
  lastSettingsView: SettingsView;
  lastSettingsTab: SettingsTab;
  disableSearchDrawerTransition: boolean;
  lockVisibilityState: boolean;
};

const initialState: Navbar = {
  isVisible: true,
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
  isSettingsDrawerOpen: false,
  settingsView: SettingsView.Body,
  lastSettingsView: SettingsView.Body,
  lastSettingsTab: SettingsTab.Arabic,
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
      // Reset views when drawer is closed
      ...(action.payload === false && {
        settingsView: SettingsView.Body,
        lastSettingsView: SettingsView.Body,
      }),
    }),
    setSettingsView: (state: Navbar, action: PayloadAction<SettingsView>) => ({
      ...state,
      settingsView: action.payload,
      // Track the last non-Body view for navigation context
      lastSettingsView:
        action.payload !== SettingsView.Body ? action.payload : state.lastSettingsView,
    }),
    setDisableSearchDrawerTransition: (state: Navbar, action: PayloadAction<boolean>) => ({
      ...state,
      disableSearchDrawerTransition: action.payload,
    }),
    setLastSettingsTab: (state: Navbar, action: PayloadAction<SettingsTab>) => ({
      ...state,
      lastSettingsTab: action.payload,
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
  setLastSettingsTab,
} = navbarSlice.actions;

export const selectNavbar = (state: RootState) => state.navbar;
export const selectIsSearchDrawerOpen = (state: RootState) => state.navbar.isSearchDrawerOpen;
export const selectIsNavigationDrawerOpen = (state: RootState) =>
  state.navbar.isNavigationDrawerOpen;
export const selectIsSettingsDrawerOpen = (state: RootState) => state.navbar.isSettingsDrawerOpen;

export default navbarSlice.reducer;
