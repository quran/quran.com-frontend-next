import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Search = {
  recentSearchQueries: string[];
};

const initialState: Search = { recentSearchQueries: [] };

const MAXIMUM_RECENT_SEARCH_QUERIES = 5;

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addRecentSearchQuery: (state: Search, action: PayloadAction<string>) => {
      let newRecentSearchQueries = [...state.recentSearchQueries];
      // if we have reached the maximum number of search queries, remove the last element
      if (state.recentSearchQueries.length >= MAXIMUM_RECENT_SEARCH_QUERIES) {
        // splice will mutate newRecentSearchQueries and remove the last element
        newRecentSearchQueries.splice(-1);
      }
      // put the new search query at the beginning of the array
      newRecentSearchQueries = [action.payload, ...newRecentSearchQueries];
      return {
        ...state,
        recentSearchQueries: newRecentSearchQueries,
      };
    },
  },
});

export const { addRecentSearchQuery } = searchSlice.actions;

export const selectRecentSearchQueries = (state) => state.search.recentSearchQueries as string[];

export default searchSlice.reducer;
