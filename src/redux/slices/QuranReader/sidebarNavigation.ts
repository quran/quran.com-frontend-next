import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type IsSidebarNavigationVisible = boolean | 'auto';
export type SidebarNavigation = {
  isVisible: IsSidebarNavigationVisible;
  selectedNavigationItem: string;
};

export enum NavigationItem {
  Surah = 'surah',
  Juz = 'juz',
  Page = 'page',
  RubElHizb = 'rub_el_hizb',
  Hizb = 'hizb',
  Verse = 'verse',
}

export const initialSidebarIsVisible = false; // sidebar will be closed by default
const initialState: SidebarNavigation = {
  isVisible: initialSidebarIsVisible,
  selectedNavigationItem: NavigationItem.Surah,
};

export const sidebarNavigationSlice = createSlice({
  name: SliceName.SIDEBAR_NAVIGATION,
  initialState,
  reducers: {
    setIsSidebarNavigationVisible: (state: SidebarNavigation, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
    toggleIsVisible: (state: SidebarNavigation) => ({
      ...state,
      isVisible: !state.isVisible,
    }),
    selectNavigationItem: (state: SidebarNavigation, action: PayloadAction<NavigationItem>) => ({
      ...state,
      selectedNavigationItem: action.payload,
    }),
  },
});

export const { setIsSidebarNavigationVisible, toggleIsVisible, selectNavigationItem } =
  sidebarNavigationSlice.actions;

export const selectIsSidebarNavigationVisible = (state: RootState) =>
  state.sidebarNavigation.isVisible;

export const selectSelectedNavigationItem = (state: RootState) =>
  state.sidebarNavigation.selectedNavigationItem;

export default sidebarNavigationSlice.reducer;
