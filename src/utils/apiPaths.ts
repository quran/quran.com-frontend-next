import { decamelizeKeys } from 'humps';
import { QuranFont } from 'src/components/QuranReader/types';
import { DEFAULT_TRANSLATIONS } from 'src/redux/slices/QuranReader/translations';
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
