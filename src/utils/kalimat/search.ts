/* eslint-disable react-func/max-lines-per-function */
import { Translate } from 'next-translate';

import { getChapterData } from '../chapter';
import { toLocalizedNumber } from '../locale';
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey } from '../verse';

import ChaptersData from '@/types/ChaptersData';
import KalimatResultItem from '@/types/Kalimat/KalimatResultItem';
import KalimatResultType from 'types/Kalimat/KalimatResultType';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

const KALIMAT_TO_NAVIGATION_TYPE = {
  [KalimatResultType.QuranJuz]: SearchNavigationType.JUZ,
  [KalimatResultType.QuranPage]: SearchNavigationType.PAGE,
  [KalimatResultType.QuranVerse]: SearchNavigationType.AYAH,
  [KalimatResultType.QuranRange]: SearchNavigationType.RANGE,
  [KalimatResultType.QuranChapter]: SearchNavigationType.SURAH,
};

/**
 * Convert a KalimatResultType to SearchNavigationType.
 *
 * @param {KalimatResultType} type
 * @returns {SearchNavigationType}
 */
export const kalimatResultTypeToSearchNavigationType = (
  type: KalimatResultType,
): SearchNavigationType => KALIMAT_TO_NAVIGATION_TYPE[type];

/**
 * Convert a Kalimat id to navigation key. an example of
 * a Kalimat id is j29 for Juz 29 or p50 for Page 50.
 *
 * @param {type} type
 * @param {string} id
 * @returns {string}
 */
export const kalimatIdToNavigationKey = (type: KalimatResultType, id: string): string => {
  if (type === KalimatResultType.QuranJuz) {
    // e.g. j29
    return getKalimatJuzNumber(id);
  }
  if (type === KalimatResultType.QuranPage) {
    // e.g. p50
    return getKalimatPageNumber(id);
  }
  // e.g. 1 or 1:1 which don't need converting
  return id;
};

export const getKalimatPageNumber = (kalimatId: string) =>
  kalimatId.substring(kalimatId.indexOf('p') + 1);
export const getKalimatJuzNumber = (kalimatId: string) =>
  kalimatId.substring(kalimatId.indexOf('j') + 1);

export const getSearchNavigationResult = (
  chaptersData: ChaptersData,
  result: KalimatResultItem,
  t: Translate,
  locale: string,
): SearchNavigationResult => {
  const { id, type } = result;
  if (type === KalimatResultType.QuranJuz) {
    const juzNumber = getKalimatJuzNumber(id);
    return {
      name: `${t('common:juz')} ${juzNumber}`,
      key: juzNumber,
      resultType: SearchNavigationType.JUZ,
    };
  }
  if (type === KalimatResultType.QuranPage) {
    const pageNumber = getKalimatPageNumber(id);
    return {
      name: `${t('common:page')} ${pageNumber}`,
      key: pageNumber,
      resultType: SearchNavigationType.PAGE,
    };
  }
  if (type === KalimatResultType.QuranRange) {
    const { surah, from, to } = getVerseNumberRangeFromKey(id);
    return {
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surah}`).transliteratedName
      } ${t('common:ayah')} ${toLocalizedNumber(from, locale)} - ${toLocalizedNumber(to, locale)}`,
      key: id,
      resultType: SearchNavigationType.RANGE,
    };
  }
  if (type === KalimatResultType.QuranVerse) {
    const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(id);
    return {
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surahNumber}`).transliteratedName
      }, ${t('common:ayah')} ${toLocalizedNumber(Number(ayahNumber), locale)}`,
      key: id,
      resultType: SearchNavigationType.AYAH,
    };
  }
  // when it's a chapter
  return {
    name: `${t('common:surah')} ${getChapterData(chaptersData, id).transliteratedName}`,
    key: id,
    resultType: SearchNavigationType.SURAH,
  };
};
