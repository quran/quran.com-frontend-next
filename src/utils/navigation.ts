import { getChapterData } from './chapter';
import { getBasePath } from './url';
import { getVerseAndChapterNumbersFromKey } from './verse';

import { SearchNavigationType } from 'types/SearchNavigationResult';

/**
 * Get the href link to a verse.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseNavigationUrlByVerseKey = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}/${verseNumber}`;
};

/**
 * Get the href link to a verse.
 *
 * @param {string} chapterIdOrSlug
 * @param {string} verseNumber
 * @returns {string}
 */
export const getVerseNavigationUrl = (chapterIdOrSlug: string, verseNumber: string): string =>
  `/${chapterIdOrSlug}/${verseNumber}`;

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
 * @param {string | number} chapterIdOrSlug
 * @param {number} verseNumber
 * @returns {string}
 */
export const getVerseTafsirNavigationUrl = (
  chapterIdOrSlug: string | number,
  verseNumber: number,
): string => `/${chapterIdOrSlug}/${verseNumber}/tafsirs`;

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
 * @param {string | number} surahIdOrSlug
 * @returns  {string}
 */
export const getSurahNavigationUrl = (surahIdOrSlug: string | number): string =>
  `/${surahIdOrSlug}`;

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
    return getVerseNavigationUrlByVerseKey(stringKey);
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
 * @param {string} chapterIdOrSlug
 * @returns {string} chapterUrl
 */
export const getSurahInfoNavigationUrl = (chapterIdOrSlug: string): string =>
  `/surah/${chapterIdOrSlug}/info`;

/**
 * Get the canonical url. Will include the language in the url except for English.
 *
 * @param {string} lang
 * @param {string} path
 * @returns {string}
 */
export const getCanonicalUrl = (lang: string, path: string): string =>
  `${getBasePath()}${lang === 'en' ? '' : `/${lang}`}${path}`;
