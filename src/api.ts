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
  ChapterResponse,
  ChaptersResponse,
  VersesResponse,
  BaseResponse,
  ChapterInfoResponse,
  FootnoteResponse,
} from 'types/APIResponses';
import { SearchRequest, AdvancedCopyRequest } from 'types/APIRequests';
import { AudioFile } from 'types/AudioFile';
import { makeUrl } from './utils/api';
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
  makeJuzVersesUrl,
  makeChapterInfoUrl,
  makePageVersesUrl,
  makeFootnoteUrl,
} from './utils/apiPaths';

export const fetcher = async function fetcher(
  input: RequestInfo,
  init?: RequestInit,
): Promise<BaseResponse> {
  const res = await fetch(input, init);
  return res.json();
};

export const getChapters = async (): Promise<ChaptersResponse> => {
  const payload = await fetcher(makeUrl(`/chapters`));

  return camelizeKeys(payload);
};

export const getChapter = async (
  id: string | number,
  language: string,
): Promise<ChapterResponse> => {
  const payload = await fetcher(makeUrl(`/chapters/${id}`, { language }));

  return camelizeKeys(payload);
};

export const getChapterVerses = async (
  id: string | number,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => {
  const payload = await fetcher(makeVersesUrl(id, params));
  // TODO (@abdellatif): parameterize the default translation

  return camelizeKeys(payload);
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

  return camelizeKeys(payload);
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

  return camelizeKeys(payload);
};

/**
 * Get list of available reciters.
 *
 * @returns {Promise<RecitersResponse>}
 */
export const getAvailableReciters = async (): Promise<RecitersResponse> => {
  const payload = await fetcher(makeRecitersUrl());

  return camelizeKeys(payload);
};

/**
 * Get audio file for a specific reciter and chapter.
 * @param {number} reciterId
 * @param {number} chapter the id of the chapter
 */

export const getAudioFile = async (reciterId: number, chapter: number): Promise<AudioFile> => {
  const payload = await fetcher(makeAudioFilesUrl(reciterId, chapter));

  const res = camelizeKeys(payload) as AudioFilesResponse;

  if (res.error) {
    throw new Error(res.error);
  }
  if (res.status === 500) {
    throw new Error('server error: fail to get audio file');
  }

  const firstAudio = res.audioFiles[0];
  if (!firstAudio) {
    throw new Error('No audio file found');
  }

  return firstAudio;
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
  return camelizeKeys(payload);
};

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
): Promise<TranslationsResponse> => {
  const payload = await fetcher(makeTranslationsInfoUrl(locale, translations));

  return camelizeKeys(payload);
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

  return camelizeKeys(payload);
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
): Promise<ChapterInfoResponse> => {
  const payload = await fetcher(makeChapterInfoUrl(chapterId, language));

  return camelizeKeys(payload);
};

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
): Promise<VersesResponse> => {
  const payload = await fetcher(makeJuzVersesUrl(id, params));
  return camelizeKeys(payload);
};

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
): Promise<VersesResponse> => {
  const payload = await fetcher(makePageVersesUrl(id, params));
  return camelizeKeys(payload);
};

/**
 * Get the footnote details.
 *
 * @param {string} footnoteId the ID of the footnote.
 *
 * @returns {Promise<FootnoteResponse>}
 */
export const getFootnote = async (footnoteId: string): Promise<FootnoteResponse> => {
  const payload = await fetcher(makeFootnoteUrl(footnoteId));
  return camelizeKeys(payload);
};
