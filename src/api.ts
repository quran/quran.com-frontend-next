import { camelizeKeys } from 'humps';

import {
  makeAdvancedCopyUrl,
  makeTafsirsUrl,
  makeLanguagesUrl,
  makeAudioTimestampsUrl,
  makeChapterAudioFilesUrl,
  makeRecitersUrl,
  makeSearchResultsUrl,
  makeTranslationsInfoUrl,
  makeTranslationsUrl,
  makeVersesUrl,
  makeJuzVersesUrl,
  makeChapterInfoUrl,
  makePageVersesUrl,
  makeFootnoteUrl,
} from './utils/apiPaths';

import { SearchRequest, AdvancedCopyRequest } from 'types/ApiRequests';
import {
  TranslationsResponse,
  SearchResponse,
  AdvancedCopyRawResultResponse,
  LanguagesResponse,
  RecitersResponse,
  AudioFilesResponse,
  AudioTimestampsResponse,
  TafsirsResponse,
  VersesResponse,
  ChapterInfoResponse,
  FootnoteResponse,
} from 'types/ApiResponses';
import AudioFile from 'types/AudioFile';

export const OFFLINE_ERROR = 'OFFLINE';

export const fetcher = async function fetcher<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  // if the user is not online when making the API call
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    throw new Error(OFFLINE_ERROR);
  }
  const res = await fetch(input, init);
  if (!res.ok || res.status === 500 || res.status === 404) {
    throw res;
  }
  const json = await res.json();
  return camelizeKeys(json);
};

export const getChapterVerses = async (
  id: string | number,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher<VersesResponse>(makeVersesUrl(id, params));

/**
 * Get the current available translations with the name translated in the current language.
 *
 * @param {string} language we use this to get translated names of authors in specific the current language.
 *
 * @returns {Promise<TranslationsResponse>}
 */
export const getAvailableTranslations = async (language: string): Promise<TranslationsResponse> =>
  fetcher(makeTranslationsUrl(language));

/**
 * Get the current available languages with the name translated in the current language.
 *
 * @param {string} language we use this to get language names in specific the current language.
 *
 * @returns {Promise<LanguagesResponse>}
 */
export const getAvailableLanguages = async (language: string): Promise<LanguagesResponse> =>
  fetcher(makeLanguagesUrl(language));

/**
 * Get list of available reciters.
 *
 * @returns {Promise<RecitersResponse>}
 */
export const getAvailableReciters = async (): Promise<RecitersResponse> =>
  fetcher(makeRecitersUrl());

/**
 * Get audio file for a specific reciter and chapter.
 * additionally you can pass `segment: true` to get the timestamps
 * for each verse and words
 *
 * @param {number} reciterId
 * @param {number} chapter the id of the chapter
 */

export const getChapterAudioFile = async (
  reciterId: number,
  chapter: number,
  segments = false,
): Promise<AudioFile> => {
  const res = await fetcher<AudioFilesResponse>(
    makeChapterAudioFilesUrl(reciterId, chapter, segments),
  );

  if (res.error) {
    throw new Error(res.error);
  }
  if (res.status === 500) {
    throw new Error('server error: fail to get audio file');
  }
  const { audioFiles } = res;
  const [firstAudio] = audioFiles;
  if (!firstAudio) {
    throw new Error('No audio file found');
  }

  return firstAudio;
};

/**
 * Get the timestamps for a specific verseKey.
 * We need this to select to move the cursor in the audio player when we click "play" in a specific verse.
 *
 * @param {number} reciterId
 * @param {number} verseKey example "1:1", meaning chapter 1, verse 1
 * @returns {Promise<AudioTimestampsResponse>}
 */
export const getVerseTimestamps = async (
  reciterId: number,
  verseKey: string,
): Promise<AudioTimestampsResponse> => fetcher(makeAudioTimestampsUrl(reciterId, verseKey));

/**
 * Get the information of translations by their IDs.
 *
 * @param {string} locale the current user locale.
 * @param {number[]} translations the ids of the translations selected.
 * @returns {Promise<TranslationsResponse>}
 */
export const getTranslationsInfo = async (
  locale: string,
  translations: number[],
): Promise<TranslationsResponse> => fetcher(makeTranslationsInfoUrl(locale, translations));

/**
 * Get the advanced copy content that will be copied to clipboard and put in a file.
 *
 * @param {AdvancedCopyRequest} params
 * @returns {Promise<AdvancedCopyRawResultResponse>}
 */
export const getAdvancedCopyRawResult = async (
  params: AdvancedCopyRequest,
): Promise<AdvancedCopyRawResultResponse> => fetcher(makeAdvancedCopyUrl(params));

/**
 * Get the search results of a query.
 *
 * @param {SearchRequest} params
 * @returns  {Promise<SearchResponse>}
 */
export const getSearchResults = async (params: SearchRequest): Promise<SearchResponse> =>
  fetcher(makeSearchResultsUrl(params));

/**
 * Get the list of tafsirs.
 *
 * @param {string} language
 * @returns {Promise<TafsirsResponse>}
 */
export const getTafsirs = async (language: string): Promise<TafsirsResponse> =>
  fetcher(makeTafsirsUrl(language));

/**
 * Get a chapter's info
 *
 * @param {string} chapterId
 * @param {string} language
 * @returns {Promise<ChapterInfoResponse>}
 */
export const getChapterInfo = async (
  chapterId: string,
  language: string,
): Promise<ChapterInfoResponse> => fetcher(makeChapterInfoUrl(chapterId, language));

/**
 * Get the verses of a specific Juz.
 *
 * @param {string} id the ID of the Juz.
 * @param {string} params the params that we might need to include that differs from the default ones.
 *
 * @returns {Promise<VersesResponse>}
 */
export const getJuzVerses = async (
  id: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher(makeJuzVersesUrl(id, params));

/**
 * Get the verses of a specific page.
 *
 * @param {string} id the ID of the page.
 * @param {string} params the params that we might need to include that differs from the default ones.
 *
 * @returns {Promise<VersesResponse>}
 */
export const getPageVerses = async (
  id: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher(makePageVersesUrl(id, params));

/**
 * Get the footnote details.
 *
 * @param {string} footnoteId the ID of the footnote.
 *
 * @returns {Promise<FootnoteResponse>}
 */
export const getFootnote = async (footnoteId: string): Promise<FootnoteResponse> =>
  fetcher(makeFootnoteUrl(footnoteId));
