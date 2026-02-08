/* eslint-disable max-lines */
import { describe, it, expect } from 'vitest';

import migrations from './migrations';

import { QuranFont, WordByWordType } from '@/types/QuranReader';

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

  // eslint-disable-next-line react-func/max-lines-per-function
  describe('migration 43: font scale remap for mobile size consistency', () => {
    const createState = (quranFont: QuranFont, quranTextFontScale: number) => ({
      quranReaderStyles: {
        quranFont,
        quranTextFontScale,
        translationFontScale: 3,
        wordByWordFontScale: 3,
      },
      otherSlice: {
        someData: 'preserved',
      },
    });

    describe('should remap scale 4 to 6 for Group 1 fonts', () => {
      it.each([
        [QuranFont.QPCHafs, 'QPCHafs'],
        [QuranFont.MadaniV1, 'MadaniV1 (code_v1)'],
        [QuranFont.MadaniV2, 'MadaniV2 (code_v2)'],
        [QuranFont.TajweedV4, 'TajweedV4'],
      ])('%s (%s): scale 4 → 6', (font) => {
        const oldState = createState(font, 4);
        const migratedState = migrations[43](oldState);

        expect(migratedState.quranReaderStyles.quranTextFontScale).toBe(6);
      });
    });

    it('should remap scale 5 to 6 for IndoPak font', () => {
      const oldState = createState(QuranFont.IndoPak, 5);
      const migratedState = migrations[43](oldState);

      expect(migratedState.quranReaderStyles.quranTextFontScale).toBe(6);
    });

    describe('should NOT remap other scale values for affected fonts', () => {
      it.each([1, 2, 3, 5, 6, 7, 8, 9, 10])('QPCHafs at scale %d remains unchanged', (scale) => {
        const oldState = createState(QuranFont.QPCHafs, scale);
        const migratedState = migrations[43](oldState);

        expect(migratedState.quranReaderStyles.quranTextFontScale).toBe(scale);
      });

      it.each([1, 2, 3, 4, 6, 7, 8, 9, 10])('IndoPak at scale %d remains unchanged', (scale) => {
        const oldState = createState(QuranFont.IndoPak, scale);
        const migratedState = migrations[43](oldState);

        expect(migratedState.quranReaderStyles.quranTextFontScale).toBe(scale);
      });
    });

    describe('should NOT remap unaffected fonts', () => {
      it('Uthmani at scale 4 remains unchanged', () => {
        const oldState = createState(QuranFont.Uthmani, 4);
        const migratedState = migrations[43](oldState);

        expect(migratedState.quranReaderStyles.quranTextFontScale).toBe(4);
      });

      it('Uthmani at scale 5 remains unchanged', () => {
        const oldState = createState(QuranFont.Uthmani, 5);
        const migratedState = migrations[43](oldState);

        expect(migratedState.quranReaderStyles.quranTextFontScale).toBe(5);
      });
    });

    it('should preserve other quranReaderStyles properties', () => {
      const oldState = createState(QuranFont.QPCHafs, 4);
      const migratedState = migrations[43](oldState);

      expect(migratedState.quranReaderStyles.translationFontScale).toBe(3);
      expect(migratedState.quranReaderStyles.wordByWordFontScale).toBe(3);
      expect(migratedState.quranReaderStyles.quranFont).toBe(QuranFont.QPCHafs);
    });

    it('should preserve other state slices', () => {
      const oldState = createState(QuranFont.QPCHafs, 4);
      const migratedState = migrations[43](oldState);

      expect(migratedState.otherSlice).toEqual({ someData: 'preserved' });
    });
  });

  it('migration 42: should default showTajweedRules to true and preserve false', () => {
    const m1 = migrations[42]({ quranReaderStyles: { quranFont: 'v2' } });
    expect(m1.quranReaderStyles.showTajweedRules).toBe(true);
    const m2 = migrations[42]({ quranReaderStyles: { showTajweedRules: false } });
    expect(m2.quranReaderStyles.showTajweedRules).toBe(false);
  });
});
