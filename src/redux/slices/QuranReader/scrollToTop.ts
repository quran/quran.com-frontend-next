import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type ScrollToTop = {
  showScrollToTop: boolean;
};

const initialState: ScrollToTop = { showScrollToTop: true };

export const scrollToTopSlice = createSlice({
  name: 'scrollToTop',
  initialState,
  reducers: {
    setShowScrollToTop: (state: ScrollToTop, action: PayloadAction<boolean>) => ({
      ...state,
      showScrollToTop: action.payload,
    }),
  },
});

export const { setShowScrollToTop } = scrollToTopSlice.actions;

export const selectScrollToTop = (state: RootState) => state.scrollToTop;

export default scrollToTopSlice.reducer;
