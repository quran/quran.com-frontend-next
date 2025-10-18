import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

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
  extraReducers: (builder) => {
    // Reset isVisible to false when state is restored from storage
    builder.addCase(REHYDRATE, (state, action) => {
      // Type assertion needed as REHYDRATE action has a payload but type doesn't reflect it
      const rehydrateAction = action as any;
      if (rehydrateAction.payload && rehydrateAction.payload.sidebarNavigation) {
        return {
          // Force isVisible to false during rehydrate
          // This ensures the sidebar is always closed in new tab/window
          ...rehydrateAction.payload.sidebarNavigation,
          isVisible: false,
        };
      }
      return state;
    });
  },
});

export const { setIsSidebarNavigationVisible, toggleIsVisible, selectNavigationItem } =
  sidebarNavigationSlice.actions;

export const selectIsSidebarNavigationVisible = (state: RootState) =>
  state.sidebarNavigation.isVisible;

export const selectSelectedNavigationItem = (state: RootState) =>
  state.sidebarNavigation.selectedNavigationItem;

export default sidebarNavigationSlice.reducer;
