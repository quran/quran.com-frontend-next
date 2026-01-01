import { describe, it, expect } from 'vitest';

import { selectIsAudioPlayerVisible, selectIsAudioPlaying } from './selectors';

describe('Audio Player Selectors', () => {
  describe('selectIsAudioPlayerVisible', () => {
    it('should return true when state matches VISIBLE', () => {
      const mockState = {
        matches: (stateValue: string) => stateValue === 'VISIBLE',
      };
      expect(selectIsAudioPlayerVisible(mockState)).toBe(true);
    });

    it('should return false when state is HIDDEN', () => {
      const mockState = {
        matches: (stateValue: string) => stateValue !== 'VISIBLE',
      };
      expect(selectIsAudioPlayerVisible(mockState)).toBe(false);
    });
  });

  describe('selectIsAudioPlaying', () => {
    it('should return true when audio is playing', () => {
      const mockState = {
        matches: (stateValue: string) => stateValue === 'VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING',
      };
      expect(selectIsAudioPlaying(mockState)).toBe(true);
    });

    it('should return false when audio is paused', () => {
      const mockState = {
        matches: (stateValue: string) => stateValue !== 'VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING',
      };
      expect(selectIsAudioPlaying(mockState)).toBe(false);
    });
  });
});
