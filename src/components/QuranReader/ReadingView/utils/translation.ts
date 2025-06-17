import Translation from '@/types/Translation';

/**
 * Get a display string for translation name based on available translations
 *
 * @param {Translation[] | undefined} translations - Array of translations or undefined
 * @param {Function} t - Translation function from useTranslation
 * @returns {string} Formatted translation name string
 */
const getTranslationNameString = (translations?: Translation[], t?: any): string => {
  let translationName = t ? t('settings.no-translation-selected') : 'No translation selected';

  if (translations?.length === 1) {
    translationName = translations[0].resourceName;
  } else if (translations?.length > 1) {
    // Find the shortest translation name
    let shortestTranslation = translations[0];
    for (let i = 1; i < translations.length; i += 1) {
      if (translations[i].resourceName.length < shortestTranslation.resourceName.length) {
        shortestTranslation = translations[i];
      }
    }

    translationName = shortestTranslation.resourceName;
  }

  return translationName;
};

export default getTranslationNameString;
