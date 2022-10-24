import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type Search = {
  searchHistory: string[];
};

const initialState: Search = { searchHistory: [] };

const MAXIMUM_RECENT_SEARCH_QUERIES = 5;

export const searchSlice = createSlice({
  name: SliceName.SEARCH,
  initialState,
  reducers: {
    addSearchHistoryRecord: (state: Search, action: PayloadAction<string>) => {
      let newSearchHistory = [...state.searchHistory];
      const newSearchQuery = action.payload;
      // if we have reached the maximum number of search queries, remove the last element
      if (state.searchHistory.length >= MAXIMUM_RECENT_SEARCH_QUERIES) {
        // splice will mutate newSearchHistory and remove the last element
        newSearchHistory.splice(-1);
      }
      // filter out the old search queries that match the new search queries (if any).
      newSearchHistory = newSearchHistory.filter(
        (currentSearchQuery) => currentSearchQuery !== newSearchQuery,
      );
      // put the new search query at the beginning of the array
      newSearchHistory = [newSearchQuery, ...newSearchHistory];
      return {
        ...state,
        searchHistory: newSearchHistory,
      };
    },
    removeSearchHistoryRecord: (state: Search, action: PayloadAction<string>) => {
      // filter out the search queries from the current search queries array.
      const newSearchHistory = [...state.searchHistory].filter(
        (currentSearchQuery) => currentSearchQuery !== action.payload,
      );
      return {
        ...state,
        searchHistory: newSearchHistory,
      };
    },
  },
});

export const { addSearchHistoryRecord, removeSearchHistoryRecord } = searchSlice.actions;

export const selectSearchHistory = (state: RootState) => state.search.searchHistory;

export default searchSlice.reducer;
