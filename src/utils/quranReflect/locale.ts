/* eslint-disable import/prefer-default-export */

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
 * Convert Next.js's locale to an array of languages that posts
 * should only be in. E.g. if locale is 'ar', allowed posts' languages
 * should be ARABIC and ENGLISH only.
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
