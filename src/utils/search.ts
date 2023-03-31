/* eslint-disable react-func/max-lines-per-function */
import { Translate } from 'next-translate';

import ChaptersData from '@/types/ChaptersData';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey } from '@/utils/verse';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

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
    const juzNumber = idToJuzNumber(key);

    return {
      name: `${t('common:juz')} ${toLocalizedNumber(Number(juzNumber), locale)}`,
      key: juzNumber,
      resultType: SearchNavigationType.JUZ,
    };
  }

  if (resultType === SearchNavigationType.PAGE) {
    const pageNumber = idToPageNumber(key);

    return {
      name: `${t('common:page')} ${toLocalizedNumber(Number(pageNumber), locale)}`,
      key: pageNumber,
      resultType: SearchNavigationType.PAGE,
    };
  }

  if (resultType === SearchNavigationType.RANGE) {
    const { surah, from, to } = getVerseNumberRangeFromKey(key);
    return {
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surah}`).transliteratedName
      } ${t('common:ayah')} ${toLocalizedNumber(from, locale)} - ${toLocalizedNumber(to, locale)}`,
      key,
      resultType: SearchNavigationType.RANGE,
    };
  }

  if (resultType === SearchNavigationType.AYAH) {
    const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(key);
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
    name: `${t('common:surah')} ${getChapterData(chaptersData, key).transliteratedName}`,
    key,
    resultType: SearchNavigationType.SURAH,
  };
};
