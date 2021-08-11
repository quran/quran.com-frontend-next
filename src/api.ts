import { camelizeKeys } from 'humps';
import {
  TranslationsResponse,
  SearchResponse,
  AdvancedCopyRawResultResponse,
  LanguagesResponse,
  RecitersResponse,
  AudioFilesResponse,
  AudioTimestampsResponse,
  TafsirsResponse,
} from 'types/APIResponses';
import { SearchRequest, AdvancedCopyRequest } from 'types/APIRequests';
import { makeUrl } from './utils/api';
import Chapter from '../types/Chapter';
import Verse from '../types/Verse';
import {
  makeAdvancedCopyUrl,
  makeTafsirsUrl,
  makeLanguagesUrl,
  makeAudioTimestampsUrl,
  makeAudioFilesUrl,
  makeRecitersUrl,
  makeSearchResultsUrl,
  makeTranslationsInfoUrl,
  makeTranslationsUrl,
  makeVersesUrl,
} from './utils/apiPaths';

export const fetcher = async function fetcher(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  return res.json();
};

export const getChapters = async () => {
  const payload = await fetcher(makeUrl(`/chapters`));

  return camelizeKeys(payload) as { chapters: Chapter[] };
};

export const getChapter = async (id: string | number) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}`));

  return camelizeKeys(payload) as {
    chapter: Chapter;
    status?: number;
    error?: string;
  };
};

export const getChapterInfo = async (id: string | number) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}/info`));

  return camelizeKeys(payload);
};

export const getChapterVerses = async (id: string | number, params?: Record<string, unknown>) => {
  const payload = await fetcher(makeVersesUrl(id, params));
  // TODO (@abdellatif): parameterize the default translation

  return camelizeKeys(payload) as {
    verses: Verse[];
    status?: number;
    error?: string;
  };
};

export const getChapterVersesResponse = async (
  id: string | number,
  params?: Record<string, unknown>,
) => fetcher(makeVersesUrl(id, params));

/**
 * Get the current available translations with the name translated in the current language.
 *
 * @param {string} language we use this to get translated names of authors in specific the current language.
 *
 * @returns {Promise<TranslationsResponse>}
 */
export const getAvailableTranslations = async (language: string): Promise<TranslationsResponse> => {
  const payload = await fetcher(makeTranslationsUrl(language));

  return camelizeKeys(payload) as TranslationsResponse;
};

/**
 * Get the current available languages with the name translated in the current language.
 *
 * @param {string} language we use this to get language names in specific the current language.
 *
 * @returns {Promise<LanguagesResponse>}
 */
export const getAvailableLanguages = async (language: string): Promise<LanguagesResponse> => {
  const payload = await fetcher(makeLanguagesUrl(language));

  return camelizeKeys(payload) as LanguagesResponse;
};

/**
 * Get list of available reciters.
 *
 * @returns {Promise<RecitersResponse>}
 */
export const getAvailableReciters = async (): Promise<RecitersResponse> => {
  const payload = await fetcher(makeRecitersUrl());

  return camelizeKeys(payload) as RecitersResponse;
};

/**
 * Get audio file for a specific reciter and chapter.
 * @param {number} reciterId
 * @param {number} chapter the id of the chapter
 */

export const getAudioFile = async (
  reciterId: number,
  chapter: number,
): Promise<AudioFilesResponse> => {
  const payload = await fetcher(makeAudioFilesUrl(reciterId, chapter));

  return camelizeKeys(payload) as AudioFilesResponse;
};

/**
 * Get the timestamps for a specific verseKey. 
 * We need this to select to move the cursor in the audio player when we click "play" in a specific verse.

 * @param {number} reciterId 
 * @param {number} verseKey example "1:1", meaning chapter 1, verse 1
 */
export const getVerseTimestamps = async (
  reciterId: number,
  verseKey: string,
): Promise<AudioTimestampsResponse> => {
  const payload = await fetcher(makeAudioTimestampsUrl(reciterId, verseKey));
  return camelizeKeys(payload) as AudioTimestampsResponse;
};

/**
 * Get the information of translations by their IDs.
 *
 * @param {string} locale the current user locale.
 * @param {number[]} translations the ids of the translations selected.
 * @returns
 */
export const getTranslationsInfo = async (locale: string, translations: number[]) => {
  const payload = await fetcher(makeTranslationsInfoUrl(locale, translations));

  return camelizeKeys(payload) as TranslationsResponse;
};

/**
 * Get the advanced copy content that will be copied to clipboard and put in a file.
 *
 * @param {AdvancedCopyRequest} params
 * @returns {Promise<AdvancedCopyRawResultResponse>}
 */
export const getAdvancedCopyRawResult = async (
  params: AdvancedCopyRequest,
): Promise<AdvancedCopyRawResultResponse> => {
  const payload = await fetcher(makeAdvancedCopyUrl(params));

  return camelizeKeys(payload);
};

/**
 * Get the search results of a query.
 *
 * @param {SearchRequest} params
 * @returns  {Promise<SearchResponse>}
 */
export const getSearchResults = async (params: SearchRequest): Promise<SearchResponse> => {
  const payload = await fetcher(makeSearchResultsUrl(params));

  return camelizeKeys(payload) as SearchResponse;
};

/**
 * Get the list of tafsirs.
 *
 * @param {string} language
 * @returns {Promise<TafsirsResponse>}
 */
export const getTafsirs = async (language: string): Promise<TafsirsResponse> => {
  const payload = await fetcher(makeTafsirsUrl(language));

  return camelizeKeys(payload);
};
