import { it, expect } from 'vitest';

import {
  toLocalizedNumber,
  toLocalizedMonthName,
  toLocalizedVerseKeyRTL,
  toLocalizedVerseKeyAuto,
} from './locale';

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

it('toLocalizedVerseKeyAuto works as expected for RTL languages', () => {
  // Arabic - should use RTL format (reversed order with Arabic numerals)
  expect(toLocalizedVerseKeyAuto('3:1', 'ar')).toBe('١:٣');
  expect(toLocalizedVerseKeyAuto('1:1', 'ar')).toBe('١:١');
  expect(toLocalizedVerseKeyAuto('114:6', 'ar')).toBe('٦:١١٤');
  expect(toLocalizedVerseKeyAuto('2:286', 'ar')).toBe('٢٨٦:٢');
  expect(toLocalizedVerseKeyAuto('36:83', 'ar')).toBe('٨٣:٣٦');

  // Persian/Farsi - should use RTL format with Persian numerals
  expect(toLocalizedVerseKeyAuto('3:1', 'fa')).toBe('۱:۳');
  expect(toLocalizedVerseKeyAuto('2:286', 'fa')).toBe('۲۸۶:۲');
});

it('toLocalizedVerseKeyAuto works as expected for LTR languages', () => {
  // English - should use LTR format
  expect(toLocalizedVerseKeyAuto('3:1', 'en')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('1:1', 'en')).toBe('1:1');
  expect(toLocalizedVerseKeyAuto('114:6', 'en')).toBe('114:6');
  expect(toLocalizedVerseKeyAuto('2:286', 'en')).toBe('2:286');
  expect(toLocalizedVerseKeyAuto('36:83', 'en')).toBe('36:83');

  // French - should use LTR format
  expect(toLocalizedVerseKeyAuto('3:1', 'fr')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('2:286', 'fr')).toBe('2:286');

  // Other LTR languages
  expect(toLocalizedVerseKeyAuto('3:1', 'de')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('3:1', 'es')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('3:1', 'id')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('3:1', 'ru')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('3:1', 'tr')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('3:1', 'zh')).toBe('3:1');
});

it('toLocalizedVerseKeyAuto handles Urdu as a special case (LTR format despite being RTL)', () => {
  // Urdu is RTL locale but should use LTR format for verse keys
  expect(toLocalizedVerseKeyAuto('3:1', 'ur')).toBe('3:1');
  expect(toLocalizedVerseKeyAuto('1:1', 'ur')).toBe('1:1');
  expect(toLocalizedVerseKeyAuto('114:6', 'ur')).toBe('114:6');
  expect(toLocalizedVerseKeyAuto('2:286', 'ur')).toBe('2:286');
  expect(toLocalizedVerseKeyAuto('36:83', 'ur')).toBe('36:83');
});

it('toLocalizedVerseKeyAuto handles edge cases', () => {
  // First verse of first chapter across different locales
  expect(toLocalizedVerseKeyAuto('1:1', 'ar')).toBe('١:١'); // RTL
  expect(toLocalizedVerseKeyAuto('1:1', 'en')).toBe('1:1'); // LTR
  expect(toLocalizedVerseKeyAuto('1:1', 'ur')).toBe('1:1'); // Urdu special case

  // Last verse of last surah
  expect(toLocalizedVerseKeyAuto('114:6', 'ar')).toBe('٦:١١٤'); // RTL
  expect(toLocalizedVerseKeyAuto('114:6', 'en')).toBe('114:6'); // LTR
  expect(toLocalizedVerseKeyAuto('114:6', 'ur')).toBe('114:6'); // Urdu special case

  // Longest verse in the Quran
  expect(toLocalizedVerseKeyAuto('2:286', 'ar')).toBe('٢٨٦:٢'); // RTL
  expect(toLocalizedVerseKeyAuto('2:286', 'en')).toBe('2:286'); // LTR
  expect(toLocalizedVerseKeyAuto('2:286', 'ur')).toBe('2:286'); // Urdu special case
});
