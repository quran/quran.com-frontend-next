/* eslint-disable max-lines */
/* eslint-disable import/prefer-default-export */
import findKey from 'lodash/findKey';
import { MetaTag } from 'next-seo/lib/types';

import i18nConfig from '../../i18n.json';

import { getBasePath } from './url';

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
  ku: 'Kurdî',
  uz: "o'zbek",
};

const LOCALE_NAME_TO_CODE = {
  bengali: 'bn',
  english: 'en',
  arabic: 'ar',
  russian: 'ru',
  urdu: 'ur',
  Kurdish: 'ku',
};

export const LANG_LOCALE_MAP = {
  en: 'en-US',
  ar: 'ar-EG',
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
  code: string;
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
  return lang === 'ar' || lang === 'ur';
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
  const lang = Languages[languageId];

  return {
    font: lang?.font,
    direction: lang?.dir || Direction.LTR,
    code: lang?.locale || 'en',
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

/**
 * Converts a locale name e.g. 'english' to its code e.g. 'en'.
 *
 * @param {string} fullName
 * @returns {string}
 */
export const getLocaleNameByFullName = (fullName: string): string =>
  LOCALE_NAME[LOCALE_NAME_TO_CODE[fullName]];

/**
 * Takes a number and returns a localized string based on the provided locale.
 *
 * @param {number} value
 * @param {string} locale
 * @param {boolean} showLeadingZero
 * @param {Intl.NumberFormatOptions} options
 * @returns {string}
 */
// Intl.NumberFormat is performance heavy so we are caching the formatter.
const numberFormatters: Map<Intl.NumberFormatOptions | string, Intl.NumberFormat> = new Map();
let currentLanguageLocale: string = null;

export const toLocalizedNumber = (
  value: number,
  locale: string,
  showLeadingZero = false,
  options: Intl.NumberFormatOptions = undefined,
) => {
  // we do this because an empty object will result in a new formatter being created everytime since we don't have it's reference.
  const formatterKey = options ?? 'DEFAULT_OPTIONS';

  if (numberFormatters.has(formatterKey) && currentLanguageLocale === locale) {
    return getFormattedNumber(numberFormatters.get(formatterKey), value, showLeadingZero);
  }

  currentLanguageLocale = locale;
  const fullLocale = LANG_LOCALE_MAP[locale];

  const newNumberFormatter = new Intl.NumberFormat(fullLocale, options);
  numberFormatters.set(formatterKey, newNumberFormatter);
  return getFormattedNumber(newNumberFormatter, value, showLeadingZero);
};

/**
 * Get the formatted localized number. This either returns
 * the original value or prepends a leading 0 to the beginning
 * of the string if it's allowed and the value is below 10.
 *
 * @param {Intl.NumberFormat} formatter
 * @param {number} value
 * @param {boolean} showLeadingZero
 * @returns {string}
 */
const getFormattedNumber = (
  formatter: Intl.NumberFormat,
  value: number,
  showLeadingZero: boolean,
): string => {
  const formattedNumber = formatter.format(value);
  if (!showLeadingZero || value >= 10) {
    return formattedNumber;
  }
  return `${formatter.format(0)}${formattedNumber}`;
};

/**
 * Get the full locale name with lang + country e.g. ar-SA or en-US.
 *
 * @param {string} locale
 * @returns {string}
 */
export const getLangFullLocale = (locale: string): string => LANG_LOCALE_MAP[locale];

/**
 * Takes a date and returns a localized string based on the provided locale and options.
 *
 * @param {number} value
 * @param {string} locale
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export const toLocalizedDate = (
  value: number | Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const fullLocale = LANG_LOCALE_MAP[locale];
  return new Intl.DateTimeFormat(fullLocale, options).format(value);
};

/**
 * Localize a string that contains 2 numbers with a splitter in between
 * e.g. "2:55" or "2-5".
 *
 * @param {string} string
 * @param {string} lang
 * @param {string} splitter
 * @returns  {string}
 */
export const localizeNumericalStringWithSplitter = (
  string: string,
  lang: string,
  splitter = ':',
): string =>
  string
    .split(splitter)
    .map((value: string) => toLocalizedNumber(Number(value), lang))
    .join(splitter);

/**
 * Get the localized value of the verse key.
 *
 * @param {string} verseKey
 * @param {string} lang
 * @returns {string}
 */
export const toLocalizedVerseKey = (verseKey: string, lang: string): string =>
  localizeNumericalStringWithSplitter(verseKey, lang);

/**
 * Get the localized value of a range e.g. "1-20"
 *
 * @param {string} range
 * @param {string} lang
 * @returns {string}
 */
export const toLocalizedVersesRange = (range: string, lang: string): string =>
  localizeNumericalStringWithSplitter(range, lang, '-');

/**
 * Generate the locale by mapping the current iso language to
 * the format that Facebook accepts @see https://developers.facebook.com/docs/javascript/internationalization#locales .
 * Since LANG_LOCALE_MAP has the following format LL-CC, we need to convert it into LL_CC
 * be replacing "-" with "_".
 *
 * @param {string} currentLocale
 * @returns {string}
 */
export const getOpenGraphLocale = (currentLocale: string): string =>
  `${LANG_LOCALE_MAP[currentLocale]}`.replace('-', '_');

/**
 * Generate the alternate locales that the current content can be served in.
 * When Facebook needs to render an object in one of the specified locales,
 * it will make a request to the URL with the fb_locale URL parameter.
 *
 * @see https://developers.facebook.com/blog/post/2013/11/11/605/
 *
 * @param {string} currentLocale
 * @returns {MetaTag[]}
 */
export const getOpenGraphAlternateLocales = (currentLocale: string): MetaTag[] => {
  return Object.keys(LANG_LOCALE_MAP)
    .filter((languageCode) => languageCode !== currentLocale)
    .map((languageCode) => ({
      name: 'og:locale:alternate',
      content: `${LANG_LOCALE_MAP[languageCode]}`.replace('-', '_'),
    }));
};

/**
 * Convert a month number to the corresponding localized month name.
 *
 * @param {number} monthNumber
 * @param {string} locale
 * @returns {string}
 */
export const toLocalizedMonthName = (monthNumber: number, locale: string): string => {
  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(monthNumber - 1);

  return objDate.toLocaleString(locale, { month: 'long' });
};
