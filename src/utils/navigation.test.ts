import { describe, expect, it } from 'vitest';

import { getReaderShareQueryParams, getVerseShareNavigationUrl } from './navigation';

import QueryParam from '@/types/QueryParam';

describe('getReaderShareQueryParams', () => {
  it('returns only reader share query params', () => {
    const query = {
      [QueryParam.TRANSLATIONS]: '20,131',
      [QueryParam.RECITER]: '7',
      [QueryParam.WBW_LOCALE]: 'ur',
      [QueryParam.READING_MODE]: 'translation',
      [QueryParam.STARTING_VERSE]: '5',
      random: 'value',
    };

    expect(getReaderShareQueryParams(query)).toEqual({
      [QueryParam.TRANSLATIONS]: '20,131',
      [QueryParam.RECITER]: '7',
      [QueryParam.WBW_LOCALE]: 'ur',
      [QueryParam.READING_MODE]: 'translation',
    });
  });

  it('normalizes array values to the first item', () => {
    const query = {
      [QueryParam.TRANSLATIONS]: ['20,131', '85'],
      [QueryParam.READING_MODE]: ['arabic', 'translation'],
    };

    expect(getReaderShareQueryParams(query)).toEqual({
      [QueryParam.TRANSLATIONS]: '20,131',
      [QueryParam.READING_MODE]: 'arabic',
    });
  });
});

describe('getVerseShareNavigationUrl', () => {
  it('returns base verse path when no share params exist', () => {
    expect(getVerseShareNavigationUrl('2', '255')).toBe('/2/255');
  });

  it('appends reader share query params to verse path', () => {
    const url = getVerseShareNavigationUrl('2', '255', {
      [QueryParam.READING_MODE]: 'arabic',
      [QueryParam.RECITER]: '7',
      [QueryParam.STARTING_VERSE]: '255',
    });

    const [path, queryString] = url.split('?');
    expect(path).toBe('/2/255');

    const searchParams = new URLSearchParams(queryString);
    expect(searchParams.get(QueryParam.READING_MODE)).toBe('arabic');
    expect(searchParams.get(QueryParam.RECITER)).toBe('7');
    expect(searchParams.get(QueryParam.STARTING_VERSE)).toBeNull();
  });
});
