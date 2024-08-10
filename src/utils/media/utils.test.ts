/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

import { getChapterData } from '../chapter';
import { isValidVerseFrom, isValidVerseTo } from '../validator';
import { getVerseNumberFromKey } from '../verse';

import { getVerseValue } from './utils';

import { QUERY_PARAMS_DATA } from '@/hooks/useGetQueryParamOrReduxValue';
import ChaptersData from '@/types/ChaptersData';
import QueryParam from '@/types/QueryParam';

vi.mock('../verse.ts', () => ({
  getVerseNumberFromKey: vi.fn(),
}));

vi.mock('../chapter.ts', () => ({
  getChapterData: vi.fn(),
}));

vi.mock('../validator.ts', () => ({
  isValidVerseTo: vi.fn(),
  isValidVerseFrom: vi.fn(),
}));

describe('getVerseValue', () => {
  const mockQuery = {
    [QueryParam.VERSE_FROM]: '2:5',
    [QueryParam.VERSE_TO]: '2:10',
    [QueryParam.SURAH]: '2',
  };

  const mockChapterData = {
    versesCount: 286,
    bismillahPre: true,
    revelationOrder: 87,
    revelationPlace: 'Makkah',
    pages: [1, 2, 3],
    nameComplex: 'Al-Baqarah',
    transliteratedName: 'Al-Baqarah',
    nameArabic: 'البقرة',
    translatedName: 'The Cow',
    defaultSlug: 'al-baqarah',
    slug: 'al-baqarah',
  };

  const mockChaptersData: ChaptersData = {
    2: mockChapterData,
  };

  const mockSurahReduxValue = '2';

  beforeEach(() => {
    vi.clearAllMocks();
    (getVerseNumberFromKey as Mock).mockImplementation((key) => Number(key.split(':')[1]));
    (getChapterData as Mock).mockImplementation((data, surahID) => data[surahID]);
    (isValidVerseTo as Mock).mockImplementation(() => true);
    (isValidVerseFrom as Mock).mockImplementation(() => true);
  });

  it('should return valid verseFromKey when queryParam is VERSE_FROM', () => {
    QUERY_PARAMS_DATA[QueryParam.VERSE_FROM].validate = vi.fn(() => true);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:5');
    expect(QUERY_PARAMS_DATA[QueryParam.VERSE_FROM].validate).toHaveBeenCalledWith(
      '2:5',
      mockChaptersData,
      mockQuery,
    );
  });

  it('should return valid verseToKey when queryParam is VERSE_TO', () => {
    QUERY_PARAMS_DATA[QueryParam.VERSE_TO].validate = vi.fn(() => true);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_TO,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:10');
    expect(QUERY_PARAMS_DATA[QueryParam.VERSE_TO].validate).toHaveBeenCalledWith(
      '2:10',
      mockChaptersData,
      mockQuery,
    );
  });

  it('should return keyOfFirstVerse if verseFromKey is invalid', () => {
    QUERY_PARAMS_DATA[QueryParam.VERSE_FROM].validate = vi.fn(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('1:1');
  });

  it('should return keyOfFirstVerse if verseToKey is invalid', () => {
    QUERY_PARAMS_DATA[QueryParam.VERSE_TO].validate = vi.fn(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_TO,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('1:1');
  });

  it('should return keyOfFirstVerse if verseFromKey is invalid due to invalidVerseFrom', () => {
    (isValidVerseFrom as Mock).mockImplementation(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('1:1');
  });

  it('should return keyOfFirstVerse if verseToKey is invalid due to invalidVerseTo', () => {
    (isValidVerseTo as Mock).mockImplementation(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_TO,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('1:1');
  });

  it('should use surahReduxValue if surahStringValue is invalid', () => {
    QUERY_PARAMS_DATA[QueryParam.SURAH].validate = vi.fn(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      QUERY_PARAMS_DATA,
      mockSurahReduxValue,
    );

    expect(result).toBe('1:1');
  });
});
