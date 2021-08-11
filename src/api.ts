import { camelizeKeys } from 'humps';
import {
  TranslationsResponse,
  SearchResponse,
  AdvancedCopyRawResultResponse,
  LanguagesResponse,
  RecitersResponse,
  ReciterAudioResponse,
  AudioTimestampResponse,
} from 'types/APIResponses';
import { SearchRequest, AdvancedCopyRequest } from 'types/APIRequests';
import { makeUrl } from './utils/api';
import Chapter from '../types/Chapter';
import Verse from '../types/Verse';
import {
  makeAdvancedCopyUrl,
  makeLanguagesUrl,
  makeReciterAudioTimestampUrl,
  makeReciterAudioUrl,
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
) => {
  return fetcher(makeVersesUrl(id, params));
};

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
 * Get the current available reciters with the name translated in the current language.
 *
 * @returns {Promise<RecitersResponse>}
 */
export const getAvailableReciters = async (): Promise<RecitersResponse> => {
  const payload = await fetcher(makeRecitersUrl());

  return camelizeKeys(payload) as RecitersResponse;
};

export const getReciterAudio = async (
  reciterId: number,
  chapter,
): Promise<ReciterAudioResponse> => {
  const payload = await fetcher(makeReciterAudioUrl(reciterId, chapter));

  return camelizeKeys(payload) as ReciterAudioResponse;
};

export const getVerseAudioTimestamp = async (
  reciterId: number,
  verseKey,
): Promise<AudioTimestampResponse> => {
  const payload = await fetcher(makeReciterAudioTimestampUrl(reciterId, verseKey));
  return camelizeKeys(payload) as AudioTimestampResponse;
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
