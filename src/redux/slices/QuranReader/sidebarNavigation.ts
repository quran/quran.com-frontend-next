import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type SidebarNavigation = {
  isVisible: boolean;
};

const initialState: SidebarNavigation = { isVisible: false };

export const sidebarNavigationSlice = createSlice({
  name: 'sidebarNavigation',
  initialState,
  reducers: {
    setIsVisible: (state: SidebarNavigation, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
  },
});

export const { setIsVisible } = sidebarNavigationSlice.actions;

export const selectIsSidebarNavigationVisible = (state: RootState) =>
  state.sidebarNavigation.isVisible;

export default sidebarNavigationSlice.reducer;
