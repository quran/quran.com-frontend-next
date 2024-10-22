import Fuse from 'fuse.js';

import AvailableTranslation from 'types/AvailableTranslation';

const filterTranslations = (
  translations: AvailableTranslation[],
  searchQuery: string,
): AvailableTranslation[] => {
  const fuse = new Fuse(translations, {
    keys: ['name', 'languageName', 'authorName', 'translatedName.name'],
    threshold: 0.3,
  });

  const filteredTranslations = fuse.search(searchQuery).map(({ item }) => item);
  return filteredTranslations;
};

/**
 * Transforms an array of translations by converting the language name to lowercase.
 * This is to temporarily fix the issue when BE returns the same language names
 * but in different cases (e.g. 'Dutch' and 'dutch').
 *
 * @param {AvailableTranslation[]} translations - The array of translations to be transformed.
 * @returns {AvailableTranslation[]} The transformed array of translations with language names in lowercase.
 */
export const getTranslations = (translations: AvailableTranslation[]): AvailableTranslation[] => {
  return translations.map((translation) => ({
    ...translation,
    languageName: translation.languageName.toLowerCase(),
  }));
};

export default filterTranslations;
