import Language from '@/types/Language';
import { makeUrl } from '@/utils/api';

/**
 * Compose the URL for the Qiraat matrix API
 *
 * @param {string} verseKey - The verse key (e.g., "10:35")
 * @param {string} language - Language code (e.g., "en", "ar")
 * @returns {string} API URL string
 */
export const makeQiraatMatrixUrl = (verseKey: string, language: Language): string =>
  makeUrl(`/qiraat/matrix/by_verse/${verseKey}`, { language });

/**
 * Compose the URL for the Qiraat junctures count API
 *
 * @param {{ from: string; to: string }} range - The verse range object with from and to keys
 * @returns {string} API URL string
 */
export const makeQiraatJuncturesCountUrl = (range: { from: string; to: string }): string =>
  makeUrl(`/qiraat/matrix/count_within_range`, {
    from: range.from,
    to: range.to,
  });
