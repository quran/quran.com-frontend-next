/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { Dispatch } from 'react';

import groupBy from 'lodash/groupBy';
import { Translate } from 'next-translate';
import { AnyAction } from 'redux';

import { logTextSearchQuery } from './eventLogger';

import { addSearchHistoryRecord } from '@/redux/slices/Search/search';
import AvailableTranslation from '@/types/AvailableTranslation';
import ChaptersData from '@/types/ChaptersData';
import { SearchMode, SearchRequestParams } from '@/types/Search/SearchRequestParams';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey } from '@/utils/verse';
import { SearchNavigationResult, SearchNavigationType } from 'types/Search/SearchNavigationResult';

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
): SearchNavigationResult => {
  const { key, isArabic, isTransliteration } = result;
  const resultType = getResultType(result);
  const resultSuffix = getResultSuffix(resultType, key as string, locale, chaptersData);
  let returnedResult = {
    isTransliteration,
    isArabic,
    resultType,
    key,
  } as SearchNavigationResult;

  if (resultType === SearchNavigationType.JUZ) {
    const juzNumber = idToJuzNumber(key as string);

    returnedResult = {
      ...returnedResult,
      name: `${t('common:juz')} ${toLocalizedNumber(Number(juzNumber), locale)}`,
      key: juzNumber,
    };
  }

  if (resultType === SearchNavigationType.PAGE) {
    const pageNumber = idToPageNumber(key as string);

    returnedResult = {
      ...returnedResult,
      name: `${t('common:page')} ${toLocalizedNumber(Number(pageNumber), locale)}`,
      key: pageNumber,
    };
  }

  if (resultType === SearchNavigationType.RUB_EL_HIZB) {
    returnedResult = {
      ...returnedResult,
      name: `${t('common:rub')} ${toLocalizedNumber(Number(key), locale)}`,
    };
  }

  if (resultType === SearchNavigationType.HIZB) {
    returnedResult = {
      ...returnedResult,
      name: `${t('common:hizb')} ${toLocalizedNumber(Number(key), locale)}`,
    };
  }

  if (resultType === SearchNavigationType.RANGE) {
    const { surah, from, to } = getVerseNumberRangeFromKey(key as string);
    returnedResult = {
      ...returnedResult,
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surah}`).transliteratedName
      } ${t('common:ayah')} ${toLocalizedNumber(from, locale)} - ${toLocalizedNumber(to, locale)}`,
    };
  }

  if (
    resultType === SearchNavigationType.AYAH ||
    resultType === SearchNavigationType.TRANSLITERATION ||
    resultType === SearchNavigationType.TRANSLATION
  ) {
    returnedResult = {
      ...returnedResult,
      name: result.name,
    };
  }

  if (resultType === SearchNavigationType.SURAH) {
    returnedResult = {
      ...returnedResult,
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, key as string).transliteratedName
      }`,
    };
  }

  return { ...returnedResult, name: `${returnedResult.name} ${resultSuffix}` };
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

/**
 * Get the quick search query.
 *
 * @param {string} query
 * @param {number} perPage
 * @param {string[]} selectedTranslationIds
 * @returns {SearchRequestParams<SearchMode.Quick>}
 */
export const getQuickSearchQuery = (
  query: string,
  perPage = 10,
  selectedTranslationIds: string[] = [],
): SearchRequestParams<SearchMode.Quick> => {
  return {
    mode: SearchMode.Quick,
    query,
    getText: 1,
    highlight: 1,
    perPage,
    translationIds: selectedTranslationIds.join(','),
  };
};

/**
 * Get the advanced search query.
 *
 * @param {string} query
 * @param {number} page
 * @param {number} pageSize
 * @param {string[]} selectedTranslationIds
 * @returns {SearchRequestParams<SearchMode.Advanced>}
 */
export const getAdvancedSearchQuery = (
  query: string,
  page: number,
  pageSize: number,
  selectedTranslationIds: string[] = [],
): SearchRequestParams<SearchMode.Advanced> => {
  return {
    mode: SearchMode.Advanced,
    query,
    size: pageSize,
    page,
    exactMatchesOnly: 0,
    getText: 1,
    highlight: 1,
    translationIds: selectedTranslationIds.join(','),
  };
};

export const getResultType = (result: SearchNavigationResult) => {
  const { resultType, isArabic, isTransliteration } = result;
  if (resultType === SearchNavigationType.AYAH) {
    if (isArabic) {
      return SearchNavigationType.AYAH;
    }
    if (isTransliteration) {
      return SearchNavigationType.TRANSLITERATION;
    }
    return SearchNavigationType.TRANSLATION;
  }
  return resultType;
};

export const getResultSuffix = (
  type: SearchNavigationType,
  resultKey: string,
  lang: string,
  chaptersData: ChaptersData,
) => {
  const [surahNumber] = getVerseAndChapterNumbersFromKey(resultKey as string);
  if (type === SearchNavigationType.SURAH) {
    return `- ${toLocalizedNumber(Number(surahNumber), lang)}`;
  }

  if (
    type === SearchNavigationType.AYAH ||
    type === SearchNavigationType.TRANSLITERATION ||
    type === SearchNavigationType.TRANSLATION
  ) {
    return `(${
      getChapterData(chaptersData, `${surahNumber}`).transliteratedName
    } ${toLocalizedVerseKey(resultKey as string, lang)})`;
  }

  return '';
};
