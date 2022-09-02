import { it, expect } from 'vitest';

import { formatDateRelatively, getEarliestDate } from './datetime';

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
