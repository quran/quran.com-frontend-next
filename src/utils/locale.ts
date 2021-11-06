/* eslint-disable import/prefer-default-export */
const RTL_LOCALES = ['ar', 'fa', 'ur'];

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl',
}

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
