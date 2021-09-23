import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';
import { getDistanceBetweenVerses } from 'src/utils/verse';

interface LastReadVerse {
  verseKey: string;
  chapterId: string;
  page: string;
  hizb: string;
}

export type ReadingTracker = {
  lastReadVerse: LastReadVerse;
  recentReadingSessions: Record<string, boolean>;
};

const initialState: ReadingTracker = {
  lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
  recentReadingSessions: {},
};

const NEW_SESSION_BOUNDARY = 20;
const MAXIMUM_NUMBER_OF_SESSIONS = 5;

export const readingTrackerSlice = createSlice({
  name: 'readingTracker',
  initialState,
  reducers: {
    setLastReadVerse: (state: ReadingTracker, action: PayloadAction<LastReadVerse>) => {
      let newRecentReadingSessions = { ...state.recentReadingSessions };
      // if the verse key already exists, and he re-visited it again, we need to mark it as the latest session.
      if (newRecentReadingSessions[action.payload.verseKey]) {
        // delete the old entry
        delete newRecentReadingSessions[action.payload.verseKey];
        // insert the same entry again but at the beginning
        newRecentReadingSessions = { [action.payload.verseKey]: true, ...newRecentReadingSessions };
        return {
          ...state,
          lastReadVerse: action.payload,
          recentReadingSessions: newRecentReadingSessions,
        };
      }
      const sessionsVerseKeys = Object.keys(newRecentReadingSessions);
      const sessionsNumber = sessionsVerseKeys.length;
      const [lastReadingSessionVerseKey] = sessionsVerseKeys;
      // if there are some last read sessions already and the new verse key is not far enough to be considered a new session
      if (
        sessionsNumber &&
        getDistanceBetweenVerses(lastReadingSessionVerseKey, action.payload.verseKey) <=
          NEW_SESSION_BOUNDARY
      ) {
        return { ...state, lastReadVerse: action.payload };
      }
      // insert a new entry at the beginning
      newRecentReadingSessions = { [action.payload.verseKey]: true, ...newRecentReadingSessions };
      // if the number of sessions already exceeded the maximum, delete the latest session
      if (sessionsNumber + 1 > MAXIMUM_NUMBER_OF_SESSIONS) {
        delete newRecentReadingSessions[lastReadingSessionVerseKey];
      }
      return {
        ...state,
        lastReadVerse: action.payload,
        recentReadingSessions: newRecentReadingSessions,
      };
    },
  },
});

export const { setLastReadVerse } = readingTrackerSlice.actions;

export const selectLastReadVerseKey = (state: RootState) => state.readingTracker.lastReadVerse;
export const selectRecentReadingSessions = (state: RootState) =>
  state.readingTracker.recentReadingSessions;

export default readingTrackerSlice.reducer;
