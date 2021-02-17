import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Navbar = {
  isVisible: boolean;
  isSideMenuOpen: boolean;
};

const initialState: Navbar = { isVisible: true, isSideMenuOpen: false };

export const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setIsVisible: (state: Navbar, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isVisible: action.payload,
      };
    },
    setIsSideMenuOpen: (state: Navbar, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isSideMenuOpen: action.payload,
      };
    },
  },
});

export const { setIsVisible, setIsSideMenuOpen } = navbarSlice.actions;

export const selectNavbar = (state) => state.navbar;

export default navbarSlice.reducer;
