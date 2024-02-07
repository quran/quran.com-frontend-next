/* eslint-disable react-func/max-lines-per-function */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { getDistanceBetweenVerses, getVerseNumberFromKey } from '@/utils/verse';
import ChaptersData from 'types/ChaptersData';

interface LastReadVerse {
  verseKey: string;
  chapterId: string;
  page: string;
  hizb: string;
}

export interface SurahReadingLog {
  chapterId: string;
  lastRead: string;
  timestamp: number;
}

export type RecentReadingSessions = Record<string, number>;
export type SurahLogs = Record<string, SurahReadingLog>;

export type ReadingTracker = {
  lastReadVerse: LastReadVerse;
  recentReadingSessions: RecentReadingSessions;
  surahLogs: SurahLogs;
  customSelection: SurahLogs;
};

const initialState: ReadingTracker = {
  lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
  recentReadingSessions: {},
  surahLogs: {},
  customSelection: undefined,
};

const NEW_SESSION_BOUNDARY = 20;
const MAXIMUM_NUMBER_OF_SESSIONS = 10;

export const readingTrackerSlice = createSlice({
  name: SliceName.READING_TRACKER,
  initialState,
  reducers: {
    setLastReadVerse: (
      state: ReadingTracker,
      action: PayloadAction<{
        lastReadVerse: LastReadVerse;
        chaptersData: ChaptersData;
      }>,
    ) => {
      const { lastReadVerse, chaptersData } = action.payload;
      const { verseKey, chapterId } = lastReadVerse;
      const surahLogs = { ...state.surahLogs };
      let newRecentReadingSessions = { ...state.recentReadingSessions };
      const curTime = +new Date();

      // Create a new surah reading log, making sure that the current verse is further than the last
      const verseNumber = getVerseNumberFromKey(verseKey);
      const { lastRead: prevVerse = '0' } = surahLogs[chapterId] || {};
      if (verseNumber > parseInt(prevVerse, 10)) {
        surahLogs[chapterId] = { chapterId, lastRead: verseNumber.toString(), timestamp: curTime };
      }

      // if the verse key already exists, and he re-visited it again, we need to mark it as the latest session.
      if (newRecentReadingSessions[lastReadVerse.verseKey]) {
        // delete the old entry
        delete newRecentReadingSessions[lastReadVerse.verseKey];
        // insert the same entry again but at the beginning
        newRecentReadingSessions = {
          [lastReadVerse.verseKey]: curTime,
          ...newRecentReadingSessions,
        };
        return generateNewState(state, lastReadVerse, newRecentReadingSessions, surahLogs);
      }
      const sessionsVerseKeys = Object.keys(newRecentReadingSessions);
      const numberOfSessions = sessionsVerseKeys.length;
      const [lastReadingSessionVerseKey] = sessionsVerseKeys;
      // if there are some last read sessions already and the new verse key is not far enough to be considered a new session
      if (
        numberOfSessions &&
        getDistanceBetweenVerses(
          chaptersData,
          lastReadingSessionVerseKey,
          lastReadVerse.verseKey,
        ) <= NEW_SESSION_BOUNDARY
      ) {
        delete newRecentReadingSessions[lastReadingSessionVerseKey];
        newRecentReadingSessions = {
          [lastReadVerse.verseKey]: curTime,
          ...newRecentReadingSessions,
        };
        return generateNewState(state, lastReadVerse, newRecentReadingSessions, surahLogs);
      }
      const earliestSession = sessionsVerseKeys[numberOfSessions - 1];
      // insert a new entry at the beginning
      newRecentReadingSessions = {
        [lastReadVerse.verseKey]: curTime,
        ...newRecentReadingSessions,
      };
      // if the number of sessions already exceeded the maximum, delete the latest session
      if (numberOfSessions + 1 > MAXIMUM_NUMBER_OF_SESSIONS) {
        delete newRecentReadingSessions[earliestSession];
      }
      return generateNewState(state, lastReadVerse, newRecentReadingSessions, surahLogs);
    },
    setCustomSelection: (state: ReadingTracker, action: PayloadAction<SurahLogs>) => {
      const { payload } = action;
      return {
        ...state,
        customSelection: payload,
      };
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
  newRecentReadingSessions: Record<string, number>,
  surahLogs: SurahLogs,
): ReadingTracker => {
  return {
    ...state,
    lastReadVerse,
    recentReadingSessions: newRecentReadingSessions,
    surahLogs,
  };
};

export const { setLastReadVerse, setCustomSelection } = readingTrackerSlice.actions;

export const selectLastReadVerseKey = (state: RootState) => state.readingTracker.lastReadVerse;
export const selectRecentReadingSessions = (state: RootState) =>
  state.readingTracker.recentReadingSessions;
export const selectSurahLogs = (state: RootState) => state.readingTracker.surahLogs;
export const selectCustomSelection = (state: RootState) => state.readingTracker.customSelection;
export const selectedLastReadPage = (state: RootState) => state.readingTracker.lastReadVerse.page;
export const selectIsVerseKeySelected = (verseKey: string) => (state: RootState) => {
  const lastReadVerseKey = selectLastReadVerseKey(state);
  return verseKey === lastReadVerseKey.verseKey;
};

export default readingTrackerSlice.reducer;
