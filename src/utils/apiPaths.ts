import { decamelizeKeys } from 'humps';

import { ITEMS_PER_PAGE, makeUrl } from './api';

import { QuranFont } from 'src/components/QuranReader/types';
import { DEFAULT_RECITER } from 'src/redux/slices/AudioPlayer/defaultData';
import { DEFAULT_TRANSLATIONS } from 'src/redux/slices/QuranReader/translations';
import { AdvancedCopyRequest, SearchRequest } from 'types/APIRequests';

export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translations: DEFAULT_TRANSLATIONS.join(', '),
  translationFields: 'resource_name', // needed to show the name of the translation
  limit: ITEMS_PER_PAGE,
  fields: `${QuranFont.Uthmani},chapter_id`, // we need text_uthmani field when copying the verse. Also the chapter_id for when we want to share the verse or navigate to Tafsir.
  reciter: DEFAULT_RECITER.id,
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
 * Compose the url for reciters API.
 *
 * @param {string} language
 * @returns {string
 */
export const makeRecitersUrl = (): string => makeUrl('/audio/reciters');
export const makeAudioFilesUrl = (reciterId: number, chapter: number) =>
  makeUrl(`/audio/reciter/${reciterId}`, decamelizeKeys({ chapter }));

export const makeAudioTimestampsUrl = (reciterId: number, verseKey: string) =>
  makeUrl(`/audio/reciter/${reciterId}/timestamp?verse_key=${verseKey}`);

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

/**
 * Compose the url for the tafsirs API.
 *
 * @param {string} language the user's language code.
 * @returns {string}
 */
export const makeTafsirsUrl = (language: string): string =>
  makeUrl('/resources/tafsirs', decamelizeKeys({ language }));

/**
 * Compose the url for the chapter's info API.
 *
 * @param {string} chapterId the chapter Id.
 * @param {string} language the user's language code.
 * @returns {string}
 */
export const makeChapterInfoUrl = (chapterId: string, language: string): string =>
  makeUrl(`/chapters/${chapterId}/info`, decamelizeKeys({ language }));

/**
 * Compose the url for Juz's verses API.
 *
 * @param {string} id  the Id of the juz.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makeJuzVersesUrl = (id: string | number, params?: Record<string, unknown>): string => {
  // allow overriding the default values e.g. translations
  const apiParams = { ...DEFAULT_VERSES_PARAMS, ...params };

  return makeUrl(`/verses/by_juz/${id}`, decamelizeKeys(apiParams));
};

/**
 * Compose the url for page's verses API.
 *
 * @param {string} id  the Id of the page.
 * @param {Record<string, unknown>} params  in-case we need to over-ride the default params.
 * @returns {string}
 */
export const makePageVersesUrl = (
  id: string | number,
  params?: Record<string, unknown>,
): string => {
  // allow overriding the default values e.g. translations
  const apiParams = { ...DEFAULT_VERSES_PARAMS, ...params };

  return makeUrl(`/verses/by_page/${id}`, decamelizeKeys(apiParams));
};

/**
 * Compose the url for footnote's API.
 *
 * @param {string} footnoteId
 * @returns {string}
 */
export const makeFootnoteUrl = (footnoteId: string): string => makeUrl(`/foot_notes/${footnoteId}`);
