import { decamelizeKeys } from 'humps';
import { ITEMS_PER_PAGE, makeUrl } from './api';

export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translations: 20,
  limit: ITEMS_PER_PAGE,
};

export const makeVersesUrl = (id: string | number, params?: Record<string, unknown>) => {
  // allow overriding the default values e.g. translations
  const apiParams = { ...DEFAULT_VERSES_PARAMS, ...params };

  return makeUrl(`/verses/by_chapter/${id}`, decamelizeKeys(apiParams));
};

/**
 * Compose the url for the translations API.
 *
 * @param {string} language
 * @returns {string}
 */
export const makeTranslationsUrl = (language: string): string =>
  makeUrl('/resources/translations', decamelizeKeys({ language }));

/**
 * Compose the url for the get verse by key API.
 *
 * @param {string} chapterId
 * @param {string} verseId
 * @returns {string}
 */
export const makeVerseByKeyUrl = (
  chapterId: string,
  verseId: string | number,
  params?: Record<string, unknown>,
): string => {
  const verseKey = `${chapterId}:${verseId}`; // e.g. 10:5 = 5th verse of 10th chapter.
  const apiParams = { ...DEFAULT_VERSES_PARAMS, ...params };
  return makeUrl(`/verses/by_key/${verseKey}`, decamelizeKeys(apiParams));
};
