import KalimatResultType from 'types/Kalimat/KalimatResultType';
import { SearchNavigationType } from 'types/SearchNavigationResult';

/**
 * Convert a KalimatResultType to SearchNavigationType.
 *
 * @param {KalimatResultType} type
 * @returns {SearchNavigationType}
 */
export const kalimatResultTypeToSearchNavigationType = (
  type: KalimatResultType,
): SearchNavigationType => {
  if (type === KalimatResultType.QuranJuz) {
    return SearchNavigationType.JUZ;
  }
  if (type === KalimatResultType.QuranPage) {
    return SearchNavigationType.PAGE;
  }
  if (type === KalimatResultType.QuranVerse) {
    return SearchNavigationType.AYAH;
  }
  if (type === KalimatResultType.QuranRange) {
    return SearchNavigationType.RANGE;
  }
  return SearchNavigationType.SURAH;
};

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
    return id.substring(id.indexOf('j') + 1);
  }
  if (type === KalimatResultType.QuranPage) {
    // e.g. p50
    return id.substring(id.indexOf('p') + 1);
  }
  // e.g. 1 or 1:1 which don't need converting
  return id;
};
