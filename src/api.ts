/* eslint-disable max-lines */
import { camelizeKeys } from 'humps';

import {
  makeAdvancedCopyUrl,
  makeTafsirsUrl,
  makeLanguagesUrl,
  makeAudioTimestampsUrl,
  makeChapterAudioDataUrl,
  makeAvailableRecitersUrl,
  makeSearchResultsUrl,
  makeTranslationsInfoUrl,
  makeTranslationsUrl,
  makeVersesUrl,
  makeJuzVersesUrl,
  makeRubVersesUrl,
  makeHizbVersesUrl,
  makeChapterInfoUrl,
  makePageVersesUrl,
  makeFootnoteUrl,
  makeChapterUrl,
  makeReciterUrl,
  makeTafsirContentUrl,
  makePagesLookupUrl,
} from '@/utils/apiPaths';
import { SearchRequest, AdvancedCopyRequest, PagesLookUpRequest } from 'types/ApiRequests';
import {
  TranslationsResponse,
  SearchResponse,
  AdvancedCopyRawResultResponse,
  LanguagesResponse,
  RecitersResponse,
  AudioDataResponse,
  AudioTimestampsResponse,
  TafsirsResponse,
  VersesResponse,
  ChapterInfoResponse,
  FootnoteResponse,
  ChapterResponse,
  ReciterResponse,
  TafsirContentResponse,
  PagesLookUpResponse,
} from 'types/ApiResponses';
import AudioData from 'types/AudioData';
import { MushafLines, QuranFont } from 'types/QuranReader';

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
  locale: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher<VersesResponse>(makeVersesUrl(id, locale, params));

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
 * @param {string} locale  the locale.
 *
 * @returns {Promise<RecitersResponse>}
 */
export const getAvailableReciters = async (
  locale: string,
  fields?: string[],
): Promise<RecitersResponse> => fetcher(makeAvailableRecitersUrl(locale, fields));

export const getReciterData = async (reciterId: string, locale: string): Promise<ReciterResponse> =>
  fetcher(makeReciterUrl(reciterId, locale));

/**
 * Get audio file for a specific reciter and chapter.
 * additionally you can pass `segment: true` to get the timestamps
 * for each verse and words
 *
 * @param {number} reciterId
 * @param {number} chapter the id of the chapter
 */

export const getChapterAudioData = async (
  reciterId: number,
  chapter: number,
  segments = false,
): Promise<AudioData> => {
  const res = await fetcher<AudioDataResponse>(
    makeChapterAudioDataUrl(reciterId, chapter, segments),
  );

  if (res.error) {
    throw new Error(res.error);
  }
  if (res.status === 500) {
    throw new Error('server error: fail to get audio file');
  }
  const { audioFiles: audioData } = res;
  const [firstAudio] = audioData;
  if (!firstAudio) {
    throw new Error('No audio file found');
  }

  return {
    ...firstAudio,
    reciterId,
  };
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
 * Get a chapter's.
 *
 * @param {string} chapterIdOrSlug
 * @param {string} language
 * @returns {Promise<ChapterInfoResponse>}
 */
export const getChapter = async (
  chapterIdOrSlug: string,
  language: string,
): Promise<ChapterResponse> => fetcher(makeChapterUrl(chapterIdOrSlug, language));

/**
 * Get the verses of a specific Juz.
 *
 * @param {string} id the ID of the Juz.
 * @param {string} locale  the locale.
 * @param {string} params the params that we might need to include that differs from the default ones.
 *
 * @returns {Promise<VersesResponse>}
 */
export const getJuzVerses = async (
  id: string,
  locale: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher(makeJuzVersesUrl(id, locale, params));

/**
 * Get the verses of a specific Rub El Hizb.
 *
 * @param {string} id the ID of the Rub El Hizb.
 * @param {string} locale  the locale.
 * @param {string} params the params that we might need to include that differs from the default ones.
 *
 * @returns {Promise<VersesResponse>}
 */
export const getRubVerses = async (
  id: string,
  locale: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher(makeRubVersesUrl(id, locale, params));

/**
 * Get the verses of a specific Hizb.
 *
 * @param {string} id the ID of the Hizb.
 * @param {string} locale  the locale.
 * @param {string} params the params that we might need to include that differs from the default ones.
 *
 * @returns {Promise<VersesResponse>}
 */
export const getHizbVerses = async (
  id: string,
  locale: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher(makeHizbVersesUrl(id, locale, params));

/**
 * Get the verses of a specific page.
 *
 * @param {string} id the ID of the page.
 * @param {string} locale  the locale.
 * @param {string} params the params that we might need to include that differs from the default ones.
 *
 * @returns {Promise<VersesResponse>}
 */
export const getPageVerses = async (
  id: string,
  locale: string,
  params?: Record<string, unknown>,
): Promise<VersesResponse> => fetcher(makePageVersesUrl(id, locale, params));

/**
 * Get the footnote details.
 *
 * @param {string} footnoteId the ID of the footnote.
 *
 * @returns {Promise<FootnoteResponse>}
 */
export const getFootnote = async (footnoteId: string): Promise<FootnoteResponse> =>
  fetcher(makeFootnoteUrl(footnoteId));

/**
 * Get the footnote details.
 *
 * @param {PagesLookUpRequest} params
 *
 * @returns {Promise<PagesLookUpResponse>}
 */
export const getPagesLookup = async (params: PagesLookUpRequest): Promise<PagesLookUpResponse> =>
  fetcher(makePagesLookupUrl(params));

/**
 * Get the chapter id by a slug.
 *
 * @param {string} slug
 * @param {string} locale
 * @returns {Promise<false|string>}
 */
export const getChapterIdBySlug = async (slug: string, locale: string): Promise<false | string> => {
  try {
    const chapterResponse = await getChapter(encodeURI(slug), locale);
    return chapterResponse.chapter.id as string;
  } catch (error) {
    return false;
  }
};

/**
 * Get the Tafsir content of a verse by the tafsir ID.
 *
 * @param {string} tafsirIdOrSlug
 * @param {string} verseKey
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @returns {Promise<TafsirContentResponse>}
 */
export const getTafsirContent = (
  tafsirIdOrSlug: string,
  verseKey: string,
  quranFont: QuranFont,
  mushafLines: MushafLines,
  locale: string,
): Promise<TafsirContentResponse> => {
  return fetcher(
    makeTafsirContentUrl(tafsirIdOrSlug as string, verseKey, {
      lang: locale,
      quranFont,
      mushafLines,
    }),
  );
};
