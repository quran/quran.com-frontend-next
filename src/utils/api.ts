import { decamelizeKeys } from 'humps';

import stringify from './qs-stringify';

import { Mushaf, MushafLines, QuranFont, QuranFontMushaf } from 'types/QuranReader';

export const ITEMS_PER_PAGE = 10;

const STAGING_API_HOST = 'https://staging.quran.com';
const PRODUCTION_API_HOST = 'https://api.qurancdn.com';

const API_ROOT_PATH = '/api/qdc';

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
    return `${API_HOST}${API_ROOT_PATH}${path}`;
  }

  const decamelizedParams = decamelizeKeys(parameters);

  // The following section parses the query params for convenience
  // E.g. parses {a: 1, b: 2} to "?a=1&b=2"
  const queryParameters = `?${stringify(decamelizedParams)}`;
  return `${API_HOST}${API_ROOT_PATH}${path}${queryParameters}`;
};

/**
 * Get the default word fields that should exist in the response.
 * qpc_uthmani_hafs is added so that we can use it as a fallback
 * text for QCF font V1, V2 and V4.
 *
 * @param {QuranFont} quranFont the selected quran font since.
 * @returns {{ wordFields: string}}
 *
 */
export const getDefaultWordFields = (
  quranFont: QuranFont = QuranFont.QPCHafs,
): { wordFields: string } => ({
  wordFields: `verse_key,verse_id,page_number,location,text_uthmani,${
    quranFont === QuranFont.TajweedV4 ? QuranFont.MadaniV2 : quranFont
  }${quranFont === QuranFont.QPCHafs ? '' : `,${QuranFont.QPCHafs}`}`,
});

/**
 * Get the mushaf id based on the value inside redux (if it's not SSR).
 *
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @returns {{mushaf: Mushaf}}
 */
export const getMushafId = (
  // eslint-disable-next-line default-param-last
  quranFont: QuranFont = QuranFont.QPCHafs,
  mushafLines?: MushafLines,
): { mushaf: Mushaf } => {
  let mushaf = QuranFontMushaf[quranFont];
  // convert the Indopak mushaf to either 15 or 16 lines Mushaf
  if (quranFont === QuranFont.IndoPak && mushafLines) {
    mushaf =
      mushafLines === MushafLines.FifteenLines ? Mushaf.Indopak15Lines : Mushaf.Indopak16Lines;
  }
  return { mushaf };
};
