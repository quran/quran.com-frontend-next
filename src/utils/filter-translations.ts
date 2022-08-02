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

export default filterTranslations;
