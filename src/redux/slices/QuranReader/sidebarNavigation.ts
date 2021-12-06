import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type SidebarNavigation = {
  isVisible: boolean;
  selectedNavigationItem: string;
};

export enum NavigationItem {
  Surah = 'surah',
  Juz = 'juz',
  Page = 'page',
}

export const navigationItems = [
  {
    name: 'Surah',
    value: NavigationItem.Surah,
  },
  {
    name: 'Juz',
    value: NavigationItem.Juz,
  },
  {
    name: 'Page',
    value: NavigationItem.Page,
  },
];

const initialState: SidebarNavigation = {
  isVisible: false,
  selectedNavigationItem: NavigationItem.Surah,
};

export const sidebarNavigationSlice = createSlice({
  name: 'sidebarNavigation',
  initialState,
  reducers: {
    setIsVisible: (state: SidebarNavigation, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
    selectNavigationItem: (state: SidebarNavigation, action: PayloadAction<string>) => ({
      ...state,
      selectedNavigationItem: action.payload,
    }),
  },
});

export const { setIsVisible, selectNavigationItem } = sidebarNavigationSlice.actions;

export const selectIsSidebarNavigationVisible = (state: RootState) =>
  state.sidebarNavigation.isVisible;

export const selectSelectedNavigationItem = (state: RootState) =>
  state.sidebarNavigation.selectedNavigationItem;

export default sidebarNavigationSlice.reducer;
