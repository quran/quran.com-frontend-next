import { describe, it, expect } from 'vitest';

import { selectIsAudioPlayerVisible, selectIsAudioPlaying } from './selectors';

/**
 * Creates a mock XState state object with common properties.
 * This provides a more complete mock structure that better represents
 * the actual XState state shape.
 *
 * @param {string} value - The state value string
 * @param {Function} matchesFn - Function to determine if state matches a given value
 * @returns {object} A mock state object with XState-like properties
 */
const createMockState = (value: string, matchesFn: (stateValue: string) => boolean) => ({
  value,
  context: {},
  matches: matchesFn,
  hasTag: () => false,
  can: () => false,
  done: false,
  nextEvents: [],
});

describe('Audio Player Selectors', () => {
  describe('selectIsAudioPlayerVisible', () => {
    it('should return true when state matches VISIBLE', () => {
      const mockState = createMockState('VISIBLE', (stateValue) => stateValue === 'VISIBLE');
      expect(selectIsAudioPlayerVisible(mockState)).toBe(true);
    });

    it('should return false when state is HIDDEN', () => {
      const mockState = createMockState('HIDDEN', (stateValue) => stateValue !== 'VISIBLE');
      expect(selectIsAudioPlayerVisible(mockState)).toBe(false);
    });
  });

  describe('selectIsAudioPlaying', () => {
    it('should return true when audio is playing', () => {
      const mockState = createMockState(
        'VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING',
        (stateValue) => stateValue === 'VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING',
      );
      expect(selectIsAudioPlaying(mockState)).toBe(true);
    });

    it('should return false when audio is paused', () => {
      const mockState = createMockState(
        'VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED',
        (stateValue) => stateValue !== 'VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING',
      );
      expect(selectIsAudioPlaying(mockState)).toBe(false);
    });
  });
});
