/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, vi } from 'vitest';

import buildReferredVerseText from './buildReferredVerseText';

import { toLocalizedNumber } from '@/utils/locale';
import { makeVerseKey } from '@/utils/verse';
import { ReflectionVerseReference } from 'types/QuranReflect/ReflectionVerseReference';

// Mock the utility functions
vi.mock('@/utils/locale', () => ({
  toLocalizedNumber: vi.fn((value: number) => String(value)),
  isRTLLocale: vi.fn((lang: string) => ['ar', 'ur', 'fa'].includes(lang)),
}));

vi.mock('@/utils/verse', () => ({
  makeVerseKey: vi.fn((chapter: number | string, from: number | string, to?: number | string) => {
    if (to && from !== to) {
      return `${chapter}:${from}-${to}`;
    }
    return `${chapter}:${from}`;
  }),
}));

const mockTranslations: Record<string, string> = {
  'common:surah': 'Surah',
  'common:ayah': 'Ayah',
  'common:and': 'and',
};

const mockTranslate = (key: string): string => mockTranslations[key] || key;

describe('referredVerseText', () => {
  const lang = 'en';

  describe('Chapter-only references', () => {
    it('should handle a single chapter reference', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: null, to: null }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1');
      expect(toLocalizedNumber).toHaveBeenCalledWith(1, lang);
    });

    it('should handle multiple chapter references', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: null, to: null },
        { chapter: 3, from: null, to: null },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1,2,3');
      expect(toLocalizedNumber).toHaveBeenCalledWith(1, lang);
      expect(toLocalizedNumber).toHaveBeenCalledWith(2, lang);
      expect(toLocalizedNumber).toHaveBeenCalledWith(3, lang);
    });

    it('should handle chapters with undefined from/to values', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 5, from: undefined, to: undefined },
        { chapter: 10, from: undefined, to: undefined },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 5,10');
    });
  });

  describe('Verse-only references', () => {
    it('should handle a single verse reference', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 2, from: 255, to: 255 }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 2:255');
      expect(makeVerseKey).toHaveBeenCalledWith('2', '255', '255');
    });

    it('should handle a verse range reference', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: 1, to: 7 }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 1:1-7');
      expect(makeVerseKey).toHaveBeenCalledWith('1', '1', '7');
    });

    it('should handle multiple verse references', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 2, from: 255, to: 255 },
        { chapter: 3, from: 190, to: 200 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 2:255,3:190-200');
      expect(makeVerseKey).toHaveBeenCalledWith('2', '255', '255');
      expect(makeVerseKey).toHaveBeenCalledWith('3', '190', '200');
    });

    it('should handle multiple consecutive verses', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: 1, to: 1 },
        { chapter: 1, from: 2, to: 2 },
        { chapter: 1, from: 3, to: 3 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 1:1,1:2,1:3');
    });
  });

  describe('Mixed chapter and verse references', () => {
    it('should handle both chapter and verse references together', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: 255, to: 255 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1 and Ayah 2:255');
    });

    it('should handle multiple chapters and multiple verses', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: null, to: null },
        { chapter: 3, from: 1, to: 10 },
        { chapter: 4, from: 100, to: 100 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1,2 and Ayah 3:1-10,4:100');
    });

    it('should handle mixed references with multiple ranges', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 112, from: null, to: null },
        { chapter: 113, from: null, to: null },
        { chapter: 114, from: null, to: null },
        { chapter: 2, from: 1, to: 5 },
        { chapter: 2, from: 255, to: 255 },
        { chapter: 3, from: 190, to: 200 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 112,113,114 and Ayah 2:1-5,2:255,3:190-200');
    });
  });

  describe('Edge cases', () => {
    it('should return empty string for empty verse references', () => {
      const verseReferences: ReflectionVerseReference[] = [];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('');
    });

    it('should handle verse references with from but no to', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: 1, to: null }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1');
    });

    it('should handle verse references with to but no from', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: null, to: 7 }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1');
    });

    it('should handle large chapter numbers', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 114, from: null, to: null }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 114');
      expect(toLocalizedNumber).toHaveBeenCalledWith(114, lang);
    });

    it('should handle large verse numbers', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 2, from: 286, to: 286 }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 2:286');
    });
  });

  describe('Localization', () => {
    it('should call toLocalizedNumber for all chapter and verse numbers', () => {
      vi.clearAllMocks();

      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: 10, to: 20 },
      ];

      buildReferredVerseText(verseReferences, 'ar', mockTranslate);

      // Should be called for chapter 1 (chapter-only reference)
      expect(toLocalizedNumber).toHaveBeenCalledWith(1, 'ar');

      // Should be called for chapter 2, from 10, and to 20 (verse reference)
      expect(toLocalizedNumber).toHaveBeenCalledWith(2, 'ar');
      expect(toLocalizedNumber).toHaveBeenCalledWith(10, 'ar');
      expect(toLocalizedNumber).toHaveBeenCalledWith(20, 'ar');
    });

    it('should use correct translation keys', () => {
      const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'common:surah': 'سورة',
          'common:ayah': 'آية',
          'common:and': 'و',
        };
        return translations[key] || key;
      });

      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: 255, to: 255 },
      ];

      const result = buildReferredVerseText(verseReferences, 'ar', mockT);

      // For RTL (Arabic), format should be verse:chapter, so 255:2 not 2:255
      expect(result).toBe('سورة 1 و آية 255:2');
      expect(mockT).toHaveBeenCalledWith('common:surah');
      expect(mockT).toHaveBeenCalledWith('common:ayah');
      expect(mockT).toHaveBeenCalledWith('common:and');
    });
  });

  describe('Ordering', () => {
    it('should maintain the order of verse references as provided', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 3, from: 1, to: 10 },
        { chapter: 1, from: 1, to: 7 },
        { chapter: 2, from: 255, to: 255 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 3:1-10,1:1-7,2:255');
    });

    it('should maintain chapter order as provided', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 114, from: null, to: null },
        { chapter: 1, from: null, to: null },
        { chapter: 50, from: null, to: null },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 114,1,50');
    });
  });

  describe('makeVerseKey behavior', () => {
    it('should handle single verse (from equals to)', () => {
      vi.clearAllMocks();

      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: 5, to: 5 }];

      buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(makeVerseKey).toHaveBeenCalledWith('1', '5', '5');
    });

    it('should handle verse range (from not equals to)', () => {
      vi.clearAllMocks();

      const verseReferences: ReflectionVerseReference[] = [{ chapter: 2, from: 1, to: 10 }];

      buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(makeVerseKey).toHaveBeenCalledWith('2', '1', '10');
    });
  });

  describe('Complex real-world scenarios', () => {
    it('should handle a reflection referencing an entire chapter and specific verses from other chapters', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 112, from: null, to: null }, // Full chapter
        { chapter: 2, from: 255, to: 255 }, // Ayat al-Kursi
        { chapter: 18, from: 1, to: 10 }, // Beginning of Al-Kahf
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 112 and Ayah 2:255,18:1-10');
    });

    it('should handle all Muawwidhatayn (protective surahs)', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 112, from: null, to: null },
        { chapter: 113, from: null, to: null },
        { chapter: 114, from: null, to: null },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 112,113,114');
    });

    it('should handle verses from the same chapter with different ranges', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 2, from: 1, to: 5 },
        { chapter: 2, from: 255, to: 255 },
        { chapter: 2, from: 284, to: 286 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 2:1-5,2:255,2:284-286');
    });
  });

  describe('Different language locales', () => {
    it('should work with Arabic locale using localized numbers', () => {
      // Mock toLocalizedNumber to return Arabic numerals
      vi.mocked(toLocalizedNumber).mockImplementation((value: number, locale: string) => {
        if (locale === 'ar') {
          // Arabic-Indic numerals mapping
          const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
          return String(value)
            .split('')
            .map((digit) => arabicNumerals[Number.parseInt(digit, 10)] || digit)
            .join('');
        }
        return String(value);
      });

      const mockArabicT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'common:surah': 'سورة',
          'common:ayah': 'آية',
          'common:and': 'و',
        };
        return translations[key] || key;
      });

      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: 255, to: 255 },
      ];

      const result = buildReferredVerseText(verseReferences, 'ar', mockArabicT);

      expect(result).toContain('سورة');
      expect(result).toContain('آية');
      expect(result).toContain('و');
      // For RTL (Arabic), the format should be verse:chapter (٢٥٥:٢ not ٢:٢٥٥)
      expect(result).toContain('٢٥٥:٢');

      // Reset mock
      vi.mocked(toLocalizedNumber).mockImplementation((value: number) => String(value));
    });

    it('should use Arabic comma for RTL locales', () => {
      const mockArabicT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'common:surah': 'سورة',
          'common:ayah': 'آية',
          'common:and': 'و',
        };
        return translations[key] || key;
      });

      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 2, from: 255, to: 255 },
        { chapter: 3, from: 1, to: 5 },
      ];

      const result = buildReferredVerseText(verseReferences, 'ar', mockArabicT);

      // Arabic comma is "، " (with space)
      expect(result).toContain('، ');
      // Should use verse:chapter format for RTL
      expect(result).toBe('آية 255:2، 1:3-5');
    });

    it('should work with Urdu locale', () => {
      const mockUrduT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'common:surah': 'سورہ',
          'common:ayah': 'آیت',
          'common:and': 'اور',
        };
        return translations[key] || key;
      });

      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: 1, to: 7 }];

      const result = buildReferredVerseText(verseReferences, 'ur', mockUrduT);

      expect(result).toContain('آیت');
      expect(mockUrduT).toHaveBeenCalledWith('common:ayah');
    });

    it('should work with French locale', () => {
      const mockFrenchT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'common:surah': 'Sourate',
          'common:ayah': 'Verset',
          'common:and': 'et',
        };
        return translations[key] || key;
      });

      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: 1, to: 5 },
      ];

      const result = buildReferredVerseText(verseReferences, 'fr', mockFrenchT);

      expect(result).toBe('Sourate 1 et Verset 2:1-5');
    });
  });

  describe('Additional edge cases', () => {
    it('should handle single chapter without any verses', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 36, from: null, to: null }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 36');
    });

    it('should handle only verses without any chapter references', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: 1, to: 1 },
        { chapter: 2, from: 2, to: 2 },
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 1:1,2:2');
    });

    it('should handle verse reference where from equals to (no range)', () => {
      const verseReferences: ReflectionVerseReference[] = [{ chapter: 1, from: 1, to: 1 }];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Ayah 1:1');
    });

    it('should handle multiple chapters from different parts of the Quran', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null }, // Al-Fatiha
        { chapter: 36, from: null, to: null }, // Ya-Sin
        { chapter: 67, from: null, to: null }, // Al-Mulk
        { chapter: 112, from: null, to: null }, // Al-Ikhlas
      ];

      const result = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result).toBe('Surah 1,36,67,112');
    });

    it('should maintain stability with repeated calls', () => {
      const verseReferences: ReflectionVerseReference[] = [
        { chapter: 1, from: null, to: null },
        { chapter: 2, from: 255, to: 255 },
      ];

      const result1 = buildReferredVerseText(verseReferences, lang, mockTranslate);
      const result2 = buildReferredVerseText(verseReferences, lang, mockTranslate);
      const result3 = buildReferredVerseText(verseReferences, lang, mockTranslate);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('Surah 1 and Ayah 2:255');
    });
  });
});
