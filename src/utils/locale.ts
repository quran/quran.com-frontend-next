/* eslint-disable import/prefer-default-export */
const RTL_LOCALES = ['ar', 'fa', 'ur'];

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl',
}

/**
 * Check whether the locale should have a minimalLayout. This will be reflect in
 * certain components like ChapterHeader or SurahPreviewRow and the reason we need
 * this is that for Arabic for example, we the transliteratedName and translatedName
 * have the same value which will result in redundant UI.
 *
 * @param {string} lang
 * @returns {boolean}
 */
export const shouldUseMinimalLayout = (lang: string): boolean => {
  return lang === 'ar';
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
