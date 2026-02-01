/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { it, expect } from 'vitest';

import { getAllChaptersData } from './chapter';
import {
  generateVerseKeysBetweenTwoVerseKeys,
  verseRangesToVerseKeys,
  readableVerseRangeKeys,
  verseKeysToRanges,
  sortVerseKeys,
} from './verseKeys';

it('generates verse keys within the same chapter', async () => {
  const chaptersData = await getAllChaptersData();
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '78:1', '78:2')).toEqual([
    '78:1',
    '78:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '78:1', '78:30')).toEqual([
    '78:1',
    '78:2',
    '78:3',
    '78:4',
    '78:5',
    '78:6',
    '78:7',
    '78:8',
    '78:9',
    '78:10',
    '78:11',
    '78:12',
    '78:13',
    '78:14',
    '78:15',
    '78:16',
    '78:17',
    '78:18',
    '78:19',
    '78:20',
    '78:21',
    '78:22',
    '78:23',
    '78:24',
    '78:25',
    '78:26',
    '78:27',
    '78:28',
    '78:29',
    '78:30',
  ]);
});

it('generates verse keys for 2 chapters', async () => {
  const chaptersData = await getAllChaptersData();
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '113:1')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '113:2')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '113:5')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '113:1')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '113:2')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '113:5')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '113:1')).toEqual([
    '112:4',
    '113:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '113:2')).toEqual([
    '112:4',
    '113:1',
    '113:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '113:5')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
  ]);
});
it('generates verse keys for 3 chapters', async () => {
  const chaptersData = await getAllChaptersData();
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '114:1')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '114:2')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '114:6')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
    '114:3',
    '114:4',
    '114:5',
    '114:6',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '114:1')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '114:2')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '114:6')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
    '114:3',
    '114:4',
    '114:5',
    '114:6',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '114:1')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '114:2')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '114:6')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
    '114:3',
    '114:4',
    '114:5',
    '114:6',
  ]);
});

it('sorts verse keys - sorts by chapter number first', async () => {
  expect(sortVerseKeys(['2:1', '1:1', '3:1'])).toEqual(['1:1', '2:1', '3:1']);
  expect(sortVerseKeys(['5:5', '2:2', '1:1', '114:1'])).toEqual(['1:1', '2:2', '5:5', '114:1']);
});

it('sorts verse keys - sorts by verse number within same chapter', async () => {
  expect(sortVerseKeys(['1:3', '1:1', '1:2'])).toEqual(['1:1', '1:2', '1:3']);
  expect(sortVerseKeys(['2:5', '2:1', '2:3', '2:2'])).toEqual(['2:1', '2:2', '2:3', '2:5']);
});

it('sorts verse keys - handles mixed chapters and verses', async () => {
  expect(sortVerseKeys(['2:1', '1:3', '1:1', '2:2'])).toEqual(['1:1', '1:3', '2:1', '2:2']);
  expect(sortVerseKeys(['3:5', '1:1', '2:3', '3:1', '1:10'])).toEqual([
    '1:1',
    '1:10',
    '2:3',
    '3:1',
    '3:5',
  ]);
});

it('sorts verse keys - handles already sorted arrays', async () => {
  expect(sortVerseKeys(['1:1', '1:2', '2:1', '2:2'])).toEqual(['1:1', '1:2', '2:1', '2:2']);
  expect(sortVerseKeys(['1:1', '2:1', '3:1'])).toEqual(['1:1', '2:1', '3:1']);
});

it('sorts verse keys - handles single element arrays', async () => {
  expect(sortVerseKeys(['1:1'])).toEqual(['1:1']);
  expect(sortVerseKeys(['114:6'])).toEqual(['114:6']);
});

it('sorts verse keys - handles empty arrays', async () => {
  expect(sortVerseKeys([])).toEqual([]);
});

it('sorts verse keys - handles duplicate verse keys', async () => {
  expect(sortVerseKeys(['1:1', '1:1', '2:1'])).toEqual(['1:1', '1:1', '2:1']);
  expect(sortVerseKeys(['2:2', '1:1', '2:2', '1:1'])).toEqual(['1:1', '1:1', '2:2', '2:2']);
});

it('sorts verse keys - handles large verse numbers', async () => {
  expect(sortVerseKeys(['2:286', '2:1', '2:255'])).toEqual(['2:1', '2:255', '2:286']);
  expect(sortVerseKeys(['3:200', '1:7', '2:286'])).toEqual(['1:7', '2:286', '3:200']);
});

it('sorts verse keys - returns new array without modifying original', async () => {
  const input = ['2:1', '1:3', '1:1'];
  const result = sortVerseKeys(input);
  expect(result).not.toBe(input); // Different reference
  expect(result).toEqual(['1:1', '1:3', '2:1']); // New array is sorted
  expect(input).toEqual(['2:1', '1:3', '1:1']); // Original unchanged
});

it('converts verse ranges to verse keys - basic functionality', async () => {
  const chaptersData = await getAllChaptersData();
  expect(verseRangesToVerseKeys(chaptersData, ['1:1-1:3'])).toEqual(['1:1', '1:2', '1:3']);
  expect(verseRangesToVerseKeys(chaptersData, ['78:1-78:2', '79:1-79:1'])).toEqual([
    '78:1',
    '78:2',
    '79:1',
  ]);
});

it('converts verse ranges to verse keys - removes duplicates', async () => {
  const chaptersData = await getAllChaptersData();
  expect(verseRangesToVerseKeys(chaptersData, ['1:1-1:2', '1:1-1:3'])).toEqual([
    '1:1',
    '1:2',
    '1:3',
  ]);
  expect(verseRangesToVerseKeys(chaptersData, ['1:1-1:1', '1:1-1:1'])).toEqual(['1:1']);
});

it('converts verse ranges to verse keys - handles invalid ranges', async () => {
  const chaptersData = await getAllChaptersData();
  expect(verseRangesToVerseKeys(chaptersData, ['invalid-range'])).toEqual([]);
  expect(verseRangesToVerseKeys(chaptersData, ['1:1-1:3', 'not-a-range'])).toEqual([
    '1:1',
    '1:2',
    '1:3',
  ]);
  expect(verseRangesToVerseKeys(chaptersData, ['1:1'])).toEqual([]);
  expect(verseRangesToVerseKeys(chaptersData, ['1:1-'])).toEqual([]);
});

it('converts verse ranges to verse keys - handles empty arrays', async () => {
  const chaptersData = await getAllChaptersData();
  expect(verseRangesToVerseKeys(chaptersData, [])).toEqual([]);
});

it('converts verse ranges to verse keys - handles multi-chapter ranges', async () => {
  const chaptersData = await getAllChaptersData();
  expect(verseRangesToVerseKeys(chaptersData, ['1:1-2:1'])).toEqual([
    '1:1',
    '1:2',
    '1:3',
    '1:4',
    '1:5',
    '1:6',
    '1:7',
    '2:1',
  ]);
});

it('formats verse ranges to readable format - basic functionality', async () => {
  const chaptersData = await getAllChaptersData();
  expect(readableVerseRangeKeys(['1:1-1:3'], chaptersData, 'en')).toEqual(['Al-Fatihah 1:1-1:3']);
  expect(readableVerseRangeKeys(['78:1-78:2'], chaptersData, 'en')).toEqual(['An-Naba 78:1-78:2']);
});

it('formats verse ranges to readable format - single verses', async () => {
  const chaptersData = await getAllChaptersData();
  expect(readableVerseRangeKeys(['1:1-1:1'], chaptersData, 'en')).toEqual(['Al-Fatihah 1:1']);
  expect(readableVerseRangeKeys(['2:255-2:255'], chaptersData, 'en')).toEqual(['Al-Baqarah 2:255']);
});

it('formats verse ranges to readable format - handles localization', async () => {
  const chaptersDataAr = await getAllChaptersData('ar');
  const chaptersDataEn = await getAllChaptersData('en');
  expect(readableVerseRangeKeys(['1:1-1:3'], chaptersDataAr, 'ar')).toEqual(['الفاتحة ١:١-١:٣']);
  expect(readableVerseRangeKeys(['1:1-1:3'], chaptersDataEn, 'en')).toEqual(['Al-Fatihah 1:1-1:3']);
});

it('formats verse ranges to readable format - filters invalid ranges', async () => {
  const chaptersData = await getAllChaptersData();
  expect(readableVerseRangeKeys(['invalid-range'], chaptersData, 'en')).toEqual([]);
  expect(readableVerseRangeKeys(['1:1-1:3', 'not-a-range'], chaptersData, 'en')).toEqual([
    'Al-Fatihah 1:1-1:3',
  ]);
  expect(readableVerseRangeKeys(['1:1'], chaptersData, 'en')).toEqual([]);
});

it('formats verse ranges to readable format - handles empty arrays', async () => {
  const chaptersData = await getAllChaptersData();
  expect(readableVerseRangeKeys([], chaptersData, 'en')).toEqual([]);
});

it('formats verse ranges to readable format - handles multiple ranges', async () => {
  const chaptersData = await getAllChaptersData();
  expect(readableVerseRangeKeys(['1:1-1:1', '2:1-2:2'], chaptersData, 'en')).toEqual([
    'Al-Fatihah 1:1',
    'Al-Baqarah 2:1-2:2',
  ]);
});

it('converts verse keys to ranges - groups sequential verses in same chapter', () => {
  expect(verseKeysToRanges(['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'])).toEqual(['1:1-1:7']);
  expect(verseKeysToRanges(['1:1', '1:2', '1:3'])).toEqual(['1:1-1:3']);
  expect(verseKeysToRanges(['2:1', '2:2', '2:3', '2:4'])).toEqual(['2:1-2:4']);
});

it('converts verse keys to ranges - handles sequential verses across chapters', () => {
  expect(verseKeysToRanges(['1:6', '1:7', '2:1', '2:2'])).toEqual(['1:6-1:7', '2:1-2:2']);
  expect(
    verseKeysToRanges(['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7', '2:1', '2:2', '2:7']),
  ).toEqual(['1:1-1:7', '2:1-2:2', '2:7-2:7']);
  expect(verseKeysToRanges(['1:5', '1:6', '1:7', '2:1', '2:2', '2:3'])).toEqual([
    '1:5-1:7',
    '2:1-2:3',
  ]);
});

it('converts verse keys to ranges - handles non-sequential across chapters', () => {
  expect(verseKeysToRanges(['1:5', '2:1', '2:2', '2:3'])).toEqual(['1:5-1:5', '2:1-2:3']);
  expect(verseKeysToRanges(['1:7', '2:2', '2:3'])).toEqual(['1:7-1:7', '2:2-2:3']);
});

it('converts verse keys to ranges - handles single verses', () => {
  expect(verseKeysToRanges(['1:1'])).toEqual(['1:1-1:1']);
  expect(verseKeysToRanges(['1:5', '2:10'])).toEqual(['1:5-1:5', '2:10-2:10']);
});

it('converts verse keys to ranges - handles non-sequential verses', () => {
  expect(verseKeysToRanges(['1:1', '1:3', '1:5'])).toEqual(['1:1-1:1', '1:3-1:3', '1:5-1:5']);
  expect(verseKeysToRanges(['1:1', '1:2', '1:5', '1:6'])).toEqual(['1:1-1:2', '1:5-1:6']);
});

it('converts verse keys to ranges - handles empty arrays', () => {
  expect(verseKeysToRanges([])).toEqual([]);
});

it('converts verse keys to ranges - sorts unsorted input', () => {
  expect(verseKeysToRanges(['1:7', '1:1', '1:3', '1:2'])).toEqual(['1:1-1:3', '1:7-1:7']);
  expect(verseKeysToRanges(['2:2', '1:1', '2:1'])).toEqual(['1:1-1:1', '2:1-2:2']);
});

it('converts verse keys to ranges - handles complex multi-chapter sequences', () => {
  expect(
    verseKeysToRanges(['112:3', '112:4', '113:1', '113:2', '113:3', '114:1', '114:2']),
  ).toEqual(['112:3-112:4', '113:1-113:3', '114:1-114:2']);
});

it('converts verse keys to ranges - handles multiple small gaps', () => {
  expect(verseKeysToRanges(['1:1', '1:2', '1:4', '1:5', '1:7'])).toEqual([
    '1:1-1:2',
    '1:4-1:5',
    '1:7-1:7',
  ]);
});

it('converts verse keys to ranges - handles all verses of a chapter', () => {
  // Chapter 112 has exactly 4 verses
  expect(verseKeysToRanges(['112:1', '112:2', '112:3', '112:4'])).toEqual(['112:1-112:4']);
  // Chapter 113 has exactly 5 verses
  expect(verseKeysToRanges(['113:1', '113:2', '113:3', '113:4', '113:5'])).toEqual(['113:1-113:5']);
});

it('converts verse keys to ranges - handles cross-chapter with missing verses', () => {
  expect(verseKeysToRanges(['1:5', '1:6', '2:1', '2:2'])).toEqual(['1:5-1:6', '2:1-2:2']);
});

it('converts verse keys to ranges - handles only last verse of chapter and first of next', () => {
  expect(verseKeysToRanges(['1:7', '2:1'])).toEqual(['1:7-1:7', '2:1-2:1']);
  expect(verseKeysToRanges(['112:4', '113:1'])).toEqual(['112:4-112:4', '113:1-113:1']);
});

it('converts verse keys to ranges - preserves order and creates ranges correctly', () => {
  const input = ['2:255', '2:256', '2:285', '2:286', '3:1', '3:2'];
  const result = verseKeysToRanges(input);
  expect(result).toEqual(['2:255-2:256', '2:285-2:286', '3:1-3:2']);
});

it('converts verse keys to ranges - handles large chapter numbers', () => {
  expect(verseKeysToRanges(['114:1', '114:2', '114:3', '114:4'])).toEqual(['114:1-114:4']);
});
