import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type ReadingViewHoveredVerseState = {
  hoveredVerseKey: string | null;
  clickedVerseKey: string | null;
};

export const initialState: ReadingViewHoveredVerseState = {
  hoveredVerseKey: null,
  clickedVerseKey: null,
};

/**
 * This slice keep track of the current hovered verse in the reading mode
 *
 */
const readingViewVerse = createSlice({
  name: 'readingViewHoveredVerse',
  initialState,
  reducers: {
    setReadingViewHoveredVerseKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        hoveredVerseKey: payload,
      };
    },
    setReadingViewClickedVerseKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        clickedVerseKey: payload,
      };
    },
  },
});

export const selectReadingViewHoveredVerseKey = (state: RootState) =>
  state.readingViewVerse.hoveredVerseKey;

export const selectReadingViewClickedVerseKey = (state: RootState) =>
  state.readingViewVerse.clickedVerseKey;

export const { setReadingViewHoveredVerseKey, setReadingViewClickedVerseKey } =
  readingViewVerse.actions;
export default readingViewVerse.reducer;
