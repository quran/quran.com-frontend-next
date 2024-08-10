/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, vi, Mock } from 'vitest';

import { getAllChaptersData } from '../chapter';
import { isValidVerseFrom, isValidVerseTo } from '../validator';

import { getVerseValue } from './utils';

import { getQueryParamsData } from '@/hooks/useGetQueryParamOrReduxValue';
import QueryParam from '@/types/QueryParam';

const mockQuery = {
  [QueryParam.VERSE_FROM]: '2:5',
  [QueryParam.VERSE_TO]: '2:10',
  [QueryParam.SURAH]: '2',
};

const mockSurahReduxValue = '2';

// Mocked QUERY_PARAMS_DATA
const MOCKED_QUERY_PARAMS_DATA = {
  [QueryParam.VERSE_FROM]: {
    reduxSelector: vi.fn(),
    valueType: 'string',
    validate: vi.fn(),
  },
  [QueryParam.VERSE_TO]: {
    reduxSelector: vi.fn(),
    valueType: 'string',
    validate: vi.fn(),
  },
  [QueryParam.SURAH]: {
    reduxSelector: vi.fn(),
    valueType: 'string',
    validate: vi.fn(),
  },
};

vi.mock('../validator', () => ({
  isValidVerseTo: vi.fn().mockImplementation(() => true),
  isValidVerseFrom: vi.fn().mockImplementation(() => true),
}));

vi.mock('@/hooks/useGetQueryParamOrReduxValue', () => ({
  __esModule: true,
  getQueryParamsData: vi.fn().mockImplementation(() => {
    return MOCKED_QUERY_PARAMS_DATA;
  }),
}));

describe('getVerseValue', async () => {
  const mockChaptersData = await getAllChaptersData();
  const queryParamsData = getQueryParamsData();

  it('should return valid verseFromKey when queryParam is VERSE_FROM', () => {
    queryParamsData[QueryParam.VERSE_FROM].validate = vi.fn(() => true);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:5');
    expect(queryParamsData[QueryParam.VERSE_FROM].validate).toHaveBeenCalledWith(
      '2:5',
      mockChaptersData,
      mockQuery,
    );
  });

  it('should return valid verseToKey when queryParam is VERSE_TO', () => {
    queryParamsData[QueryParam.VERSE_TO].validate = vi.fn(() => true);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_TO,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:10');
    expect(queryParamsData[QueryParam.VERSE_TO].validate).toHaveBeenCalledWith(
      '2:10',
      mockChaptersData,
      mockQuery,
    );
  });
  it('should return keyOfFirstVerse if verseFromKey is invalid', () => {
    queryParamsData[QueryParam.VERSE_FROM].validate = vi.fn(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return keyOfFirstVerse if verseToKey is invalid', () => {
    queryParamsData[QueryParam.VERSE_TO].validate = vi.fn(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_TO,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );
    expect(result).toBe('2:1');
  });

  it('should use surahReduxValue if surahStringValue is invalid', () => {
    queryParamsData[QueryParam.SURAH].validate = vi.fn(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return keyOfFirstVerse if verseFromKey is invalid due to invalidVerseFrom', () => {
    (isValidVerseFrom as Mock).mockImplementation(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_FROM,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return keyOfFirstVerse if verseToKey is invalid due to invalidVerseTo', () => {
    (isValidVerseTo as Mock).mockImplementation(() => false);

    const result = getVerseValue(
      mockQuery,
      QueryParam.VERSE_TO,
      mockChaptersData,
      queryParamsData,
      mockSurahReduxValue,
    );

    expect(result).toBe('2:1');
  });
});
