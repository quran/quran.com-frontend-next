import { describe, it, expect } from 'vitest';

import pinnedVersesReducer, {
  pinVerse,
  pinVerses,
  unpinVerse,
  clearPinnedVerses,
  setServerIds,
  setPinnedVerses,
  initialState,
  PinnedVerse,
} from './pinnedVerses';

// eslint-disable-next-line react-func/max-lines-per-function
describe('pinnedVerses slice', () => {
  describe('pinVerse', () => {
    it('should add a verse to the pinned list', () => {
      const result = pinnedVersesReducer(initialState, pinVerse('1:1'));
      expect(result.verses).toHaveLength(1);
      expect(result.verses[0].verseKey).toBe('1:1');
      expect(result.verses[0].chapterNumber).toBe(1);
      expect(result.verses[0].verseNumber).toBe(1);
    });

    it('should not add a duplicate verse', () => {
      const stateWithVerse = pinnedVersesReducer(initialState, pinVerse('1:1'));
      const result = pinnedVersesReducer(stateWithVerse, pinVerse('1:1'));
      expect(result.verses).toHaveLength(1);
    });

    it('should add multiple different verses', () => {
      let state = pinnedVersesReducer(initialState, pinVerse('1:1'));
      state = pinnedVersesReducer(state, pinVerse('2:255'));
      expect(state.verses).toHaveLength(2);
      expect(state.verses[0].verseKey).toBe('1:1');
      expect(state.verses[1].verseKey).toBe('2:255');
    });
  });

  describe('pinVerses', () => {
    it('should add multiple verses at once', () => {
      const result = pinnedVersesReducer(initialState, pinVerses(['1:1', '2:255', '3:18']));
      expect(result.verses).toHaveLength(3);
    });

    it('should skip already-pinned verses', () => {
      const stateWithVerse = pinnedVersesReducer(initialState, pinVerse('1:1'));
      const result = pinnedVersesReducer(stateWithVerse, pinVerses(['1:1', '2:255']));
      expect(result.verses).toHaveLength(2);
    });

    it('should maintain order via incrementing timestamps', () => {
      const result = pinnedVersesReducer(initialState, pinVerses(['1:1', '2:255']));
      expect(result.verses[0].timestamp).toBeLessThan(result.verses[1].timestamp);
    });
  });

  describe('unpinVerse', () => {
    it('should remove a pinned verse', () => {
      const stateWithVerse = pinnedVersesReducer(initialState, pinVerse('1:1'));
      const result = pinnedVersesReducer(stateWithVerse, unpinVerse('1:1'));
      expect(result.verses).toHaveLength(0);
    });

    it('should not modify state when unpinning a non-existent verse', () => {
      const result = pinnedVersesReducer(initialState, unpinVerse('99:99'));
      expect(result.verses).toHaveLength(0);
    });
  });

  describe('clearPinnedVerses', () => {
    it('should clear all pinned verses', () => {
      let state = pinnedVersesReducer(initialState, pinVerse('1:1'));
      state = pinnedVersesReducer(state, pinVerse('2:255'));
      const result = pinnedVersesReducer(state, clearPinnedVerses());
      expect(result).toEqual(initialState);
    });
  });

  describe('setServerIds', () => {
    it('should set server IDs on matching verses', () => {
      const stateWithVerses = pinnedVersesReducer(initialState, pinVerses(['1:1', '2:255']));
      const result = pinnedVersesReducer(
        stateWithVerses,
        setServerIds({ '1:1': 'server-id-1', '2:255': 'server-id-2' }),
      );
      expect(result.verses[0].serverId).toBe('server-id-1');
      expect(result.verses[1].serverId).toBe('server-id-2');
    });

    it('should not modify verses without matching keys', () => {
      const stateWithVerse = pinnedVersesReducer(initialState, pinVerse('1:1'));
      const result = pinnedVersesReducer(stateWithVerse, setServerIds({ '99:99': 'some-id' }));
      expect(result.verses[0].serverId).toBeUndefined();
    });
  });

  describe('setPinnedVerses', () => {
    it('should replace all verses with the provided list', () => {
      const stateWithVerse = pinnedVersesReducer(initialState, pinVerse('1:1'));
      const newVerses: PinnedVerse[] = [
        { verseKey: '5:1', chapterNumber: 5, verseNumber: 1, timestamp: 100 },
        { verseKey: '5:2', chapterNumber: 5, verseNumber: 2, timestamp: 200 },
      ];
      const result = pinnedVersesReducer(stateWithVerse, setPinnedVerses(newVerses));
      expect(result.verses).toHaveLength(2);
      expect(result.verses[0].verseKey).toBe('5:1');
      expect(result.verses[1].verseKey).toBe('5:2');
    });
  });
});
