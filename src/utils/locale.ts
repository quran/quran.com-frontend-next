/* eslint-disable import/prefer-default-export */
const RTL_LOCALES = ['ar', 'fa', 'ur'];
const RTL = 'rtl';
const LTR = 'ltr';

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
export const getDir = (locale: string): string => (isRTLLocale(locale) ? RTL : LTR);
