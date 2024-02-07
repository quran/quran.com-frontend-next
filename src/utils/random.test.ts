/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import { getRandomSurahId, getRandomAyahId, getRandomSurahAyahId, getRandomAll } from './random';
import { isValidVerseKey } from './validator';
import { getChapterNumberFromKey, getVerseNumberFromKey } from './verse';

import { SurahLogs } from '@/redux/slices/QuranReader/readingTracker';

const chapterData = {
  1: {
    versesCount: '2',
    transliteratedName: 'Al-Fatihah',
  },
  2: {
    versesCount: '3',
    transliteratedName: 'Al-Baqarah',
  },
  3: {
    versesCount: '4',
    transliteratedName: 'Al-Imran',
  },
};

const surahs: SurahLogs = {
  1: {
    chapterId: '1',
    lastRead: '1',
    timestamp: 0,
  },
  2: {
    chapterId: '2',
    lastRead: '1',
    timestamp: 0,
  },
};

const surahNames = ['Al-Fatihah', 'Al-Baqarah', 'Al-Imran'];
const readSurahNames = ['Al-Fatihah', 'Al-Baqarah'];

// eslint-disable-next-line unicorn/no-array-reduce
const options = surahNames.reduce((acc, surah, i) => {
  return [
    ...acc,
    ...Array(parseInt(chapterData[i + 1].versesCount, 10))
      .fill(0)
      .map((verse, j) => `${surah}, verse ${j + 1}`),
  ];
}, []);

// eslint-disable-next-line unicorn/no-array-reduce
const readOptions = readSurahNames.map((surah) => `${surah}, verse 1`);

describe('Test getRandomSurahId', () => {
  it('Returns a string from 1 to the number of surahs in chapter data when given an empty list of params', () => {
    const result = parseInt(getRandomSurahId(chapterData as never), 10);
    const max = Object.keys(chapterData).length;

    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(max);
  });
  it('Returns a chapter ID only from the given list of surahs', () => {
    const result = parseInt(getRandomSurahId(chapterData as never, surahs), 10);

    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(2);
  });
});

describe('Test getRandomAyahId', () => {
  it('Returns a string from 1 to versesCount of the given surah', () => {
    const result = parseInt(getRandomAyahId(chapterData as never, '1'), 10);

    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(2);
  });
  it('Returns a string from 1 to the last read ayah of the given surah', () => {
    const result = parseInt(getRandomAyahId(chapterData as never, '3', '2'), 10);

    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(2);
  });
});

describe('Test getRandomSurahAyahId', () => {
  it('Returns a string in the chapter:verse format', () => {
    const result = getRandomSurahAyahId(chapterData as never);
    const condition = isValidVerseKey(chapterData as never, result);

    expect(condition).toBe(true);
  });
  it('Returns a random chapter:verse key from all surahs in the given chapterData', () => {
    const result = getRandomSurahAyahId(chapterData as never);
    const surah = getChapterNumberFromKey(result);
    const verse = getVerseNumberFromKey(result);
    const condition = verse <= parseInt(chapterData[surah].versesCount, 10);

    expect(condition).toBe(true);
  });
  it('Returns a valid chapter:verse key from the given surahs', () => {
    const result = getRandomSurahAyahId(chapterData as never, surahs);
    const condition = result === '1:1' || result === '2:1';

    expect(condition).toBe(true);
  });
});

describe('Test getRandomAll', () => {
  it('Returns the correct surah and ayah names for all surahs', () => {
    const { randomSurah, randomSurahAyah } = getRandomAll(chapterData as never, {}, 'verse');
    expect(surahNames.includes(randomSurah)).toBe(true);
    expect(options.includes(randomSurahAyah)).toBe(true);
  });
  it('Returns the correct surah and ayah names when given surah logs', () => {
    const { randomSurah, randomSurahAyah, randomReadSurah, randomReadSurahAyah } = getRandomAll(
      chapterData as never,
      surahs,
      'verse',
    );
    expect(surahNames.includes(randomSurah)).toBe(true);
    expect(options.includes(randomSurahAyah)).toBe(true);
    expect(readSurahNames.includes(randomReadSurah)).toBe(true);
    expect(readOptions.includes(randomReadSurahAyah)).toBe(true);
  });
});
