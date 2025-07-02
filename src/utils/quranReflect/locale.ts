/* eslint-disable import/prefer-default-export */

import { useSelector } from 'react-redux';

import { selectAyahReflectionsLanguages } from '@/redux/slices/defaultSettings';
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
