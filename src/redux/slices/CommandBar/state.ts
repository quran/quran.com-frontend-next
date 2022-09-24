import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { SearchNavigationResult } from 'types/SearchNavigationResult';

export type CommandBar = {
  isOpen: boolean;
  recentNavigations: SearchNavigationResult[];
};

const MAXIMUM_RECENT_NAVIGATIONS = 5;

const initialState: CommandBar = { isOpen: false, recentNavigations: [] };

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
  },
});

export const { setIsOpen, toggleIsOpen, addRecentNavigation, removeRecentNavigation } =
  commandBarSlice.actions;

export const selectCommandBarIsOpen = (state: RootState) => state.commandBar.isOpen;
export const selectRecentNavigations = (state: RootState) => state.commandBar.recentNavigations;

export default commandBarSlice.reducer;
