import { it, expect } from 'vitest';

import { toLocalizedNumber, toLocalizedMonthName, toLocalizedVerseKeyRTL } from './locale';

it('toLocalizedNumber works as expected', () => {
  expect(toLocalizedNumber(9, 'en', true)).toBe('09');
  expect(toLocalizedNumber(10, 'en', true)).toBe('10');
  expect(toLocalizedNumber(9, 'en')).toBe('9');
});

it('toLocalizedMonthName works as expected', () => {
  expect(toLocalizedMonthName(2, 'en')).toBe('February');
  expect(toLocalizedMonthName(2, 'ar')).toBe('فبراير');
  expect(toLocalizedMonthName(2, 'fr')).toBe('février');
});

it('toLocalizedVerseKeyRTL works as expected', () => {
  // Basic single-digit cases
  expect(toLocalizedVerseKeyRTL('3:1', 'ar')).toBe('١:٣');
  expect(toLocalizedVerseKeyRTL('3:1', 'en')).toBe('1:3');

  // Edge case: first verse of first chapter
  expect(toLocalizedVerseKeyRTL('1:1', 'ar')).toBe('١:١');
  expect(toLocalizedVerseKeyRTL('1:1', 'en')).toBe('1:1');

  // Multi-digit chapter (last surah)
  expect(toLocalizedVerseKeyRTL('114:6', 'ar')).toBe('٦:١١٤');
  expect(toLocalizedVerseKeyRTL('114:6', 'en')).toBe('6:114');

  // Multi-digit verse (longest surah)
  expect(toLocalizedVerseKeyRTL('2:286', 'ar')).toBe('٢٨٦:٢');
  expect(toLocalizedVerseKeyRTL('2:286', 'en')).toBe('286:2');

  // Both multi-digit
  expect(toLocalizedVerseKeyRTL('36:83', 'ar')).toBe('٨٣:٣٦');
  expect(toLocalizedVerseKeyRTL('36:83', 'en')).toBe('83:36');
});
