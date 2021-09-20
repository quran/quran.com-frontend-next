import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type HighlightedLocationState = {
  chapter: number | null;
  verse: number | null;
  word: number | null;
};

export const initialState: HighlightedLocationState = {
  chapter: null,
  verse: null,
  word: null,
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
        chapter: payload.chapter,
        verse: payload.verse,
        word: payload.word,
      };
    },
  },
});

export const selectHighlightedLocation = (state: RootState) => state.highlightedLocation;
export const { setHighlightedLocation } = highlightedLocation.actions;
export default highlightedLocation.reducer;
