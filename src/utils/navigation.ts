/* eslint-disable max-lines */
import { ParsedUrlQuery, stringify } from 'querystring';

import REVELATION_ORDER from './revelationOrder';
import { searchIdToNavigationKey } from './search';
import { getBasePath } from './url';
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey } from './verse';

import QueryParam from '@/types/QueryParam';
import { QuranReaderFlow } from '@/types/QuranReader';
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
 * Get the href link to a verse range e.g. 3:5-7.
 *
 * @param {string} key
 * @returns {string}
 */
export const getSurahRangeNavigationUrlByVerseKey = (key: string): string => {
  const { surah, from, to } = getVerseNumberRangeFromKey(key);
  return `/${surah}/${from}-${to}`;
};

/**
 * Get the scroll to link of a verseKey.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getChapterWithStartingVerseUrl = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}?${QueryParam.STARTING_VERSE}=${verseNumber}`;
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
 * Get the href link to a range.
 *
 * @param {string} startVerseKey
 * @param {string} endVerseKey
 * @returns {string}
 */
export const getRangesNavigationUrl = (startVerseKey: string, endVerseKey: string): string =>
  `/${startVerseKey}-${endVerseKey}`;

/**
 * Get the href link to a juz.
 *
 * @param {string | number} juzNumber
 * @returns  {string}
 */
export const getJuzNavigationUrl = (juzNumber: string | number): string => `/juz/${juzNumber}`;

/**
 * Get the href link to a Rub el Hizb.
 *
 * @param {string | number} rubNumber
 * @returns  {string}
 */
export const getRubNavigationUrl = (rubNumber: string | number): string => `/rub/${rubNumber}`;

/**
 * Get the href link to a hizb.
 *
 * @param {string | number} hizbNumber
 * @returns  {string}
 */
export const getHizbNavigationUrl = (hizbNumber: string | number): string => `/hizb/${hizbNumber}`;

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
 * Get the href link to selected tafsir for Ayah.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseReflectionNavigationUrl = (verseKey: string): string =>
  `/${verseKey}/reflections`;

/**
 * Get the href link to a surah.
 *
 * @param {string | number} surahIdOrSlug
 * @returns  {string}
 */
export const getSurahNavigationUrl = (surahIdOrSlug: string | number): string =>
  `/${surahIdOrSlug}`;

export enum QuranicCalendarRangesNavigationSettings {
  EnglishOnly = 'englishOnly',
  EnglishAndArabic = 'englishAndArabic',
  DefaultSettings = 'defaultSettings',
}

export const getQuranicCalendarRangesNavigationUrl = (
  ranges: string,
  settings: QuranicCalendarRangesNavigationSettings,
): string => {
  const params = {
    [QueryParam.FLOW]: QuranReaderFlow.QURANIC_CALENDER,
  };

  if (settings !== QuranicCalendarRangesNavigationSettings.DefaultSettings) {
    params[QueryParam.TRANSLATIONS] = 85;
    if (settings === QuranicCalendarRangesNavigationSettings.EnglishOnly) {
      params[QueryParam.HIDE_ARABIC] = 'true';
    }
  }

  return `${ranges}?${stringify(params)}`;
};

/**
 * Get the href link to the previous surah.
 *
 * @param {number} chapterNumber
 * @param {boolean} isReadingByRevelationOrder
 * @returns  {string}
 */
export const getPreviousSurahNavigationUrl = (
  chapterNumber: number,
  isReadingByRevelationOrder?: boolean,
): string => {
  if (!isReadingByRevelationOrder) {
    return getSurahNavigationUrl(chapterNumber - 1);
  }
  const currentChapterRevelationOrderIndex = REVELATION_ORDER.indexOf(chapterNumber);
  const previousChapterRevelationOrderIndex = currentChapterRevelationOrderIndex - 1;

  const previousChapterNumberByRevelationOrder =
    REVELATION_ORDER[previousChapterRevelationOrderIndex];

  return getSurahNavigationUrl(previousChapterNumberByRevelationOrder);
};

/**
 * Get the href link to the next surah.
 *
 * @param chapterNumber
 * @param isReadingByRevelationOrder
 * @returns  {string}
 */

export const getNextSurahNavigationUrl = (
  chapterNumber: number,
  isReadingByRevelationOrder?: boolean,
): string => {
  if (!isReadingByRevelationOrder) {
    return getSurahNavigationUrl(chapterNumber + 1);
  }

  const currentChapterRevelationOrderIndex = REVELATION_ORDER.indexOf(chapterNumber);
  const nextChapterRevelationOrderIndex = currentChapterRevelationOrderIndex + 1;

  const nextChapterNumberByRevelationOrder = REVELATION_ORDER[nextChapterRevelationOrderIndex];

  return getSurahNavigationUrl(nextChapterNumberByRevelationOrder);
};

/**
 * Generate the navigation url based on the type.
 *
 * @param {SearchNavigationType} type
 * @param {string | number} key
 * @param {boolean} isKalimatSearch
 * @returns {string}
 */
export const resolveUrlBySearchNavigationType = (
  type: SearchNavigationType,
  key: string | number,
  isKalimatSearch = false,
): string => {
  const stringKey = isKalimatSearch ? searchIdToNavigationKey(type, String(key)) : String(key);
  if (type === SearchNavigationType.AYAH) {
    return getChapterWithStartingVerseUrl(stringKey);
  }
  if (type === SearchNavigationType.JUZ) {
    return getJuzNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.RUB_EL_HIZB) {
    return getRubNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.HIZB) {
    return getHizbNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.PAGE) {
    return getPageNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.SEARCH_PAGE) {
    return getSearchQueryNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.RANGE) {
    return getSurahRangeNavigationUrlByVerseKey(stringKey);
  }
  // for the Surah navigation
  return getSurahNavigationUrl(stringKey);
};

/**
 * Get the href link to the search page with a specific query.
 *
 * @param {string} query the search query.
 * @returns {string}
 */
export const getSearchQueryNavigationUrl = (query?: string): string =>
  `/search${query ? `?${QueryParam.QUERY}=${query}` : ''}`;

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
 * Get href link to the course page
 *
 * @param {string} courseSlug
 * @returns {string} coursePageUrl
 */
export const getCourseNavigationUrl = (courseSlug: string): string =>
  `/learning-plans/${courseSlug}`;

/**
 * Get href link to the lesson page
 *
 * @param {string} courseSlug
 * @returns {string} lessonPageUrl
 */
export const getLessonNavigationUrl = (courseSlug: string, lessonSlug: string): string =>
  `/learning-plans/${courseSlug}/lessons/${lessonSlug}`;

/**
 * Get href link to an audio recitation page by reciterId and chapterId
 *
 * @param {string} reciterId
 * @param {string} chapterId
 * @returns {string} recitationPageUrl
 */
export const getReciterChapterNavigationUrl = (reciterId: string, chapterId: string) =>
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

export const getProfileNavigationUrl = () => {
  return '/profile';
};

export const getCollectionNavigationUrl = (collectionId: string) => {
  return `/collections/${collectionId}`;
};

export const getReadingGoalNavigationUrl = () => '/reading-goal';
export const getMyCoursesNavigationUrl = () => '/my-learning-plans';
export const getCoursesNavigationUrl = () => '/learning-plans';
export const getRamadanActivitiesNavigationUrl = () => '/ramadan-activities';

export const getLoginNavigationUrl = (redirectTo?: string) =>
  `/login${redirectTo ? `?${QueryParam.REDIRECT_TO}=${redirectTo}` : ''}`;

export const getReadingGoalProgressNavigationUrl = () => '/reading-goal/progress';

export const getNotesNavigationUrl = () => '/notes-and-reflections';

export const getNotificationSettingsNavigationUrl = () => '/notification-settings';
export const getQuranicCalendarNavigationUrl = () => '/calendar';
export const getQuranMediaMakerNavigationUrl = (params?: ParsedUrlQuery) => {
  const baseUrl = '/media';
  return params ? `${baseUrl}?${stringify(params)}` : baseUrl;
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
