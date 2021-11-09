/* eslint-disable import/prefer-default-export */
import findKey from 'lodash/findKey';

const RTL_LOCALES = ['ar', 'fa', 'ur'];

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl',
}

export const Languages = {
  9: {
    // Arabic,
    dir: Direction.RTL,
    locale: 'ar',
  },
  20: {
    // Bengali
    locale: 'bn',
  },
  34: {
    font: 'divehi',
    locale: 'dv',
    dir: Direction.RTL,
  },
  38: {
    // English
    locale: 'en',
  },
  43: {
    // Persian/Farsi
    dir: Direction.RTL,
    locale: 'fa',
  },
  49: {
    // French
    locale: 'fr',
  },
  59: {
    // Hebrew
    dir: Direction.RTL,
    locale: 'he',
  },
  67: {
    // Indonesian
    locale: 'id',
  },
  74: {
    // Italian
    locale: 'it',
  },
  89: {
    font: 'kurdish',
    locale: 'ku',
    dir: Direction.RTL,
  },
  133: {
    // Portuguese
    locale: 'pt',
  },
  118: {
    // Dutch
    locale: 'nl',
  },
  138: {
    // Russian
    locle: 'ru',
  },
  151: {
    // Albanian
    locale: 'sq',
  },
  161: {
    // Thai
    locale: 'th',
  },
  172: {
    // Uyghur/Uighur
    dir: Direction.RTL,
    locale: 'ug',
  },
  174: {
    font: 'urdu',
    dir: Direction.RTL,
    locale: 'ur',
  },
  185: {
    // Chinese
    locale: 'zh',
  },
};

/**
 * Check whether the current locale is RTL.
 *
 * @param {string} locale
 * @returns {boolean}
 */
export const isRTLLocale = (locale: string): boolean => RTL_LOCALES.includes(locale);

/**
 * Gir the dir of the element based on the locale.
 *
 * @param {string} locale
 * @returns {string}
 */
export const getDir = (locale: string): Direction =>
  isRTLLocale(locale) ? Direction.RTL : Direction.LTR;

/**
 * Get direction of language by language id
 *
 * @param {number} languageId
 * @returns {string}
 */
export const getLanguageDirectionById = (languageId: number): string => {
  const mapping = Languages[languageId];

  return mapping?.dir || Direction.LTR;
};

/**
 * Get font face name of language by language id
 *
 * @param {number} languageId
 * @returns {string}
 */
export const getLanguageFontById = (languageId: number): string => {
  const mapping = Languages[languageId];
  return mapping?.font;
};

/**
 * Find language Id by its locale
 *
 * @param {string} locale
 * @returns {number} language id
 */
export const findLanguageIdByLocale = (locale: string): number => {
  return Number(findKey(Languages, { locale }));
};
