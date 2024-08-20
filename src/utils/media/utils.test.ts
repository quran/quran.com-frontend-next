/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { describe, expect, it } from 'vitest';

import { getAllChaptersData } from '../chapter';

import { isValidHexColor, isValidVerseToOrFrom } from './utils';

import QueryParam from '@/types/QueryParam';

describe('isValidVerseToOrFrom', async () => {
  const chaptersData = await getAllChaptersData();

  const query: ParsedUrlQuery = {
    surah: '2',
    verseFrom: '5',
    verseTo: '10',
  };

  it('should return true when the verse from is valid', () => {
    const result = isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, query);

    expect(result).toBe(true);
  });

  it('should return true when the verse to is valid', () => {
    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, query);

    expect(result).toBe(true);
  });

  it('should return false when the verse from is invalid', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: 'invalid' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse to is invalid', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: 'invalid' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse from is greater than the verse to', () => {
    const invalidQuery = {
      ...query,
      [QueryParam.VERSE_FROM]: '10',
      [QueryParam.VERSE_TO]: '5',
    };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse from is greater than the total number of verses in the chapter', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: '287' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse to is greater than the total number of verses in the chapter', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: '287' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, invalidQuery);

    expect(result).toBe(false);
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
