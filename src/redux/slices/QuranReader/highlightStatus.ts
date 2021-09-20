import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';

export type HighlightStatusState = {
  chapter: number | null;
  verse: number | null;
  word: number | null;
};

export const initialState: HighlightStatusState = {
  chapter: null,
  verse: null,
  word: null,
};

const highlightStatus = createSlice({
  name: 'highlightStatus',
  initialState,
  reducers: {
    setHighlightStatus: (state, { payload }: PayloadAction<HighlightStatusState>) => {
      return {
        chapter: payload.chapter,
        verse: payload.verse,
        word: payload.word,
      };
    },
  },
});

export const selectHighlightStatus = (state: RootState) => state.highlightStatus;
export const { setHighlightStatus } = highlightStatus.actions;
export default highlightStatus.reducer;
