import { getBasePath } from './url';

import i18nConfig from 'i18n.json';

const RTL_LOCALES = ['ar', 'fa', 'ur'];

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl',
}

interface LinkLanguageAlternate {
  hrefLang: string;
  href: string;
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

/**
 * Generate the language alternates of a given path so that Search Engines can
 * recommend the alternate page to the users based on their region/locale.
 *
 * @see https://developers.google.com/search/docs/advanced/crawling/localized-versions
 * @param {string} path
 * @returns {LinkLanguageAlternate[]}
 */
export const getLanguageAlternates = (path: string): LinkLanguageAlternate[] => {
  const { locales } = i18nConfig;
  const basePath = getBasePath();
  return locales
    .map((locale) => ({
      hrefLang: locale,
      href: `${basePath}/${locale}${path === '/' ? '' : path}`,
    }))
    .concat({
      hrefLang: 'x-default', // used when no other language/region matches the user's browser setting @see https://developers.google.com/search/docs/advanced/crawling/localized-versions#xdefault
      href: `${basePath}${path}`,
    });
};
