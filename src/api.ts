import { camelizeKeys } from 'humps';
import { TranslationsResponse, VerseResponse } from 'types/APIResponses';
import { makeUrl } from './utils/api';
import Chapter from '../types/Chapter';
import Verse from '../types/Verse';
import { makeTranslationsUrl, makeVerseByKeyUrl, makeVersesUrl } from './utils/apiPaths';

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
 * Get a verse by the chapterId and verseId.
 *
 * @param {string} chapterId
 * @param {string} verseId
 * @param {Record<string,any>} params
 * @returns {Promise<VerseResponse>}
 */
export const getVerseByKey = async (
  chapterId: string,
  verseId: string,
  params?: Record<string, unknown>,
): Promise<VerseResponse> => {
  const payload = await fetcher(makeVerseByKeyUrl(chapterId, verseId, params));

  return camelizeKeys(payload) as VerseResponse;
};
