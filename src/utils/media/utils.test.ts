/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, vi, Mock } from 'vitest';

import { getAllChaptersData } from '../chapter';
import { isValidVerseFrom, isValidVerseTo } from '../validator';

import { getVerseValue } from './utils';

import { getQueryParamsData } from '@/hooks/useGetQueryParamOrReduxValue';
import QueryParam from '@/types/QueryParam';

const query = {
  [QueryParam.VERSE_FROM]: '2:5',
  [QueryParam.VERSE_TO]: '2:10',
  [QueryParam.SURAH]: '2',
};

const surahReduxValue = '2';

// Mocked QUERY_PARAMS_DATA
const MOCKED_QUERY_PARAMS_DATA = {
  [QueryParam.VERSE_FROM]: {
    reduxValueSelector: vi.fn(),
    queryParamValueType: 'string',
    isValidQueryParam: vi.fn(),
  },
  [QueryParam.VERSE_TO]: {
    reduxValueSelector: vi.fn(),
    queryParamValueType: 'string',
    isValidQueryParam: vi.fn(),
  },
  [QueryParam.SURAH]: {
    reduxValueSelector: vi.fn(),
    queryParamValueType: 'string',
    isValidQueryParam: vi.fn(),
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
  const chaptersData = await getAllChaptersData();
  const queryParamsData = getQueryParamsData();

  it('should return valid verseFromKey when queryParam is VERSE_FROM', () => {
    queryParamsData[QueryParam.VERSE_FROM].isValidQueryParam = vi.fn(() => true);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );

    expect(result).toBe('2:5');
    expect(queryParamsData[QueryParam.VERSE_FROM].isValidQueryParam).toHaveBeenCalledWith(
      '2:5',
      chaptersData,
      query,
    );
  });

  it('should return valid verseToKey when queryParam is VERSE_TO', () => {
    queryParamsData[QueryParam.VERSE_TO].isValidQueryParam = vi.fn(() => true);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_TO,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );

    expect(result).toBe('2:10');
    expect(queryParamsData[QueryParam.VERSE_TO].isValidQueryParam).toHaveBeenCalledWith(
      '2:10',
      chaptersData,
      query,
    );
  });
  it('should return keyOfFirstVerse if verseFromKey is invalid', () => {
    queryParamsData[QueryParam.VERSE_FROM].isValidQueryParam = vi.fn(() => false);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return keyOfFirstVerse if verseToKey is invalid', () => {
    queryParamsData[QueryParam.VERSE_TO].isValidQueryParam = vi.fn(() => false);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_TO,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );
    expect(result).toBe('2:1');
  });

  it('should use surahReduxValue if surahStringValue is invalid', () => {
    queryParamsData[QueryParam.SURAH].isValidQueryParam = vi.fn(() => false);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return keyOfFirstVerse if verseFromKey is invalid due to invalidVerseFrom', () => {
    (isValidVerseFrom as Mock).mockImplementation(() => false);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return keyOfFirstVerse if verseToKey is invalid due to invalidVerseTo', () => {
    (isValidVerseTo as Mock).mockImplementation(() => false);

    const result = getVerseValue(
      query,
      QueryParam.VERSE_TO,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );

    expect(result).toBe('2:1');
  });

  it('should return the correct verse key when all validations pass', async () => {
    const result = getVerseValue(
      query,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );
    expect(result).toBe('2:1');
  });

  it('should return the first verse key when verseFrom is invalid', async () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: 'invalid' };
    const result = getVerseValue(
      invalidQuery,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );
    expect(result).toBe('2:1');
  });

  it('should return the first verse key when verseTo is invalid', async () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: 'invalid' };
    const result = getVerseValue(
      invalidQuery,
      QueryParam.VERSE_TO,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );
    expect(result).toBe('2:1');
  });

  it('should return the first verse key when surah is invalid', async () => {
    const invalidQuery = { ...query, [QueryParam.SURAH]: 'invalid' };
    const result = getVerseValue(
      invalidQuery,
      QueryParam.VERSE_FROM,
      chaptersData,
      queryParamsData,
      surahReduxValue,
    );
    expect(result).toBe('2:1');
  });
});
