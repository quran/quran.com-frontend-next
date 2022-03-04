import { stringify } from 'querystring';

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
 * Get the scroll to link of a verseKey.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getChapterWithStartingVerseUrl = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}?startingVerse=${verseNumber}`;
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
  tafsirId?: string,
): string =>
  `/${chapterIdOrSlug}/${verseNumber}/tafsirs${tafsirId ? `?${stringify({ tafsirId })}` : ''}`;

/**
 * Get the href link to selected tafsir for Ayah.
 *
 * @param {string | number} chapterId
 * @param {number} verseNumber
 * @param {number |string} tafsirId
 * @returns {string}
 */
export const getVerseSelectedTafsirNavigationUrl = (
  chapterId: string | number,
  verseNumber: number,
  tafsirId: number | string,
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
    return getChapterWithStartingVerseUrl(stringKey);
  }
  if (type === SearchNavigationType.JUZ) {
    return getJuzNavigationUrl(key);
  }
  if (type === SearchNavigationType.PAGE) {
    return getPageNavigationUrl(key);
  }
  if (type === SearchNavigationType.SEARCH_PAGE) {
    return getSearchQueryNavigationUrl(key as string);
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
 * Get href link to the reciter page
 *
 * @param {string} reciterId
 * @returns {string} reciterPageUrl
 */
export const getReciterNavigationUrl = (reciterId: string): string => `/reciters/${reciterId}`;

/**
 * Get href link to an audio recitation page by reciterId and chapterId
 *
 * @param {string} reciterId
 * @param {string} chapterId
 * @returns {string} recitationPageUrl
 */
export const getRecitationNavigationUrl = (reciterId: string, chapterId: string) =>
  `/reciters/${reciterId}/${chapterId}`;

/**
 * Get the canonical url. Will include the language in the url except for English.
 *
 * @param {string} lang
 * @param {string} path
 * @returns {string}
 */
export const getCanonicalUrl = (lang: string, path: string): string =>
  `${getBasePath()}${lang === 'en' ? '' : `/${lang}`}${path}`;

/**
 * Get the href link to the product updates page.
 *
 * @param {string} id
 * @returns {string}
 */
export const getProductUpdatesUrl = (id = ''): string =>
  `/product-updates${`${id ? `/${id}` : ''}`}`;

export const getQuranReflectVerseUrl = (verseKey: string) => {
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
  return `https://quranreflect.com/${chapter}/${verse}?feed=true`;
};

/**
 * Update the browser history with the new url.
 * without actually navigating into that url.
 * So it does not trigger re render or page visit on Next.js
 *
 * @param {string} url
 * @param {string} locale
 */
export const fakeNavigate = (url: string, locale: string) => {
  window.history.pushState({}, '', `${locale === 'en' ? '' : `/${locale}`}${url}`);
};

/**
 * Scroll to the top of the page.
 */
export const scrollWindowToTop = (): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
};
