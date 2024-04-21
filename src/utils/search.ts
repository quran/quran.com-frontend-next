/* eslint-disable react-func/max-lines-per-function */
import groupBy from 'lodash/groupBy';
import { Translate } from 'next-translate';

import AvailableTranslation from '@/types/AvailableTranslation';
import ChaptersData from '@/types/ChaptersData';
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
