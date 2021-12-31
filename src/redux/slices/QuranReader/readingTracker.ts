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
const MAXIMUM_NUMBER_OF_SESSIONS = 10;

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
        return generateNewState(state, action.payload, newRecentReadingSessions);
      }
      const sessionsVerseKeys = Object.keys(newRecentReadingSessions);
      const numberOfSessions = sessionsVerseKeys.length;
      const [lastReadingSessionVerseKey] = sessionsVerseKeys;
      // if there are some last read sessions already and the new verse key is not far enough to be considered a new session
      if (
        numberOfSessions &&
        getDistanceBetweenVerses(lastReadingSessionVerseKey, action.payload.verseKey) <=
          NEW_SESSION_BOUNDARY
      ) {
        delete newRecentReadingSessions[lastReadingSessionVerseKey];
        newRecentReadingSessions = { [action.payload.verseKey]: true, ...newRecentReadingSessions };
        return generateNewState(state, action.payload, newRecentReadingSessions);
      }
      const earliestSession = sessionsVerseKeys[numberOfSessions - 1];
      // insert a new entry at the beginning
      newRecentReadingSessions = { [action.payload.verseKey]: true, ...newRecentReadingSessions };
      // if the number of sessions already exceeded the maximum, delete the latest session
      if (numberOfSessions + 1 > MAXIMUM_NUMBER_OF_SESSIONS) {
        delete newRecentReadingSessions[earliestSession];
      }
      return generateNewState(state, action.payload, newRecentReadingSessions);
    },
  },
});

/**
 * Generate the new state.
 *
 * @param {ReadingTracker} state
 * @param {LastReadVerse} lastReadVerse
 * @param {Record<string, boolean>} newRecentReadingSessions
 * @returns  {ReadingTracker}
 */
const generateNewState = (
  state: ReadingTracker,
  lastReadVerse: LastReadVerse,
  newRecentReadingSessions: Record<string, boolean>,
): ReadingTracker => {
  return {
    ...state,
    lastReadVerse,
    recentReadingSessions: newRecentReadingSessions,
  };
};

export const { setLastReadVerse } = readingTrackerSlice.actions;

export const selectLastReadVerse = (state: RootState) => state.readingTracker.lastReadVerse;
export const selectLastReadVerseKey = (state: RootState) =>
  state.readingTracker.lastReadVerse.verseKey;
export const selectLastReadHizb = (state: RootState) => state.readingTracker.lastReadVerse.hizb;
export const selectedLastReadPage = (state: RootState) => state.readingTracker.lastReadVerse.page;

export const selectRecentReadingSessions = (state: RootState) =>
  state.readingTracker.recentReadingSessions;

export default readingTrackerSlice.reducer;
