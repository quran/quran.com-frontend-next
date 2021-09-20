import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';
import { sortVersesObjectByVerseKeys } from 'src/utils/verse';

export type ReadingContext = {
  visibleVerseKeys: Record<string, boolean>;
  currentlyReadingVerseKey: string;
};

const initialState: ReadingContext = { visibleVerseKeys: {}, currentlyReadingVerseKey: null };

export const readingContextSlice = createSlice({
  name: 'readingContext',
  initialState,
  reducers: {
    updateVerseVisibility: (
      state: ReadingContext,
      action: PayloadAction<{
        verseKey: string;
        isVisible: boolean;
      }>,
    ) => {
      const { verseKey, isVisible } = action.payload;
      let newVerseKeys = { ...state.visibleVerseKeys };
      // if a verse is reported as being visible in the viewport and it's the first time
      if (isVisible && !newVerseKeys[verseKey]) {
        // sort the verses by the order they appear in the Mushaf so we can easily access the first.
        newVerseKeys = sortVersesObjectByVerseKeys({ ...newVerseKeys, [verseKey]: true });
        return {
          ...state,
          visibleVerseKeys: newVerseKeys,
          currentlyReadingVerseKey: Object.keys(newVerseKeys)[0],
        };
      }
      // if a verse that was visible just got out of the viewport
      if (!isVisible && newVerseKeys[verseKey] === true) {
        delete newVerseKeys[verseKey];
        return {
          ...state,
          visibleVerseKeys: newVerseKeys,
          currentlyReadingVerseKey: Object.keys(newVerseKeys)[0],
        };
      }
      return {
        ...state,
      };
    },
  },
});

export const { updateVerseVisibility } = readingContextSlice.actions;

export const selectCurrentlyReadingVerseKey = (state: RootState) =>
  state.readingContext.currentlyReadingVerseKey;

export default readingContextSlice.reducer;
