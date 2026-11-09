/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { afterEach, describe, it, expect } from 'vitest';

import { formatDateRelatively, getEarliestDate, getShortDayName } from './datetime';

it('getEarliestDate returns earliest date', () => {
  const result = getEarliestDate([
    '2021-12-02T23:22:00.000Z',
    '2021-12-02T23:21:00.000Z',
    '2021-12-02T23:20:00.000Z',
  ]);

  expect(result).toBe(1638487200000);
});

it('format the date correctly', () => {
  const now = new Date('2021-12-02T23:22:00.000Z');
  const yesterday = new Date('2021-12-01T23:22:00.000Z');
  const tomorrow = new Date('2021-12-03T23:22:00.000Z');
  const daysAgo3 = new Date('2021-11-29T23:22:00.000Z');
  const inDays2 = new Date('2021-12-04T23:22:00.000Z');
  const weeksAgo2 = new Date('2021-11-18T23:22:00.000Z');
  const lastYear = new Date('2020-10-04T23:22:00.000Z');

  expect(formatDateRelatively(yesterday, 'en', now)).toBe('yesterday');
  expect(formatDateRelatively(tomorrow, 'en', now)).toBe('tomorrow');
  expect(formatDateRelatively(daysAgo3, 'en', now)).toBe('3 days ago');
  expect(formatDateRelatively(inDays2, 'en', now)).toBe('in 2 days');
  expect(formatDateRelatively(weeksAgo2, 'en', now)).toBe('2 weeks ago');
  expect(formatDateRelatively(lastYear, 'en', now)).toBe('last year');
});

describe('formatDateRelatively across a DST change', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it('returns whole days when the range includes the end of DST', () => {
    process.env.TZ = 'America/New_York';
    // DST ended on 2021-11-07, so the local midnights are 4 days + 1 hour apart
    const now = new Date(2021, 10, 9, 12);
    const date = new Date(2021, 10, 5, 12);

    expect(formatDateRelatively(date, 'en', now)).toBe('4 days ago');
  });

  it('returns whole days when the range includes the start of DST', () => {
    process.env.TZ = 'America/New_York';
    // DST started on 2021-03-14, so the local midnights are 3 days - 1 hour apart
    const now = new Date(2021, 2, 16, 12);
    const date = new Date(2021, 2, 13, 12);

    expect(formatDateRelatively(date, 'en', now)).toBe('3 days ago');
  });

  it('does not change the passed dates', () => {
    const now = new Date('2021-12-02T23:22:00.000Z');
    const date = new Date('2021-11-29T23:22:00.000Z');
    formatDateRelatively(date, 'en', now);

    expect(now.toISOString()).toBe('2021-12-02T23:22:00.000Z');
    expect(date.toISOString()).toBe('2021-11-29T23:22:00.000Z');
  });
});

describe('getShortDayName', () => {
  it('returns the narrow day name for Monday in English', () => {
    const monday = new Date('2024-01-01T00:00:00.000Z');
    const result = getShortDayName(monday, 'en');
    expect(result).toBe('M');
  });

  it('returns the narrow day name for Sunday in English', () => {
    const sunday = new Date('2024-01-07T00:00:00.000Z');
    const result = getShortDayName(sunday, 'en');
    expect(result).toBe('S');
  });

  it('returns correct narrow day names for all weekdays', () => {
    const testCases = [
      { date: new Date('2024-01-01T00:00:00.000Z'), expected: 'M' },
      { date: new Date('2024-01-02T00:00:00.000Z'), expected: 'T' },
      { date: new Date('2024-01-03T00:00:00.000Z'), expected: 'W' },
      { date: new Date('2024-01-04T00:00:00.000Z'), expected: 'T' },
      { date: new Date('2024-01-05T00:00:00.000Z'), expected: 'F' },
      { date: new Date('2024-01-06T00:00:00.000Z'), expected: 'S' },
      { date: new Date('2024-01-07T00:00:00.000Z'), expected: 'S' },
    ];

    testCases.forEach(({ date, expected }) => {
      expect(getShortDayName(date, 'en')).toBe(expected);
    });
  });

  it('returns localized narrow day name for all supported app locales', () => {
    const monday = new Date('2024-01-01T00:00:00.000Z');
    const supportedLocales = [
      'en',
      'ar',
      'bn',
      'fa',
      'fr',
      'id',
      'it',
      'nl',
      'pt',
      'ru',
      'sq',
      'th',
      'tr',
      'ur',
      'zh',
      'ms',
      'es',
      'sw',
    ];

    supportedLocales.forEach((locale) => {
      const result = getShortDayName(monday, locale);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Note: Most locales return 1 character, but some (like Hindi 'hi') may return 2
      // The function uses 'narrow' format which is the shortest available, not guaranteed to be 1 char
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });
});
