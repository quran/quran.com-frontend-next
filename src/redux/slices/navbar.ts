import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Navbar = {
  isVisible: boolean;
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
};

const initialState: Navbar = {
  isVisible: true,
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
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
  },
});

export const { setIsVisible, setIsNavigationDrawerOpen, setIsSearchDrawerOpen } =
  navbarSlice.actions;

export const selectNavbar = (state) => state.navbar;

export default navbarSlice.reducer;
