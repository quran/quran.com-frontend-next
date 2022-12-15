import KalimatResultType from 'types/Kalimat/KalimatResultType';
import { SearchNavigationType } from 'types/SearchNavigationResult';

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
