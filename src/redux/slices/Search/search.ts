import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Search = {
  searchHistory: string[];
};

const initialState: Search = { searchHistory: [] };

const MAXIMUM_RECENT_SEARCH_QUERIES = 5;

export const searchSlice = createSlice({
  name: 'search',
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
  },
});

export const { addSearchHistoryRecord } = searchSlice.actions;

export const selectSearchHistory = (state) => state.search.searchHistory as string[];

export default searchSlice.reducer;
