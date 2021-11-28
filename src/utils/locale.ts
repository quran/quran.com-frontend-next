/* eslint-disable max-lines */
/* eslint-disable import/prefer-default-export */
import findKey from 'lodash/findKey';

import { getBasePath } from './url';

import i18nConfig from 'i18n.json';

const RTL_LOCALES = ['ar', 'fa', 'ur'];
const LOCALE_NAME = {
  en: 'English',
  ar: 'العربية',
  bn: 'বাংলা',
  fa: 'فارسی',
  fr: 'Français',
  id: 'Indonesia',
  it: 'Italiano',
  nl: 'Dutch',
  pt: 'Português',
  ru: 'русский',
  sq: 'Shqip',
  th: 'ภาษาไทย',
  tr: 'Türkçe',
  ur: 'اردو',
  zh: '简体中文',
  ms: 'Melayu',
  de: 'Deutsch',
  inh: 'ʁəlʁɑj mot',
  ta: 'தமிழ்', // tamil
  hi: 'हिन्दी',
};

export const LANG_LOCALE_MAP = {
  en: 'en-US',
  ar: 'ar-SA',
  bn: 'bn-BD',
  fa: 'fa-IR',
  fr: 'fr-FR',
  id: 'id-ID',
  it: 'it-IT',
  nl: 'nl-NL',
  pt: 'pt-BR',
  ru: 'ru-RU',
  sq: 'sq-AL',
  th: 'th-TH',
  tr: 'tr-TR',
  ur: 'ur-PK',
  zh: 'zh-CN',
  ms: 'ms-MY',
};

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

interface LinkLanguageAlternate {
  hrefLang: string;
  href: string;
}

interface LanguageData {
  direction: string;
  font: string;
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
 * Get direction and font name of language by language id
 *
 * @param {number} languageId
 * @returns {LanguageData}
 */
export const getLanguageDataById = (languageId: number): LanguageData => {
  return {
    font: getLanguageFontById(languageId),
    direction: getLanguageDirectionById(languageId),
  };
};

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

/**
 * Get the locale name.
 *
 * @param {string} locale
 * @returns {string}
 */
export const getLocaleName = (locale: string): string => LOCALE_NAME[locale];

export const toLocalizedNumber = (value: number, locale: string) => {
  const fullLocale = LANG_LOCALE_MAP[locale];
  return new Intl.NumberFormat(fullLocale).format(value);
};
