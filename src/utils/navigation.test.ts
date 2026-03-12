/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import {
  getQuranicCalendarRangesNavigationUrl,
  getReaderShareQueryParams,
  getReaderShareQueryParamsFromAsPath,
  getVerseShareNavigationUrl,
  QuranicCalendarRangesNavigationSettings,
} from './navigation';

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

describe('getReaderShareQueryParamsFromAsPath', () => {
  it('prefers asPath query params over stale fallback query values', () => {
    const shareParams = getReaderShareQueryParamsFromAsPath(
      `/2/255?readingMode=translation&translations=20,131&${QueryParam.RECITER}=7`,
      {
        [QueryParam.READING_MODE]: 'arabic',
        [QueryParam.TRANSLATIONS]: '131',
        [QueryParam.RECITER]: '3',
        [QueryParam.WBW_LOCALE]: 'ur',
      },
    );

    expect(shareParams).toEqual({
      [QueryParam.READING_MODE]: 'translation',
      [QueryParam.TRANSLATIONS]: '20,131',
      [QueryParam.RECITER]: '7',
    });
  });

  it('falls back to query object when asPath has no query string', () => {
    const shareParams = getReaderShareQueryParamsFromAsPath('/2/255', {
      [QueryParam.READING_MODE]: 'arabic',
      [QueryParam.TRANSLATIONS]: '20,131',
      [QueryParam.STARTING_VERSE]: '255',
    });

    expect(shareParams).toEqual({
      [QueryParam.READING_MODE]: 'arabic',
      [QueryParam.TRANSLATIONS]: '20,131',
    });
  });
});

describe('getQuranicCalendarRangesNavigationUrl', () => {
  it('includes flow and readingMode=translation for default settings', () => {
    const url = getQuranicCalendarRangesNavigationUrl(
      '84:1-114:6',
      QuranicCalendarRangesNavigationSettings.DefaultSettings,
    );

    const [path, queryString] = url.split('?');
    expect(path).toBe('84:1-114:6');

    const searchParams = new URLSearchParams(queryString);
    expect(searchParams.get(QueryParam.FLOW)).toBe('calendar');
    expect(searchParams.get(QueryParam.READING_MODE)).toBe('translation');
    expect(searchParams.get(QueryParam.TRANSLATIONS)).toBeNull();
    expect(searchParams.get(QueryParam.HIDE_ARABIC)).toBeNull();
  });

  it('adds translations for English + Arabic mode while keeping readingMode=translation', () => {
    const url = getQuranicCalendarRangesNavigationUrl(
      '2:1-2:5',
      QuranicCalendarRangesNavigationSettings.EnglishAndArabic,
    );

    const searchParams = new URLSearchParams(url.split('?')[1]);
    expect(searchParams.get(QueryParam.READING_MODE)).toBe('translation');
    expect(searchParams.get(QueryParam.TRANSLATIONS)).toBe('85');
    expect(searchParams.get(QueryParam.HIDE_ARABIC)).toBeNull();
  });

  it('adds translations + hideArabic for English-only mode while keeping readingMode=translation', () => {
    const url = getQuranicCalendarRangesNavigationUrl(
      '2:1-2:5',
      QuranicCalendarRangesNavigationSettings.EnglishOnly,
    );

    const searchParams = new URLSearchParams(url.split('?')[1]);
    expect(searchParams.get(QueryParam.READING_MODE)).toBe('translation');
    expect(searchParams.get(QueryParam.TRANSLATIONS)).toBe('85');
    expect(searchParams.get(QueryParam.HIDE_ARABIC)).toBe('true');
  });
});
