import { decamelizeKeys } from 'humps';
import { QuranFont } from 'src/components/QuranReader/types';
import { DEFAULT_TRANSLATIONS } from 'src/redux/slices/QuranReader/translations';
import { AdvancedCopyRequest, SearchRequest } from 'types/APIRequests';
import { ITEMS_PER_PAGE, makeUrl } from './api';

export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translations: DEFAULT_TRANSLATIONS.join(', '),
  limit: ITEMS_PER_PAGE,
  fields: QuranFont.Uthmani, // we need text_uthmani field when copying the verse
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
 * Compose the url for the languages API.
 *
 * @param {string} language
 * @returns {string}
 */
export const makeLanguagesUrl = (language: string): string =>
  makeUrl('/resources/languages', decamelizeKeys({ language }));

/**
 * Compose the url for the translations' filter API.
 *
 * @param {string} locale the user's language code.
 * @param {number[]} translations an array holding the translations' IDs.
 * @returns {string}
 */
export const makeTranslationsInfoUrl = (locale: string, translations: number[]): string =>
  makeUrl(
    '/resources/translations/filter',
    decamelizeKeys({ locale, translations: translations.join(', ') }),
  );

/**
 * Compose the url for the advanced copy API.
 *
 * @param {AdvancedCopyRequest} params the request params.
 * @returns {string}
 */
export const makeAdvancedCopyUrl = (params: AdvancedCopyRequest): string =>
  makeUrl('/verses/advanced_copy', decamelizeKeys(params));

/**
 * Compose the url for search API.
 *
 * @param {SearchRequest} params the request params.
 * @returns {string}
 */
export const makeSearchResultsUrl = (params: SearchRequest): string =>
  makeUrl('/search', decamelizeKeys(params));
