/* eslint-disable import/prefer-default-export */

import { useSelector } from 'react-redux';

import { selectAyahReflectionsLanguages } from '@/redux/slices/defaultSettings';
import Language from '@/types/Language';
import ReflectionLanguage from 'types/QuranReflect/ReflectionLanguage';

/**
 * Check whether the reflection is RTL or LTR.
 *
 * @param {string} language
 * @returns {boolean}
 */
export const isRTLReflection = (language: ReflectionLanguage): boolean => {
  switch (language) {
    case ReflectionLanguage.ARABIC:
    case ReflectionLanguage.URDU:
      return true;

    default:
      return false;
  }
};

const LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID: Record<string, number> = {
  [Language.AR]: 1, // Arabic
  [Language.EN]: 2,
  [Language.ES]: 3,
  [Language.MS]: 4,
  [Language.UR]: 5,
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

const LOCALE_TO_REFLECTION_LANGUAGE_MAP = {
  ms: ReflectionLanguage.MALAY,
  id: ReflectionLanguage.MALAY,
  ur: ReflectionLanguage.URDU,
  ar: ReflectionLanguage.ARABIC,
  fr: ReflectionLanguage.FRENCH,
};

const REFLECTION_LANGUAGE_TO_LOCALE_MAP: Record<ReflectionLanguage, string> = {
  [ReflectionLanguage.ENGLISH]: 'en',
  [ReflectionLanguage.SPANISH]: 'es',
  [ReflectionLanguage.FRENCH]: 'fr',
  [ReflectionLanguage.MALAY]: 'ms',
  [ReflectionLanguage.URDU]: 'ur',
  [ReflectionLanguage.ARABIC]: 'ar',
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

export const reflectionLanguagesToLocaleCodes = (
  reflectionLanguages: ReflectionLanguage[],
): string[] => {
  if (!reflectionLanguages?.length) return [];
  return reflectionLanguages
    .map((language) => REFLECTION_LANGUAGE_TO_LOCALE_MAP[language])
    .filter((localeCode): localeCode is string => Boolean(localeCode));
};

/**
 * Map locale to Quran Reflect language ID.
 * @param {string} locale
 * @returns {number}
 */
export const localeToQuranReflectLanguageID = (locale: string): number => {
  const normalizedLocale = locale?.split('-')[0]?.toLowerCase() || Language.EN;
  return (
    LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID[normalizedLocale] ||
    LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID[Language.EN]
  );
};
