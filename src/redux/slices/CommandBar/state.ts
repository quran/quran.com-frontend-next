import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { SearchNavigationResult } from 'types/SearchNavigationResult';

export type CommandBar = {
  isOpen: boolean;
  recentNavigations: SearchNavigationResult[];
  initialSearchQuery: string;
};

const MAXIMUM_RECENT_NAVIGATIONS = 5;

const initialState: CommandBar = { isOpen: false, recentNavigations: [], initialSearchQuery: '' };

export const commandBarSlice = createSlice({
  name: SliceName.COMMAND_BAR,
  initialState,
  reducers: {
    setIsOpen: (state: CommandBar, action: PayloadAction<boolean>) => ({
      ...state,
      isOpen: action.payload,
    }),
    toggleIsOpen: (state: CommandBar) => ({
      ...state,
      isOpen: !state.isOpen,
      initialSearchQuery: '', // we reset the initial search query when the command bar is toggled
    }),
    addRecentNavigation: (state: CommandBar, action: PayloadAction<SearchNavigationResult>) => {
      let newRecentNavigations = [...state.recentNavigations];
      const newRecentNavigation = action.payload;
      // filter out the old recent navigations that match the new recent navigations (if any) to avoid duplicates.
      newRecentNavigations = newRecentNavigations.filter(
        (currentRecentNavigation) => currentRecentNavigation.key !== newRecentNavigation.key,
      );
      // if we have reached the maximum number of recent navigations, remove the last element
      if (newRecentNavigations.length >= MAXIMUM_RECENT_NAVIGATIONS) {
        // splice will mutate newRecentNavigations and remove the last element
        newRecentNavigations.splice(-1);
      }
      // put the new recent navigation at the beginning of the array
      return {
        ...state,
        recentNavigations: [newRecentNavigation, ...newRecentNavigations],
      };
    },
    removeRecentNavigation: (state: CommandBar, action: PayloadAction<number | string>) => {
      // filter out the recent navigations from the current recent navigations array.
      const newRecentNavigations = [...state.recentNavigations].filter(
        (currentRecentNavigation) => currentRecentNavigation.key !== action.payload,
      );
      return {
        ...state,
        recentNavigations: newRecentNavigations,
      };
    },
    setInitialSearchQuery: (state: CommandBar, action: PayloadAction<string>) => ({
      ...state,
      initialSearchQuery: action.payload,
    }),
  },
});

export const {
  setIsOpen,
  toggleIsOpen,
  addRecentNavigation,
  removeRecentNavigation,
  setInitialSearchQuery,
} = commandBarSlice.actions;

export const selectCommandBarIsOpen = (state: RootState) => state.commandBar.isOpen;
export const selectRecentNavigations = (state: RootState) => state.commandBar.recentNavigations;
export const selectInitialSearchQuery = (state: RootState) => state.commandBar.initialSearchQuery;
export default commandBarSlice.reducer;
