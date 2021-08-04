import { camelizeKeys } from 'humps';
import { TranslationsResponse, SearchResponse } from 'types/APIResponses';
import { SearchRequest } from 'types/APIRequests';
import { makeUrl } from './utils/api';
import Chapter from '../types/Chapter';
import Verse from '../types/Verse';
import {
  makeAdvancedCopyUrl,
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
 * Get the information of translations by their IDs.
 *
 * @param {string} language the current user locale.
 * @param {number[]} translations the ids of the translations selected.
 * @returns
 */
export const getTranslationsInfo = async (language: string, translations: number[]) => {
  const payload = await fetcher(makeTranslationsInfoUrl(language, translations));

  return camelizeKeys(payload) as TranslationsResponse;
};

/**
 * Get the advanced copy content that will be copied to clipboard and put in a file.
 *
 * @param {Record<string, unknown>} params
 * @returns
 */
export const getAdvancedCopyContent = async (params: Record<string, unknown>) => {
  const payload = await fetcher(makeAdvancedCopyUrl(params));

  // TODO: (@osama): add request response types
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
