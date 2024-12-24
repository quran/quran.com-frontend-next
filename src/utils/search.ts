/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { Dispatch } from 'react';

import groupBy from 'lodash/groupBy';
import { Translate } from 'next-translate';
import { AnyAction } from 'redux';

import { logEmptySearchResults, logSearchResults, logTextSearchQuery } from './eventLogger';

import { getNewSearchResults, getSearchResults } from '@/api';
import { addSearchHistoryRecord } from '@/redux/slices/Search/search';
import { SearchResponse } from '@/types/ApiResponses';
import AvailableTranslation from '@/types/AvailableTranslation';
import ChaptersData from '@/types/ChaptersData';
import { SearchMode } from '@/types/Search/SearchRequestParams';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey } from '@/utils/verse';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

export const LOCALE_TO_TRANSLATION_LANGUAGE = {
  en: 'english',
  ar: 'arabic',
  bn: 'bengali',
  fa: 'persian',
  fr: 'french',
  id: 'indonesian',
  it: 'italian',
  nl: 'dutch',
  pt: 'portuguese',
  ru: 'russian',
  sq: 'albanian',
  th: 'thai',
  tr: 'turkish',
  ur: 'urdu',
  zh: 'chinese',
  ms: 'malay',
};

/**
 * Given a list of translations, group them by language
 * after converting the language name to lowercase to account
 * for case differences e.g. "dutch", "Dutch"
 *
 * @param {AvailableTranslation[]} translations
 * @returns {Record<string, AvailableTranslation[]>}
 */
export const getTranslationsByLanguages = (
  translations: AvailableTranslation[],
): Record<string, AvailableTranslation[]> => {
  const translationByLanguages = groupBy(translations, (translation) =>
    translation.languageName.toLowerCase(),
  );
  return translationByLanguages;
};

/**
 * Get the default translation ids for the passed language.
 *
 * @param {AvailableTranslation[]} translations
 * @param {string} lang
 * @param {boolean} returnAsString
 * @returns {string | string[]}
 */
export const getDefaultTranslationIdsByLang = (
  translations: AvailableTranslation[],
  lang: string,
  returnAsString = true,
): string | string[] => {
  const translationsByLanguages = getTranslationsByLanguages(translations);
  let translationIds: string[] = [];
  // If the language is in the map, return list of its translation ids
  if (translationsByLanguages[LOCALE_TO_TRANSLATION_LANGUAGE[lang]]) {
    translationIds = translationsByLanguages[LOCALE_TO_TRANSLATION_LANGUAGE[lang]].map(
      (translation) => translation.id.toString(),
    );
  }
  if (returnAsString) {
    return translationIds.join(',');
  }
  return translationIds;
};

/**
 * Convert a search id to navigation key. an example of
 * a search id is j29 for Juz 29 or p50 for Page 50.
 *
 * @param {type} type
 * @param {string} id
 * @returns {string}
 */
export const searchIdToNavigationKey = (type: SearchNavigationType, id: string): string => {
  if (type === SearchNavigationType.JUZ) {
    // e.g. j29
    return idToJuzNumber(id);
  }

  if (type === SearchNavigationType.PAGE) {
    // e.g. p50
    return idToPageNumber(id);
  }

  // e.g. 1 or 1:1 which don't need converting
  return id;
};

export const idToPageNumber = (id: string) => id.substring(id.indexOf('p') + 1);
export const idToJuzNumber = (id: string) => id.substring(id.indexOf('j') + 1);

export const getSearchNavigationResult = (
  chaptersData: ChaptersData,
  result: SearchNavigationResult,
  t: Translate,
  locale: string,
): SearchNavigationResult & { name: string } => {
  const { key, resultType } = result;

  if (resultType === SearchNavigationType.JUZ) {
    const juzNumber = idToJuzNumber(key as string);

    return {
      name: `${t('common:juz')} ${toLocalizedNumber(Number(juzNumber), locale)}`,
      key: juzNumber,
      resultType: SearchNavigationType.JUZ,
    };
  }

  if (resultType === SearchNavigationType.PAGE) {
    const pageNumber = idToPageNumber(key as string);

    return {
      name: `${t('common:page')} ${toLocalizedNumber(Number(pageNumber), locale)}`,
      key: pageNumber,
      resultType: SearchNavigationType.PAGE,
    };
  }

  if (resultType === SearchNavigationType.RANGE) {
    const { surah, from, to } = getVerseNumberRangeFromKey(key as string);
    return {
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surah}`).transliteratedName
      } ${t('common:ayah')} ${toLocalizedNumber(from, locale)} - ${toLocalizedNumber(to, locale)}`,
      key,
      resultType: SearchNavigationType.RANGE,
    };
  }

  if (resultType === SearchNavigationType.AYAH) {
    const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(key as string);
    return {
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surahNumber}`).transliteratedName
      }, ${t('common:ayah')} ${toLocalizedNumber(Number(ayahNumber), locale)}`,
      key,
      resultType: SearchNavigationType.AYAH,
    };
  }

  // when it's a chapter
  return {
    name: `${t('common:surah')} ${getChapterData(chaptersData, key as string).transliteratedName}`,
    key,
    resultType: SearchNavigationType.SURAH,
  };
};

/**
 * Call BE to fetch the search results using the passed filters
 * and if there are no results call Kalimat API.
 *
 * @param {SearchQuerySource} source
 * @param {string} query
 * @param {number} page
 * @param {number} pageSize
 * @param {(arg: boolean) => void} setIsSearching
 * @param {(arg: boolean) => void} setHasError
 * @param {(data: SearchResponse) => void} setSearchResult
 * @param {string} languages
 * @param {string} translations
 */
export const searchGetResults = (
  source: SearchQuerySource,
  query: string,
  page: number,
  pageSize: number,
  setIsSearching: (arg: boolean) => void,
  setHasError: (arg: boolean) => void,
  setSearchResult: (data: SearchResponse) => void,
  languages?: string,
  translations?: string,
) => {
  setIsSearching(true);
  logTextSearchQuery(query, source);
  getSearchResults({
    query,
    ...(languages && { filterLanguages: languages }), // languages will be included only when there is a selected language
    size: pageSize,
    page,
    ...(translations && { filterTranslations: translations }), // translations will be included only when there is a selected translation
  })
    .then(async (response) => {
      if (response.status === 500) {
        setHasError(true);
      } else {
        setSearchResult({ ...response, service: SearchService.QDC });
        const noQdcResults =
          response.pagination.totalRecords === 0 && !response.result.navigation.length;
        // if there is no navigations nor verses in the response
        if (noQdcResults) {
          logEmptySearchResults({
            query,
            source,
            service: SearchService.QDC,
          });

          const kalimatResponse = await getNewSearchResults({
            mode: SearchMode.Advanced,
            query,
            size: pageSize,
            filterLanguages: languages,
            page,
            exactMatchesOnly: 0,
            // translations will be included only when there is a selected translation
            ...(translations && {
              filterTranslations: translations,
              translationFields: 'resource_name',
            }),
          });

          setSearchResult({
            ...kalimatResponse,
            service: SearchService.KALIMAT,
          });

          if (kalimatResponse.pagination.totalRecords === 0) {
            logEmptySearchResults({
              query,
              source,
              service: SearchService.KALIMAT,
            });
          } else {
            logSearchResults({
              query,
              source,
              service: SearchService.KALIMAT,
            });
          }
        }
      }
    })
    .catch(() => {
      setHasError(true);
    })
    .finally(() => {
      setIsSearching(false);
    });
};

/**
 * Adds the searched text to the recent history.
 *
 * @param {Dispatch<AnyAction>} dispatch
 * @param {string} debouncedSearchQuery
 * @param {SearchQuerySource} source
 */
export const addToSearchHistory = (
  dispatch: Dispatch<AnyAction>,
  debouncedSearchQuery: string,
  source: SearchQuerySource,
) => {
  dispatch({ type: addSearchHistoryRecord.type, payload: debouncedSearchQuery });
  logTextSearchQuery(debouncedSearchQuery, source);
};
