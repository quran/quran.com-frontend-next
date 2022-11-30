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
}

export const initialSidebarIsVisible = 'auto'; // sidebar will be open on desktop and closed on mobile
const initialState: SidebarNavigation = {
  isVisible: initialSidebarIsVisible,
  selectedNavigationItem: NavigationItem.Surah,
};

export const sidebarNavigationSlice = createSlice({
  name: SliceName.SIDEBAR_NAVIGATION,
  initialState,
  reducers: {
    setIsVisible: (state: SidebarNavigation, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
    selectNavigationItem: (state: SidebarNavigation, action: PayloadAction<NavigationItem>) => ({
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
