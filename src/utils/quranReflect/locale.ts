import { useSelector } from 'react-redux';

import { selectAyahReflectionsLanguages } from '@/redux/slices/defaultSettings';
import Language from '@/types/Language';
import { getLocaleName } from '@/utils/locale';
import ReflectionLanguage from 'types/QuranReflect/ReflectionLanguage';

const ARABIC_LANGUAGE_ID = 1;
const URDU_LANGUAGE_ID = 5;

const RTL_LANGUAGE_IDS = [ARABIC_LANGUAGE_ID, URDU_LANGUAGE_ID];

const LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID = {
  [Language.AR]: ARABIC_LANGUAGE_ID,
  [Language.EN]: 2,
  [Language.ES]: 3,
  [Language.MS]: 4,
  [Language.UR]: URDU_LANGUAGE_ID,
  [Language.ID]: 6,
  [Language.FR]: 7,
  [Language.BN]: 69,
  [Language.FA]: 32,
  [Language.IT]: 41,
  [Language.NL]: 39,
  [Language.PT]: 48,
  [Language.RU]: 67,
  [Language.SQ]: 45,
  [Language.TH]: 62,
  [Language.TR]: 65,
  [Language.ZH]: 71,
  [Language.SW]: 59,
};

export const LOCALE_TO_TRANSLATION_ID = {
  [Language.AR]: null, // Arabic text doesn't need translation
  [Language.EN]: 131, // The Clear Quran (Khattab)
  [Language.ES]: 83, // Garcia
  [Language.MS]: 39, // Basmeih
  [Language.UR]: 97, // Tafheem e Qur'an - Syed Abu Ali Maududi
  [Language.ID]: 33, // Indonesian Islamic Affairs Ministry
  [Language.FR]: 31, // Muhammad Hamiduallah
};

/**
 * Get language items for reflection/lesson language selector.
 * Derives items from LOCALE_TO_TRANSLATION_ID keys using getLocaleName for labels.
 *
 * @returns {Array<{ id: string; value: string; label: string }>}
 */
export const getReflectionLanguageItems = () =>
  Object.keys(LOCALE_TO_TRANSLATION_ID).map((locale) => ({
    id: locale,
    value: locale,
    label: getLocaleName(locale),
  }));

export const localeToQuranReflectLanguageID = (locale: string): number => {
  return (
    LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID[locale] || LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID[Language.EN]
  );
};

export const localeToTranslationID = (locale: string): number | null => {
  return LOCALE_TO_TRANSLATION_ID[locale] ?? LOCALE_TO_TRANSLATION_ID[Language.EN];
};

/**
 * Check whether the reflection is RTL or LTR.
 *
 * @param {number | ReflectionLanguage} languageIdOrLanguage
 * @returns {boolean}
 */
export const isRTLReflection = (languageIdOrLanguage: number | ReflectionLanguage): boolean => {
  if (typeof languageIdOrLanguage === 'number') {
    return RTL_LANGUAGE_IDS.includes(languageIdOrLanguage);
  }

  switch (languageIdOrLanguage) {
    case ReflectionLanguage.ARABIC:
    case ReflectionLanguage.URDU:
      return true;

    default:
      return false;
  }
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
