import groupBy from 'lodash/groupBy';

import AvailableTranslation from '@/types/AvailableTranslation';

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
  returnAsString: boolean = true,
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
