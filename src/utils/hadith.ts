import {
  AyahHadithsBackendResponse,
  AyahHadithsResponse,
  HadithCollectionResponse,
  HadithReference,
} from '@/types/Hadith';
import Language from '@/types/Language';
import { makeUrl } from '@/utils/api';

/**
 * Get the language for hadith API.
 * Hadith API only supports Arabic or English.
 * If the language is Arabic, return Arabic. Otherwise, return English.
 *
 * @param {Language} language - The language to get hadiths in
 * @returns {Language} - The language to use (either 'ar' or 'en')
 */
const getHadithLanguage = (language: Language): Language => {
  return language === Language.AR ? language : Language.EN;
};

/**
 * Transform a single hadith collection response to the frontend structure
 *
 * @param {HadithCollectionResponse} hadith - Backend hadith response
 * @param {Language} language - The target language
 * @returns {HadithReference} - Transformed hadith reference
 */
const transformHadith = (hadith: HadithCollectionResponse, language: Language): HadithReference => {
  const arHadith = hadith.hadith.find((h) => h.lang === 'ar');
  const enHadith = hadith.hadith.find((h) => h.lang === 'en');

  if (language === Language.AR) {
    return { ...hadith, grades: arHadith?.grades || [], ar: arHadith };
  }

  return { ...hadith, grades: enHadith?.grades || [], ar: arHadith, en: enHadith };
};

/**
 * Transform backend hadith response to frontend structure
 *
 * @param {AyahHadithsBackendResponse} backendResponse - Raw backend response
 * @param {Language} language - The target language
 * @returns {AyahHadithsResponse} - Transformed response for frontend
 */
export const transformHadithResponse = (
  backendResponse: AyahHadithsBackendResponse,
  language: Language,
): AyahHadithsResponse => {
  const lang = getHadithLanguage(language);

  // Incase if this response is error response
  if (!Array.isArray(backendResponse.hadiths)) {
    return backendResponse as unknown as AyahHadithsResponse;
  }

  return {
    ...backendResponse,
    hadiths: backendResponse.hadiths.map((hadith) => transformHadith(hadith, lang)),
  };
};

/**
 * Compose the URL for fetching hadiths for a specific ayah
 *
 * @param {string} ayahKey - The ayah key (e.g., "96:1")
 * @param {Language} language - Language code
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of hadiths per page
 * @returns {string} API URL string
 */
export const makeHadithsByAyahUrl = (
  ayahKey: string,
  language: Language,
  page = 1,
  limit = 4,
): string =>
  makeUrl(`/hadith_references/by_ayah/${ayahKey}/hadiths`, {
    language: getHadithLanguage(language),
    page,
    limit,
  });

/**
 * Compose the URL for counting hadith references within a verse range
 *
 * @param {string} from - Starting verse key (e.g., "74:1")
 * @param {string} to - Ending verse key (e.g., "74:5")
 * @param {Language} language - Language code
 * @returns {string} API URL string
 */
export const makeHadithCountWithinRangeUrl = (
  from: string,
  to: string,
  language: Language,
): string =>
  makeUrl(`/hadith_references/count_within_range`, {
    from,
    to,
    language: getHadithLanguage(language),
  });
