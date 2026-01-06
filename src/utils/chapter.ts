/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import random from 'lodash/random';

import { formatStringNumber } from './number';
import REVELATION_ORDER from './revelationOrder';

import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';

const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_CHAPTER_LOCALES = [
  'en',
  'ar',
  'bn',
  'fr',
  'id',
  'ms',
  'it',
  'nl',
  'ru',
  'tr',
  'ur',
  'zh',
  'es',
  'sw',
];

/**
 * Get chapters data from the json file, by language
 *
 * @param {string} lang
 * @returns {Promise<Record<string, Chapter>>} chapter
 */
export const getAllChaptersData = (
  lang: string = DEFAULT_LANGUAGE,
): Promise<Record<string, Chapter>> => {
  if (SUPPORTED_CHAPTER_LOCALES.includes(lang)) {
    return new Promise((res) => {
      import(`../../data/chapters/${lang}.json`).then((data) => {
        res(data.default);
      });
    });
  }
  return new Promise((res) => {
    import(`../../data/chapters/en.json`).then((data) => {
      // @ts-ignore
      res(data.default);
    });
  });
};

/**
 * Get chapter data by id from the json file
 *
 * @param {ChaptersData} chapters
 * @param {string} id
 * @returns {Chapter} chapter
 */
export const getChapterData = (chapters: ChaptersData, id: string): Chapter =>
  chapters[formatStringNumber(id)];

/**
 * Given a pageId, get chapter ids from a json file
 *
 * @param {string} pageId
 * @returns {Promise<string[]>} chapterIds
 */
export const getChapterIdsForPage = (pageId: string): Promise<string[]> => {
  return new Promise((res) => {
    import(`@/data/page-to-chapter-mappings.json`).then((data) => {
      res(data.default[pageId]);
    });
  });
};

/**
 * Given a juzId, get chapters ids from a json file
 *
 * @param {string} juzId
 * @returns {string[]} chapterIds
 */
export const getChapterIdsForJuz = async (juzId: string): Promise<string[]> => {
  return new Promise((res) => {
    import(`@/data/juz-to-chapter-mappings.json`).then((data) => {
      res(data.default[juzId]);
    });
  });
};

type ChapterAndVerseMapping = { [chapter: string]: string };
/**
 * get ChapterAndVerseMapping for all juzs
 *
 * @returns {[juz: string]: ChapterAndVerseMapping}
 */
export const getAllJuzMappings = (): Promise<{ [juz: string]: ChapterAndVerseMapping }> => {
  return new Promise((res) => {
    import('@/data/juz-to-chapter-verse-mappings.json').then((data) => {
      res(data.default);
    });
  });
};

/**
 * Given a juzId get a chapter + verse mapping for this juz
 *
 * @param {string} juzId
 * @returns {[chapter: string]: string}
 *
 * original data source: https://api.quran.com/api/v4/juzs
 *
 * Example:
 * getChapterAndVerseMappingForJuz("1") // { "1": "1-7", "2" : "1-141"}
 * -> juz "1" contains chapter "1" with verse "1-7" and chapter "2" with verse "1-141"
 *
 */
export const getChapterAndVerseMappingForJuz = async (
  juzId: string,
): Promise<{ [chapter: string]: string }> => {
  const juzVerseMapping = await getAllJuzMappings();
  return juzVerseMapping[juzId];
};

/**
 * Whether the current surah is the first surah.
 *
 * @param {number} surahNumber
 * @param {boolean} isReadingByRevelationOrder
 * @returns  {boolean}
 */
export const isFirstSurah = (
  surahNumber: number,
  isReadingByRevelationOrder?: boolean,
): boolean => {
  if (!isReadingByRevelationOrder) return surahNumber === 1;

  return REVELATION_ORDER[0] === surahNumber;
};

/**
 * Whether the current surah is the last surah.
 *
 * @param {number} surahNumber
 * @param {boolean} isReadingByRevelationOrder
 * @returns  {boolean}
 */
export const isLastSurah = (surahNumber: number, isReadingByRevelationOrder?: boolean): boolean => {
  if (!isReadingByRevelationOrder) return surahNumber === 114;

  return REVELATION_ORDER[REVELATION_ORDER.length - 1] === surahNumber;
};

// DRY helper to get adjacent chapter in revelation order.
// offset: +1 for next, -1 for previous.
const getAdjacentChapterInRevelationOrder = (
  currentChapter: number,
  offset: 1 | -1,
): number | null => {
  const currentIndex = REVELATION_ORDER.indexOf(currentChapter);
  if (currentIndex === -1) return null;
  return REVELATION_ORDER[currentIndex + offset] ?? null;
};

/**
 * Get the next chapter number for the given reading order.
 * Returns null when there is no next chapter.
 *
 * @param {number} currentChapter
 * @param {boolean} isReadingByRevelationOrder
 * @returns {number | null}
 */
export const getNextChapterNumber = (
  currentChapter: number,
  isReadingByRevelationOrder?: boolean,
): number | null => {
  if (!isReadingByRevelationOrder) {
    return currentChapter < 114 ? currentChapter + 1 : null;
  }
  return getAdjacentChapterInRevelationOrder(currentChapter, 1);
};

/**
 * Get the previous chapter number for the given reading order.
 * Returns null when there is no previous chapter.
 *
 * @param {number} currentChapter
 * @param {boolean} isReadingByRevelationOrder
 * @returns {number | null}
 */
export const getPreviousChapterNumber = (
  currentChapter: number,
  isReadingByRevelationOrder?: boolean,
): number | null => {
  if (!isReadingByRevelationOrder) {
    return currentChapter > 1 ? currentChapter - 1 : null;
  }
  return getAdjacentChapterInRevelationOrder(currentChapter, -1);
};

/**
 * Get how much percentage of the chapter has been read.
 *
 * @param {number} currentVerse
 * @param {number} totalNumberOfVerses
 * @returns {number}
 */
export const getChapterReadingProgress = (
  currentVerse: number,
  totalNumberOfVerses: number,
): number => Math.ceil((currentVerse * 100) / totalNumberOfVerses);

export const QURAN_CHAPTERS_COUNT = 114;
export const getRandomChapterId = () => {
  return random(1, QURAN_CHAPTERS_COUNT);
};
