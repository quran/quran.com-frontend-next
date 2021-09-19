import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type Navbar = {
  isVisible: boolean;
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
};

const initialState: Navbar = {
  isVisible: true,
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
  isSettingsDrawerOpen: false,
};

export const navbarSlice = createSlice({
  name: 'navbar',
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
  },
});

export const {
  setIsVisible,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
} = navbarSlice.actions;

export const selectNavbar = (state: RootState) => state.navbar;

export default navbarSlice.reducer;
