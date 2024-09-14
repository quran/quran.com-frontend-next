import { decamelizeKeys } from 'humps';

import { getDefaultWordFields, getMushafId, ITEMS_PER_PAGE, makeUrl } from './api';
import stringify from './qs-stringify';

import { DEFAULT_RECITER } from '@/redux/defaultSettings/defaultSettings';
import {
  getReadingPreferencesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { SearchRequestParams, SearchMode } from '@/types/Search/SearchRequestParams';
import { AdvancedCopyRequest, PagesLookUpRequest, SearchRequest } from 'types/ApiRequests';
import { MushafLines, QuranFont } from 'types/QuranReader';

export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translationFields: 'resource_name,language_id', // needed to show the name of the translation
  perPage: ITEMS_PER_PAGE,
  fields: `${QuranFont.Uthmani},chapter_id,hizb_number,text_imlaei_simple`, // we need text_uthmani field when copying the verse. text_imlaei_simple is for SEO description meta tag. Also the chapter_id for when we want to share the verse or navigate to Tafsir, hizb_number is for when we show the context menu.
};

/**
 * Use the default params and allow overriding the default values e.g. translations.
 *
 * @param {string} currentLocale
 * @param {Record<string, unknown>} params
 * @param {boolean} includeTranslationFields
 * @returns {Record<string, unknown>}
 */
const getVersesParams = (
  currentLocale: string,
  params?: Record<string, unknown>,
  includeTranslationFields = true,
): Record<string, unknown> => {
  const defaultParams = {
    ...DEFAULT_VERSES_PARAMS,
    translations: getTranslationsInitialState(currentLocale).selectedTranslations.join(', '),
    reciter: DEFAULT_RECITER.id,
    wordTranslationLanguage:
      getReadingPreferencesInitialState(currentLocale).selectedWordByWordLocale,
  };

  if (!includeTranslationFields) {
    delete defaultParams.translationFields;
    delete defaultParams.translations;
  }

  return {
    ...defaultParams,
    ...params,
  };
};

export const makeVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
) => makeUrl(`/verses/by_chapter/${id}`, getVersesParams(currentLocale, params));

export const makeByRangeVersesUrl = (currentLocale: string, params?: Record<string, unknown>) =>
  makeUrl(`/verses/by_range`, getVersesParams(currentLocale, params));

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
 * Compose the url for the wbw translations API.
 *
 * @param {string} language
 * @returns {string}
 */
export const makeWordByWordTranslationsUrl = (language: string): string =>
  makeUrl('/resources/word_by_word_translations', { language });

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
 * @param {string} locale the user's language code.
 * @returns {string}
 */
export const makeAvailableRecitersUrl = (locale: string, fields?: string[]): string =>
  makeUrl('/audio/reciters', { locale, fields });

export const makeReciterUrl = (reciterId: string, locale: string): string =>
  makeUrl(`/audio/reciters/${reciterId}`, {
    locale,
    fields: ['profile_picture', 'cover_image', 'bio'],
  });

/**
 * Compose the url of the audio file of a surah.
 *
 * @param {number} reciterId id of reciter
 * @param {number} chapter the surah number.
 * @param {boolean} segments include segments info
 *
 * @returns {string}
 */
export const makeChapterAudioDataUrl = (
  reciterId: number,
  chapter: number,
  segments: boolean,
): string => makeUrl(`/audio/reciters/${reciterId}/audio_files`, { chapter, segments });

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
  makeUrl('/resources/translations/filter', {
    locale,
    translations: translations.join(', '),
  });

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

export const makeNewSearchApiUrl = (params: Record<string, any>) => {
  const baseUrl = process.env.NEXT_PUBLIC_SEARCH_BASE_URL;

  return `${baseUrl}/v1/search?${stringify(decamelizeKeys(params))}`;
};

export const makeNewSearchResultsUrl = <T extends SearchMode>(params: SearchRequestParams<T>) =>
  makeNewSearchApiUrl(params);

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

export const makeTafsirContentUrl = (
  tafsirId: number | string,
  verseKey: string,
  options: { lang: string; quranFont: QuranFont; mushafLines: MushafLines },
) => {
  const params = {
    locale: options.lang,
    words: true,
    ...getDefaultWordFields(options.quranFont),
    ...getMushafId(options.quranFont, options.mushafLines),
  };
  return makeUrl(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, params);
};

/**
 * Compose the url for the pages look up API.
 *
 * @param {PagesLookUpRequest} params
 * @returns {string}
 */
export const makePagesLookupUrl = (params: PagesLookUpRequest): string =>
  makeUrl('/pages/lookup', params);

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
 * Compose the url for the chapter's API.
 *
 * @param {string} chapterIdOrSlug the chapter Id or the slug.
 * @param {string} language the user's language code.
 * @returns {string}
 */
export const makeChapterUrl = (chapterIdOrSlug: string, language: string): string =>
  makeUrl(`/chapters/${chapterIdOrSlug}`, { language });

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
 * Compose the url for Rub el Hizb's verses API.
 *
 * @param {string} id  the Id of the Rub el Hizb.
 * @param {string} currentLocale  the locale.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makeRubVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
): string => makeUrl(`/verses/by_rub_el_hizb/${id}`, getVersesParams(currentLocale, params));

/**
 * Compose the url for Hizb's verses API.
 *
 * @param {string} id  the Id of the hizb.
 * @param {string} currentLocale  the locale.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makeHizbVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
): string => makeUrl(`/verses/by_hizb/${id}`, getVersesParams(currentLocale, params));

/**
 * Compose the url for by verse key API.
 *
 * @param {string} verseKey  the Id of the juz.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makeByVerseKeyUrl = (verseKey: string, params?: Record<string, unknown>): string =>
  makeUrl(`/verses/by_key/${verseKey}`, params);

/**
 * Compose the url for page's verses API.
 *
 * @param {string} id  the Id of the page.
 * @param {string} currentLocale  the locale.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @param {boolean} includeTranslationFields
 * @returns {string}
 */
export const makePageVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, unknown>,
  includeTranslationFields = true,
): string =>
  makeUrl(
    `/verses/by_page/${id}`,
    getVersesParams(currentLocale, params, includeTranslationFields),
  );

/**
 * Compose the url for footnote's API.
 *
 * @param {string} footnoteId
 * @returns {string}
 */
export const makeFootnoteUrl = (footnoteId: string): string => makeUrl(`/foot_notes/${footnoteId}`);

export const makeDonateUrl = (showDonationPopup = false) =>
  `https://donate.quran.foundation${showDonationPopup ? '?showDonationPopup' : ''}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const makeDonatePageUrl = (isOnce = true, shouldUseProviderUrl = false) => {
  if (shouldUseProviderUrl) {
    return `https://give.quran.foundation/give/${isOnce ? 482507 : 474400}/#!/donation/checkout`;
  }
  return makeDonateUrl();
};
