import { QuranFont } from 'src/components/QuranReader/types';
import { stringify } from 'qs';

export const ITEMS_PER_PAGE = 10;

// eslint-disable-next-line
export const API_HOST = process.env.API_HOST;

/**
 * Generates a url to make an api call to our backend
 * @param path the path for the call
 * @param parameters optional query params, {a: 1, b: 2} is parsed to "?a=1&b=2"
 */
export const makeUrl = (path: string, parameters?: Record<string, unknown>) => {
  if (!parameters) {
    return `${API_HOST}${path}`;
  }

  // The following section parses the query params for convenience
  // E.g. parses {a: 1, b: 2} to "?a=1&b=2"
  const queryParameters = `?${stringify(parameters)}`;
  return `${API_HOST}${path}${queryParameters}`;
};

/**
 * Get the default word fields that should exist in the response.
 *
 * @param {QuranFont} quranFont the selected quran font since.
 *
 */
export const getDefaultWordFields = (
  quranFont: QuranFont = QuranFont.QPCHafs,
): { wordFields: string } => ({
  wordFields: `verse_key, verse_id, page_number, location, ${quranFont}`,
});
