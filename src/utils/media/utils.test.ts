/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { describe, it, expect } from 'vitest';

import { getAllChaptersData } from '../chapter';

import {
  isValidVerseToOrFrom,
  getVerseToOrFromFromKey,
  getFirstAyahOfQueryParamOrReduxSurah,
  isValidHexColor,
} from './utils';

import QueryParam from '@/types/QueryParam';

describe('isValidVerseToOrFrom', async () => {
  const chaptersData = await getAllChaptersData();
  const surahAndVersesReduxValues = {
    surah: 2,
    verseFrom: '2:5',
    verseTo: '2:10',
  };

  const query: ParsedUrlQuery = {
    surah: '2',
    verseFrom: '2:5',
    verseTo: '2:10',
  };

  it('should return true when the verse from is valid', () => {
    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_FROM,
      chaptersData,
      surahAndVersesReduxValues,
      query,
    );

    expect(result).toBe(true);
  });

  it('should return true when the verse to is valid', () => {
    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_TO,
      chaptersData,
      surahAndVersesReduxValues,
      query,
    );

    expect(result).toBe(true);
  });

  it('should return false when the verse from is invalid', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: 'invalid' };

    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_FROM,
      chaptersData,
      surahAndVersesReduxValues,
      invalidQuery,
    );

    expect(result).toBe(false);
  });

  it('should return false when the verse to is invalid', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: 'invalid' };

    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_TO,
      chaptersData,
      surahAndVersesReduxValues,
      invalidQuery,
    );

    expect(result).toBe(false);
  });

  it('should return false when the verse from is greater than the verse to', () => {
    const invalidQuery = {
      ...query,
      [QueryParam.VERSE_FROM]: '2:10',
      [QueryParam.VERSE_TO]: '2:5',
    };

    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_FROM,
      chaptersData,
      surahAndVersesReduxValues,
      invalidQuery,
    );

    expect(result).toBe(false);
  });

  it('should return false when the verse from is greater than the total number of verses in the chapter', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: '2:287' };

    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_FROM,
      chaptersData,
      surahAndVersesReduxValues,
      invalidQuery,
    );

    expect(result).toBe(false);
  });

  it('should return false when the verse to is greater than the total number of verses in the chapter', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: '2:287' };

    const result = isValidVerseToOrFrom(
      QueryParam.VERSE_TO,
      chaptersData,
      surahAndVersesReduxValues,
      invalidQuery,
    );

    expect(result).toBe(false);
  });
});
describe('getVerseToOrFromFromKey', () => {
  it('should return the same verse key if it is already in the format of surah:verseNumber', () => {
    const verseFromQueryParamValue = '2:5';
    const surahID = '2';

    const result = getVerseToOrFromFromKey(verseFromQueryParamValue, surahID);

    expect(result).toBe(verseFromQueryParamValue);
  });

  it('should return the verse key in the format of surah:verseNumber if the verse number is provided', () => {
    const verseFromQueryParamValue = '5';
    const surahID = '2';
    const expectedVerseKey = '2:5';

    const result = getVerseToOrFromFromKey(verseFromQueryParamValue, surahID);

    expect(result).toBe(expectedVerseKey);
  });
});

describe('getFirstAyahOfQueryParamOrReduxSurah', () => {
  const surahQueryParamConfigs = {
    isValidQueryParam: (value: any) => typeof value === 'string' && value !== '',
  };

  it('should return the first ayah based on the surah query parameter if it is valid', () => {
    const surahAndVersesReduxValues = {
      surah: 2,
      verseFrom: '2:5',
      verseTo: '2:10',
    };

    const query: ParsedUrlQuery = {
      surah: '3',
    };

    const result = getFirstAyahOfQueryParamOrReduxSurah(
      surahQueryParamConfigs,
      surahAndVersesReduxValues,
      query,
    );

    expect(result).toBe('3:1');
  });

  it('should return the first ayah based on the surah Redux value if the surah query parameter is not valid', () => {
    const surahAndVersesReduxValues = {
      surah: 2,
      verseFrom: '2:5',
      verseTo: '2:10',
    };

    const query: ParsedUrlQuery = {
      surah: '',
    };

    const result = getFirstAyahOfQueryParamOrReduxSurah(
      surahQueryParamConfigs,
      surahAndVersesReduxValues,
      query,
    );

    expect(result).toBe('2:1');
  });
});

describe('isValidHexColor', () => {
  it('should return true for valid 3-digit hex colors', () => {
    expect(isValidHexColor('#fff')).toBe(true);
    expect(isValidHexColor('#ABC')).toBe(true);
    expect(isValidHexColor('#123')).toBe(true);
  });

  it('should return true for valid 6-digit hex colors', () => {
    expect(isValidHexColor('#ffffff')).toBe(true);
    expect(isValidHexColor('#123abc')).toBe(true);
    expect(isValidHexColor('#ABCDEF')).toBe(true);
  });

  it('should return false for invalid hex colors', () => {
    expect(isValidHexColor('fff')).toBe(false); // Missing #
    expect(isValidHexColor('#123abz')).toBe(false); // Invalid character
    expect(isValidHexColor('#12345')).toBe(false); // Incorrect length
    expect(isValidHexColor('#12')).toBe(false); // Incorrect length
    expect(isValidHexColor('#xyzxyz')).toBe(false); // Invalid characters
  });

  it('should return false for empty string or other invalid inputs', () => {
    expect(isValidHexColor('')).toBe(false); // Empty string
    expect(isValidHexColor(null)).toBe(false); // null input
    expect(isValidHexColor(undefined)).toBe(false); // undefined input
    expect(isValidHexColor('#')).toBe(false); // Only #
  });
});
