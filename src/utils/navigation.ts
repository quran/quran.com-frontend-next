import { getChapterData } from './chapter';
import { getVerseAndChapterNumbersFromKey } from './verse';

import { SearchNavigationType } from 'types/SearchNavigationResult';

/**
 * Get the href link to a verse.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseNavigationUrl = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}/${verseNumber}`;
};

/**
 * Get the href link to a the range of verses from a specific verse
 * to the end of the chapter.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseToEndOfChapterNavigationUrl = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const lastVerseOfChapter = getChapterData(chapterId).versesCount;
  return `/${chapterId}/${verseNumber}-${lastVerseOfChapter}`;
};

/**
 * Get the href link to a juz.
 *
 * @param {string | number} juzNumber
 * @returns  {string}
 */
export const getJuzNavigationUrl = (juzNumber: string | number): string => `/juz/${juzNumber}`;

/**
 * Get the href link to a page.
 *
 * @param {string | number} pageNumber
 * @returns  {string}
 */
export const getPageNavigationUrl = (pageNumber: string | number): string => `/page/${pageNumber}`;

/**
 * Get the href link to tafsir for Ayah.
 *
 * @param {string | number} chapterId
 * @param {number} verseNumber
 * @returns {string}
 */
export const getVerseTafsirNavigationUrl = (
  chapterId: string | number,
  verseNumber: number,
): string => `/${chapterId}/${verseNumber}/tafsirs`;

/**
 * Get the href link to selected tafsir for Ayah.
 *
 * @param {string | number} chapterId
 * @param {number} verseNumber
 * @param {number} tafsirId
 * @returns {string}
 */
export const getVerseSelectedTafsirNavigationUrl = (
  chapterId: string | number,
  verseNumber: number,
  tafsirId: number,
): string => `/${chapterId}:${verseNumber}/tafsirs/${tafsirId}`;

/**
 * Get the href link to a surah.
 *
 * @param {string | number} surahNumber
 * @returns  {string}
 */
export const getSurahNavigationUrl = (surahNumber: string | number): string => `/${surahNumber}`;

/**
 * Generate the navigation url based on the type.
 *
 * @param {SearchNavigationType} type
 * @param {string | number} key
 * @returns {string}
 */
export const resolveUrlBySearchNavigationType = (
  type: SearchNavigationType,
  key: string | number,
): string => {
  const stringKey = String(key);
  if (type === SearchNavigationType.AYAH) {
    return getVerseNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.JUZ) {
    return getJuzNavigationUrl(key);
  }
  if (type === SearchNavigationType.PAGE) {
    return getPageNavigationUrl(key);
  }
  // for the Surah navigation
  return getSurahNavigationUrl(key);
};

/**
 * Get the href link to the search page with a specific query.
 *
 * @param {string} query the search query.
 * @returns {string}
 */
export const getSearchQueryNavigationUrl = (query?: string): string =>
  `/search${query ? `?query=${query}` : ''}`;

/**
 * Get the href link to the info page of a Surah.
 *
 * @param {string} chapterId
 * @returns {string} chapterUrl
 */
export const getSurahInfoNavigationUrl = (chapterId: string): string => `/surah/${chapterId}/info`;

/**
 * Parse the page url and return true if it indicates a page starting with the first verse.
 *
 * @returns {boolean}
 */
export const isFirstVerseOfChapter = (): boolean => {
  const url = new URL(window.location.href);
  const urlParts = url.pathname.split('/').filter(Boolean);
  // if the url is in the format of /chapter
  if (urlParts.length === 1 && !Number.isNaN(urlParts[0])) {
    return true;
  }
  // if the url is in the format of /chapter/verse, /chapter/verse-verse
  if (urlParts.length === 2) {
    return !!urlParts[1]?.startsWith('1');
  }
  // for any other url, return false e.g. /chapter/verse/tafsirs, /juz/juz-number etc.
  return false;
};
