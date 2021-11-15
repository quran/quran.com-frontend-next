import { ITEMS_PER_PAGE, makeUrl } from './api';
import stringify from './qs-stringify';

import {
  getAudioPlayerStateInitialState,
  getReadingPreferencesInitialState,
  getTranslationsInitialState,
} from 'src/redux/defaultSettings/util';
import { CalculationMethod, Madhab } from 'src/redux/slices/prayerTimes';
import { AdvancedCopyRequest, SearchRequest } from 'types/ApiRequests';
import { QuranFont } from 'types/QuranReader';

export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translationFields: 'resource_name,language_id', // needed to show the name of the translation
  limit: ITEMS_PER_PAGE,
  fields: `${QuranFont.Uthmani},chapter_id,hizb_number`, // we need text_uthmani field when copying the verse. Also the chapter_id for when we want to share the verse or navigate to Tafsir, hizb_number is for when we show the context menu.
};

/**
 * Use the default params and allow overriding the default values e.g. translations.
 *
 * @param {string} currentLocale
 * @param {Record<string, unknown>} params
 * @returns {Record<string, unknown>}
 */
const getVersesParams = (
  currentLocale: string,
  params?: Record<string, unknown>,
): Record<string, unknown> => ({
  ...{
    ...DEFAULT_VERSES_PARAMS,
    translations: getTranslationsInitialState(currentLocale).selectedTranslations.join(', '),
    reciter: getAudioPlayerStateInitialState(currentLocale).reciter.id,
    locale: getReadingPreferencesInitialState(currentLocale).selectedWordByWordLocale,
  },
  ...params,
});

export const makeVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
) => makeUrl(`/verses/by_chapter/${id}`, getVersesParams(currentLocale, params));

export const makeVersesFilterUrl = (params?: Record<string, unknown>) =>
  makeUrl(`/verses/filter`, { ...params });

/**
 * Compose the url for the translations API.
 *
 * @param {string} language
 * @returns {string}
 */
export const makeTranslationsUrl = (language: string): string =>
  makeUrl('/resources/translations', { language });

/**
 * Compose the url for the languages API.
 *
 * @param {string} language
 * @returns {string}
 */
export const makeLanguagesUrl = (language: string): string =>
  makeUrl('/resources/languages', { language });

/**
 * Compose the url for reciters API.
 *
 * @returns {string}
 */
export const makeRecitersUrl = (): string => makeUrl('/audio/reciters');

export const makeChapterAudioDataUrl = (reciterId: number, chapter: number, segments: boolean) =>
  makeUrl(`/audio/reciters/${reciterId}`, { chapter, segments });

export const makeAudioTimestampsUrl = (reciterId: number, verseKey: string) =>
  makeUrl(`/audio/reciters/${reciterId}/timestamp?verse_key=${verseKey}`);

/**
 * Compose the url for the translations' filter API.
 *
 * @param {string} locale the user's language code.
 * @param {number[]} translations an array holding the translations' IDs.
 * @returns {string}
 */
export const makeTranslationsInfoUrl = (locale: string, translations: number[]): string =>
  makeUrl('/resources/translations/filter', { locale, translations: translations.join(', ') });

/**
 * Compose the url for the advanced copy API.
 *
 * @param {AdvancedCopyRequest} params the request params.
 * @returns {string}
 */
export const makeAdvancedCopyUrl = (params: AdvancedCopyRequest): string =>
  makeUrl('/verses/advanced_copy', params as Record<string, unknown>);

/**
 * Compose the url for search API.
 *
 * @param {SearchRequest} params the request params.
 * @returns {string}
 */
export const makeSearchResultsUrl = (params: SearchRequest): string => makeUrl('/search', params);

/**
 * Compose the url for the navigation search API that is used to show results inside the command bar.
 *
 * @param {string} query the request params.
 * @returns {string}
 */
export const makeNavigationSearchUrl = (query: string): string => makeUrl('/navigate', { query });

/**
 * Compose the url for the tafsirs API.
 *
 * @param {string} language the user's language code.
 * @returns {string}
 */
export const makeTafsirsUrl = (language: string): string =>
  makeUrl('/resources/tafsirs', { language });

/**
 * Compose the url for the chapter's info API.
 *
 * @param {string} chapterId the chapter Id.
 * @param {string} language the user's language code.
 * @returns {string}
 */
export const makeChapterInfoUrl = (chapterId: string, language: string): string =>
  makeUrl(`/chapters/${chapterId}/info`, { language });

/**
 * Compose the url for Juz's verses API.
 *
 * @param {string} id  the Id of the juz.
 * @param {string} currentLocale  the locale.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makeJuzVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
): string => makeUrl(`/verses/by_juz/${id}`, getVersesParams(currentLocale, params));

/**
 * Compose the url for page's verses API.
 *
 * @param {string} id  the Id of the page.
 * @param {string} currentLocale  the locale.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makePageVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
): string => makeUrl(`/verses/by_page/${id}`, getVersesParams(currentLocale, params));

/**
 * Compose the url for footnote's API.
 *
 * @param {string} footnoteId
 * @returns {string}
 */
export const makeFootnoteUrl = (footnoteId: string): string => makeUrl(`/foot_notes/${footnoteId}`);

// TODO: replace this url
const PRAYER_TIMES_URL =
  'https://quran-prayer-times-api-abdellatif-io-qurancom.vercel.app/api/prayer-times';

/**
 * Compose the url for prayer times API
 *
 * @param {Object} query
 * @param {CalculationMethod} query.calculationMethod
 * @param {Madhab} query.madhab
 * @returns {string}
 */
export const makePrayerTimesUrl = (query: {
  calculationMethod: CalculationMethod;
  madhab: Madhab;
}) => {
  const today = new Date();
  const date = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  const queryParameters = `?${stringify({ ...query, date, month, year })}`;
  return `${PRAYER_TIMES_URL}${queryParameters}`;
};
