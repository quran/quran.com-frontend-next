import { SearchNavigationType } from 'types/SearchNavigationResult';
import { getVerseAndChapterNumbersFromKey } from './verse';

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
export const getSearchQueryNavigationUrl = (query: string): string => `/search?query=${query}`;
