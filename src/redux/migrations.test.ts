/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import migrations from './migrations';

import { QuranFont, WordByWordType } from '@/types/QuranReader';

describe('Redux migrations', () => {
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

  it('migration 42: should default showTajweedRules to true and preserve false', () => {
    const m1 = migrations[42]({ quranReaderStyles: { quranFont: 'v2' } });
    expect(m1.quranReaderStyles.showTajweedRules).toBe(true);
    const m2 = migrations[42]({ quranReaderStyles: { showTajweedRules: false } });
    expect(m2.quranReaderStyles.showTajweedRules).toBe(false);
  });

  describe('migration 47: font scale remap', () => {
    it.each([
      [QuranFont.QPCHafs, 6, 7],
      [QuranFont.MadaniV1, 7, 9],
      [QuranFont.MadaniV2, 8, 10],
      [QuranFont.TajweedV4, 9, 10],
      [QuranFont.IndoPak, 6, 7],
    ])('remaps Quran font %s from scale %d to %d', (font, oldScale, newScale) => {
      const state = {
        quranReaderStyles: { quranFont: font, quranTextFontScale: oldScale },
      };
      const result = migrations[47](state);
      expect(result.quranReaderStyles.quranTextFontScale).toBe(newScale);
    });

    it('remaps QPCHafs from legacy scale 4 to 7', () => {
      const state = {
        quranReaderStyles: { quranFont: QuranFont.QPCHafs, quranTextFontScale: 4 },
      };
      const result = migrations[47](state);
      expect(result.quranReaderStyles.quranTextFontScale).toBe(7);
    });

    it('remaps IndoPak from legacy scale 5 to 7', () => {
      const state = {
        quranReaderStyles: { quranFont: QuranFont.IndoPak, quranTextFontScale: 5 },
      };
      const result = migrations[47](state);
      expect(result.quranReaderStyles.quranTextFontScale).toBe(7);
    });

    it('does not remap QPCHafs at scale 3', () => {
      const state = {
        quranReaderStyles: { quranFont: QuranFont.QPCHafs, quranTextFontScale: 3 },
      };
      const result = migrations[47](state);
      expect(result.quranReaderStyles.quranTextFontScale).toBe(3);
    });

    it('does not remap Uthmani at scale 6', () => {
      const state = {
        quranReaderStyles: { quranFont: QuranFont.Uthmani, quranTextFontScale: 6 },
      };
      const result = migrations[47](state);
      expect(result.quranReaderStyles.quranTextFontScale).toBe(6);
    });

    it('preserves other quranReaderStyles properties', () => {
      const state = {
        quranReaderStyles: {
          quranFont: QuranFont.QPCHafs,
          quranTextFontScale: 6,
          translationFontScale: 3,
        },
        otherSlice: { data: 'kept' },
      };
      const result = migrations[47](state);
      expect(result.quranReaderStyles.translationFontScale).toBe(3);
      expect(result.otherSlice).toEqual({ data: 'kept' });
    });
  });
});
