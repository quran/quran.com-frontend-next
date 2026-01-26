import Language from '@/types/Language';
import { makeUrl } from '@/utils/api';

/**
 * Get the Qiraat language code based on the input language
 *
 * @param {Language} language - The input language
 * @returns {Language} The Qiraat language code
 */
export const getQiraatLanguage = (language: Language): Language => {
  return language === Language.AR ? Language.AR : Language.EN;
};

/**
 * Compose the URL for the Qiraat matrix API
 *
 * @param {string} verseKey - The verse key (e.g., "10:35")
 * @param {string} language - Language code (e.g., "en", "ar")
 * @returns {string} API URL string
 */
export const makeQiraatMatrixUrl = (verseKey: string, language: Language): string =>
  makeUrl(`/qiraat/matrix/by_verse/${verseKey}`, { language: getQiraatLanguage(language) });

/**
 * Compose the URL for the Qiraat junctures count API
 *
 * @param {{ from: string; to: string }} range - The verse range object with from and to keys
 * @param {Language} language - Language code (e.g., "en", "ar")
 * @returns {string} API URL string
 */
export const makeQiraatJuncturesCountUrl = (
  range: { from: string; to: string },
  language: Language,
): string =>
  makeUrl(`/qiraat/matrix/count-within-range`, {
    from: range.from,
    to: range.to,
    language: getQiraatLanguage(language),
  });
