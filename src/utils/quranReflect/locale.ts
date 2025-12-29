import { useSelector } from 'react-redux';

import { selectAyahReflectionsLanguages } from '@/redux/slices/defaultSettings';
import ReflectionLanguage from 'types/QuranReflect/ReflectionLanguage';

const ARABIC_LANGUAGE_ID = 1;
const URDU_LANGUAGE_ID = 5;

const RTL_LANGUAGE_IDS = [ARABIC_LANGUAGE_ID, URDU_LANGUAGE_ID];

const LOCALE_TO_TRANSLATION_ID = {
  [Language.AR]: null, // Arabic text doesn't need translation
  [Language.EN]: 131, // The Clear Quran (Khattab)
  [Language.ES]: 83, // Garcia
  [Language.MS]: 39, // Basmeih
  [Language.UR]: 97, // Tafheem e Qur'an - Syed Abu Ali Maududi
  [Language.ID]: 33, // Indonesian Islamic Affairs Ministry
  [Language.FR]: 31, // Muhammad Hamiduallah
};

export const localeToTranslationID = (locale: string): number | null => {
  return LOCALE_TO_TRANSLATION_ID[locale] ?? LOCALE_TO_TRANSLATION_ID[Language.EN];
};

const LOCALE_TO_REFLECTION_LANGUAGE_MAP = {
  ms: ReflectionLanguage.MALAY,
  id: ReflectionLanguage.MALAY,
  ur: ReflectionLanguage.URDU,
  ar: ReflectionLanguage.ARABIC,
  fr: ReflectionLanguage.FRENCH,
};

/**
 * Get reflection languages from Redux store. This function should be used
 * within React components that have access to the Redux store.
 *
 * @returns {ReflectionLanguage[]} Array of reflection languages from Redux state
 */
export const getReflections = (): ReflectionLanguage[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reflectionLanguages = useSelector(selectAyahReflectionsLanguages);

  // Fallback to English if no languages are set
  return reflectionLanguages.length > 0 ? reflectionLanguages : [ReflectionLanguage.ENGLISH];
};

/**
 * Convert Next.js's locale to an array of languages that posts
 * should only be in. E.g. if locale is 'ar', allowed posts' languages
 * should be ARABIC and ENGLISH only.
 *
 * This function serves as a fallback when Redux state is not available.
 * For components with Redux access, use getReflections() instead.
 *
 * @param {string} locale e.g. 'ar'
 * @returns {ReflectionLanguage[]} e.g. ['ENGLISH', 'ARABIC']
 */
export const localeToReflectionLanguages = (locale: string): ReflectionLanguage[] => {
  // by default English is always allowed
  const allowedReflectionLanguages = [ReflectionLanguage.ENGLISH];
  const currentLocaleReflectionLanguage = LOCALE_TO_REFLECTION_LANGUAGE_MAP[locale];
  // if the current locale has corresponding locale on QR side
  if (currentLocaleReflectionLanguage) {
    allowedReflectionLanguages.push(currentLocaleReflectionLanguage);
  }
  return allowedReflectionLanguages;
};
export const isRTLReflection = (languageId: number): boolean => {
  return RTL_LANGUAGE_IDS.includes(languageId);
};

/**
 * Get reflection languages with Redux state support. This function can be used
 * both inside and outside React components.
 *
 * @param {string} locale - Fallback locale for when Redux state is not available
 * @param {ReflectionLanguage[]} [reduxReflectionLanguages] - Optional Redux state
 * @returns {ReflectionLanguage[]} Array of reflection languages
 */
export const getReflectionLanguages = (
  locale: string,
  reduxReflectionLanguages?: ReflectionLanguage[],
): ReflectionLanguage[] => {
  // Use Redux state if available and not empty
  if (reduxReflectionLanguages && reduxReflectionLanguages.length > 0) {
    return reduxReflectionLanguages;
  }

  // Fallback to locale-based logic
  return localeToReflectionLanguages(locale);
};
