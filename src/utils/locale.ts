/* eslint-disable import/prefer-default-export */
const RTL_LOCALES = ['ar', 'fa', 'ur'];

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl',
}

export const Languages = {
  174: {
    font: 'urdu',
    dir: Direction.RTL,
  },
  34: {
    font: 'divehi',
  },
  89: {
    font: 'kurdish',
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
