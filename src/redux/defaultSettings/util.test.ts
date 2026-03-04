import { describe, expect, it } from 'vitest';

import i18nConfig from '../../../i18n.json';

import arLocale from './locales/ar';
import bnLocale from './locales/bn';
import enLocale from './locales/en';
import esLocale from './locales/es';
import faLocale from './locales/fa';
import frLocale from './locales/fr';
import idLocale from './locales/id';
import itLocale from './locales/it';
import msLocale from './locales/ms';
import nlLocale from './locales/nl';
import ptLocale from './locales/pt';
import ruLocale from './locales/ru';
import sqLocale from './locales/sq';
import swLocale from './locales/sw';
import thLocale from './locales/th';
import trLocale from './locales/tr';
import urLocale from './locales/ur';
import viLocale from './locales/vi';
import zhLocale from './locales/zh';

import { ReadingPreference } from '@/types/QuranReader';

const LOCALE_SETTINGS = {
  ar: arLocale,
  bn: bnLocale,
  en: enLocale,
  es: esLocale,
  fa: faLocale,
  fr: frLocale,
  id: idLocale,
  it: itLocale,
  ms: msLocale,
  nl: nlLocale,
  pt: ptLocale,
  ru: ruLocale,
  sq: sqLocale,
  sw: swLocale,
  th: thLocale,
  tr: trLocale,
  ur: urLocale,
  vi: viLocale,
  zh: zhLocale,
};

const getLocaleReadingPreference = (locale: string): ReadingPreference =>
  LOCALE_SETTINGS[locale].readingPreferences.readingPreference;

describe('defaultSettings/util locale parity for reading preference', () => {
  it('contains all 19 supported locales in i18n config', () => {
    expect(i18nConfig.locales.length).toBe(19);
  });

  it('uses reading mode as default only for Arabic locale and translation for all other locales', () => {
    i18nConfig.locales.forEach((locale) => {
      const readingPreference = getLocaleReadingPreference(locale);

      if (locale === 'ar') {
        expect(readingPreference).toBe(ReadingPreference.Reading);
      } else {
        expect(readingPreference).toBe(ReadingPreference.Translation);
      }
    });
  });

  it('keeps explicit locale sanity checks for regression safety', () => {
    expect(getLocaleReadingPreference('en')).toBe(ReadingPreference.Translation);
    expect(getLocaleReadingPreference('ar')).toBe(ReadingPreference.Reading);
    expect(getLocaleReadingPreference('fr')).toBe(ReadingPreference.Translation);
    expect(getLocaleReadingPreference('id')).toBe(ReadingPreference.Translation);
  });
});
