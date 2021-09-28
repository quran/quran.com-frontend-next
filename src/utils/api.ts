import { decamelizeKeys } from 'humps';

import stringify from './qs-stringify';

import { Mushaf, MushafLine, QuranFont, QuranFontMushaf } from 'src/components/QuranReader/types';

export const ITEMS_PER_PAGE = 10;

const STAGING_API_HOST = 'https://staging.quran.com/api/qdc';
const PRODUCTION_API_HOST = 'https://api.quran.com/api/qdc';

// env variables in Vercel can't be dynamic, we have to hardcode the urls here. https://stackoverflow.com/questions/44342226/next-js-error-only-absolute-urls-are-supported
export const API_HOST =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? PRODUCTION_API_HOST : STAGING_API_HOST;

/**
 * Generates a url to make an api call to our backend
 *
 * @param {string} path the path for the call
 * @param {Record<string, unknown>} parameters optional query params, {a: 1, b: 2} is parsed to "?a=1&b=2"
 * @returns {string}
 */
export const makeUrl = (path: string, parameters?: Record<string, unknown>): string => {
  if (!parameters) {
    return `${API_HOST}${path}`;
  }

  const decamelizedParams = decamelizeKeys(parameters);

  // The following section parses the query params for convenience
  // E.g. parses {a: 1, b: 2} to "?a=1&b=2"
  const queryParameters = `?${stringify(decamelizedParams)}`;
  return `${API_HOST}${path}${queryParameters}`;
};

/**
 * Get the default word fields that should exist in the response.
 *
 * @param {QuranFont} quranFont the selected quran font since.
 * @returns {{ wordFields: string}}
 *
 */
export const getDefaultWordFields = (
  quranFont: QuranFont = QuranFont.QPCHafs,
): { wordFields: string } => ({
  wordFields: `verse_key, verse_id, page_number, location, text_uthmani, ${quranFont}`,
});

/**
 * Get the mushaf id based on the value inside redux (if it's not SSR).
 *
 * @param {QuranFont} quranFont
 * @param {MushafLine} mushafLines
 * @returns {{mushaf: number}}
 */
export const getMushafId = (
  quranFont: QuranFont = QuranFont.QPCHafs,
  mushafLines?: MushafLine,
): { mushaf: number } => {
  let mushaf = QuranFontMushaf[quranFont];
  // convert the Indopak mushaf to either 15 or 16 lines Mushaf
  if (quranFont === QuranFont.IndoPak && mushafLines) {
    mushaf =
      mushafLines === MushafLine.FifteenLines ? Mushaf.Indopak15Lines : Mushaf.Indopak16Lines;
  }
  return { mushaf };
};
