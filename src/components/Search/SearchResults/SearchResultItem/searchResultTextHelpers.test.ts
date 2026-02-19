/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, vi } from 'vitest';

import {
  buildResultRowText,
  determineLayoutProps,
  getSurahDisplayText,
  getVerseTextData,
  shouldIncludeTranslatedName,
} from '@/components/Search/SearchResults/SearchResultItem/searchResultTextHelpers';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';
import { Direction } from '@/utils/locale';

// Mocks
vi.mock('@/utils/locale', () => ({
  toLocalizedNumber: vi.fn((num) => `${num}`),
  toLocalizedVerseKey: vi.fn((key) => `KEY:${key}`),
  isRTLLocale: vi.fn((lang) => lang === 'ar'),
  Direction: {
    LTR: 'ltr',
    RTL: 'rtl',
  },
}));

vi.mock('@/utils/chapter', () => ({
  getChapterData: vi.fn((data, id) => {
    if (id === '1') {
      return {
        transliteratedName: 'Al-Fatihah',
        translatedName: 'The Opener',
        nameArabic: 'الفاتحة',
      };
    }
    return undefined;
  }),
}));

vi.mock('@/utils/search', () => ({
  getResultType: vi.fn((result) => result.resultType),
  getResultSuffix: vi.fn(() => 'Suffix'),
}));

describe('searchResultTextHelpers', () => {
  describe('shouldIncludeTranslatedName', () => {
    it('returns true when names are different', () => {
      expect(shouldIncludeTranslatedName('Surah', 'Chapter')).toBe(true);
    });

    it('returns false when names are same (case insensitive)', () => {
      expect(shouldIncludeTranslatedName('Surah', 'surah')).toBe(false);
    });

    it('returns false when translated name is missing', () => {
      expect(shouldIncludeTranslatedName('Surah', undefined)).toBe(false);
    });
  });

  describe('getSurahDisplayText', () => {
    it('returns formatted string for Surah result', () => {
      const result = { resultType: SearchNavigationType.SURAH, name: 'Al-Fatihah' } as any;
      const text = getSurahDisplayText(result, '1', 'Al-Fatihah', {}, 'en');
      // expect "1. Al-Fatihah (The Opener)"
      expect(text).toBe('1. Al-Fatihah (The Opener)');
    });

    it('returns undefined for non-Surah result', () => {
      const result = { resultType: SearchNavigationType.AYAH } as any;
      expect(getSurahDisplayText(result, '1', 'Base', {}, 'en')).toBeUndefined();
    });
  });

  describe('getVerseTextData', () => {
    it('returns empty data for non-Ayah result', () => {
      const result = { resultType: SearchNavigationType.SURAH } as any;
      const data = getVerseTextData(result, '1:1', '1', {}, {}, 'en');
      expect(data.isAyahResult).toBe(false);
      expect(data.arabicSuffixParts).toEqual([]);
    });

    it('returns data for Ayah result', () => {
      const result = { resultType: SearchNavigationType.AYAH } as any;
      const data = getVerseTextData(result, '1:1', '1', {}, {}, 'en');
      expect(data.isAyahResult).toBe(true);
      expect(data.arabicSuffixParts).toContain('الفاتحة');
      expect(data.translationSuffixParts).toContain('Al-Fatihah');
    });
  });

  describe('buildResultRowText', () => {
    it('builds text for Ayah result', () => {
      const result = { resultType: SearchNavigationType.AYAH, name: 'Ayah Text' } as any;
      const t = (k: string) => k;
      const { arabicLine, translationLine } = buildResultRowText(
        result,
        'Ayah Text',
        undefined,
        'Arabic Text',
        true,
        ['Suf1'],
        ['Suf2'],
        t,
      );
      expect(arabicLine).toBe('Arabic Text (Suf1)');
      expect(translationLine).toBe('Ayah Text (Suf2)');
    });
  });

  describe('determineLayoutProps', () => {
    it('returns RTL/LTR mixture for Arabic locale', () => {
      const props = determineLayoutProps(false, false, false, false, 'ar');
      // Original logic forces LTR for translation column in Arabic UI
      expect(props.translationDir).toBe(Direction.LTR);
      expect(props.singleLineDirection).toBe(Direction.RTL);
      expect(props.singleLineLanguage).toBe('ar');
    });

    it('returns LTR for English locale', () => {
      const props = determineLayoutProps(false, false, false, false, 'en');
      expect(props.translationDir).toBe(Direction.LTR);
      expect(props.singleLineDirection).toBe(Direction.LTR);
      expect(props.singleLineLanguage).toBe('en');
    });

    it('returns RTL single line for Arabic content', () => {
      const props = determineLayoutProps(false, false, false, true, 'en');
      expect(props.singleLineDirection).toBe(Direction.RTL);

      // Explicitly check for 'ar' string if enum is causing issues or just 'ar'
      expect(props.singleLineLanguage).toBe('ar');
    });
  });
});
