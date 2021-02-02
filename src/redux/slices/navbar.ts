import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Navbar = {
  isVisible: boolean;
};

const initialState: Navbar = { isVisible: false };

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
  },
});

export const { setIsVisible } = navbarSlice.actions;

export const selectNavbar = (state) => state.navbar;

export default navbarSlice.reducer;
