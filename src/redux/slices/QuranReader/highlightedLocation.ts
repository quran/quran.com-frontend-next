import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type HighlightedLocationState = {
  highlightedChapter: number | null;
  highlightedVerse: number | null;
  highlightedWord: number | null;
};

export const initialState: HighlightedLocationState = {
  highlightedChapter: null,
  highlightedVerse: null,
  highlightedWord: null,
};

/**
 * This slice keep track of current highlighted chapter, verse and word
 * component `HighlightedLocationListener` will listen to the currentTime of the audio player
 * and update the chapter, verse, and word in this slice
 */
const highlightedLocation = createSlice({
  name: 'highlightedLocation',
  initialState,
  reducers: {
    setHighlightedLocation: (state, { payload }: PayloadAction<HighlightedLocationState>) => {
      return {
        highlightedChapter: payload.highlightedChapter,
        highlightedVerse: payload.highlightedVerse,
        highlightedWord: payload.highlightedWord,
      };
    },
  },
});

export const selectHighlightedLocation = (state: RootState) => state.highlightedLocation;
export const { setHighlightedLocation } = highlightedLocation.actions;
export default highlightedLocation.reducer;
