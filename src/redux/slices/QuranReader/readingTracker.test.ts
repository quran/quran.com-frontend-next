import { describe, it, expect } from 'vitest';

import readingTrackerReducer, { clearReadingTracker, ReadingTracker } from './readingTracker';

describe('readingTracker slice', () => {
  const initialState: ReadingTracker = {
    lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
    recentReadingSessions: {},
  };

  describe('clearReadingTracker', () => {
    it('should reset reading tracker to initial state when data exists', () => {
      const stateWithData: ReadingTracker = {
        lastReadVerse: { verseKey: '2:255', chapterId: '2', page: '42', hizb: '3' },
        recentReadingSessions: {
          '1:1': 1234567890,
          '2:255': 1234567891,
          '36:1': 1234567892,
        },
      };

      const result = readingTrackerReducer(stateWithData, clearReadingTracker());

      expect(result).toEqual(initialState);
      expect(result.lastReadVerse.verseKey).toBeNull();
      expect(result.recentReadingSessions).toEqual({});
    });

    it('should return initial state when already empty', () => {
      const result = readingTrackerReducer(initialState, clearReadingTracker());

      expect(result).toEqual(initialState);
    });

    it('should clear all reading sessions', () => {
      const stateWithSessions: ReadingTracker = {
        lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
        recentReadingSessions: {
          '1:1': 1000,
          '2:1': 2000,
          '3:1': 3000,
        },
      };

      const result = readingTrackerReducer(stateWithSessions, clearReadingTracker());

      expect(Object.keys(result.recentReadingSessions)).toHaveLength(0);
    });
  });
});
