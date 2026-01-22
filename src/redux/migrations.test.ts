import { describe, it, expect } from 'vitest';

import migrations from './migrations';

import { WordByWordType } from '@/types/QuranReader';

// eslint-disable-next-line react-func/max-lines-per-function
describe('Redux migrations', () => {
  // eslint-disable-next-line react-func/max-lines-per-function
  describe('migration 37: wordByWord content type split', () => {
    it('should migrate wordByWordContentType to tooltip and initialize inline as empty', () => {
      const oldState = {
        readingPreferences: {
          wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
          readingPreference: 'reading',
          selectedWordByWordLocale: 'en',
          wordByWordDisplay: ['tooltip'],
          wordClickFunctionality: 'playAudio',
          isUsingDefaultWordByWordLocale: true,
        },
      };

      const migratedState = migrations[37](oldState);

      expect(migratedState.readingPreferences.wordByWordTooltipContentType).toEqual([
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]);
      expect(migratedState.readingPreferences.wordByWordInlineContentType).toEqual([]);
    });

    it('should handle empty wordByWordContentType', () => {
      const oldState = {
        readingPreferences: {
          wordByWordContentType: [],
          readingPreference: 'reading',
          selectedWordByWordLocale: 'en',
          wordByWordDisplay: ['tooltip'],
          wordClickFunctionality: 'playAudio',
          isUsingDefaultWordByWordLocale: true,
        },
      };

      const migratedState = migrations[37](oldState);

      expect(migratedState.readingPreferences.wordByWordTooltipContentType).toEqual([]);
      expect(migratedState.readingPreferences.wordByWordInlineContentType).toEqual([]);
    });

    it('should handle undefined wordByWordContentType', () => {
      const oldState = {
        readingPreferences: {
          wordByWordContentType: undefined,
          readingPreference: 'reading',
          selectedWordByWordLocale: 'en',
          wordByWordDisplay: ['tooltip'],
          wordClickFunctionality: 'playAudio',
          isUsingDefaultWordByWordLocale: true,
        },
      };

      const migratedState = migrations[37](oldState);

      expect(migratedState.readingPreferences.wordByWordTooltipContentType).toEqual([]);
      expect(migratedState.readingPreferences.wordByWordInlineContentType).toEqual([]);
    });

    it('should preserve other reading preferences', () => {
      const oldState = {
        readingPreferences: {
          wordByWordContentType: [WordByWordType.Translation],
          readingPreference: 'reading',
          selectedWordByWordLocale: 'ar',
          wordByWordDisplay: ['tooltip', 'inline'],
          wordClickFunctionality: 'noAudio',
          isUsingDefaultWordByWordLocale: false,
        },
        otherSlice: {
          someData: 'preserved',
        },
      };

      const migratedState = migrations[37](oldState);

      // Check new fields added
      expect(migratedState.readingPreferences.wordByWordTooltipContentType).toEqual([
        WordByWordType.Translation,
      ]);
      expect(migratedState.readingPreferences.wordByWordInlineContentType).toEqual([]);

      // Check other fields preserved
      expect(migratedState.readingPreferences.readingPreference).toBe('reading');
      expect(migratedState.readingPreferences.selectedWordByWordLocale).toBe('ar');
      expect(migratedState.readingPreferences.wordByWordDisplay).toEqual(['tooltip', 'inline']);
      expect(migratedState.readingPreferences.wordClickFunctionality).toBe('noAudio');
      expect(migratedState.readingPreferences.isUsingDefaultWordByWordLocale).toBe(false);

      // Check other slices preserved
      expect(migratedState.otherSlice).toEqual({ someData: 'preserved' });
    });

    it('should only migrate Translation type', () => {
      const oldState = {
        readingPreferences: {
          wordByWordContentType: [WordByWordType.Translation],
          readingPreference: 'reading',
          selectedWordByWordLocale: 'en',
          wordByWordDisplay: ['tooltip'],
          wordClickFunctionality: 'playAudio',
          isUsingDefaultWordByWordLocale: true,
        },
      };

      const migratedState = migrations[37](oldState);

      expect(migratedState.readingPreferences.wordByWordTooltipContentType).toEqual([
        WordByWordType.Translation,
      ]);
      expect(migratedState.readingPreferences.wordByWordInlineContentType).toEqual([]);
    });

    it('should only migrate Transliteration type', () => {
      const oldState = {
        readingPreferences: {
          wordByWordContentType: [WordByWordType.Transliteration],
          readingPreference: 'reading',
          selectedWordByWordLocale: 'en',
          wordByWordDisplay: ['tooltip'],
          wordClickFunctionality: 'playAudio',
          isUsingDefaultWordByWordLocale: true,
        },
      };

      const migratedState = migrations[37](oldState);

      expect(migratedState.readingPreferences.wordByWordTooltipContentType).toEqual([
        WordByWordType.Transliteration,
      ]);
      expect(migratedState.readingPreferences.wordByWordInlineContentType).toEqual([]);
    });
  });
});
