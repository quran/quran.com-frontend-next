/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import { RootState } from '../RootState';

import { DefaultSettings } from 'src/redux/defaultSettings/defaultSettings';
import AudioState from 'src/redux/types/AudioState';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import ReadingPreferences from 'src/redux/types/ReadingPreferences';
import TafsirsSettings from 'src/redux/types/TafsirsSettings';
import Theme from 'src/redux/types/Theme';
import TranslationsSettings from 'src/redux/types/TranslationsSettings';

/**
 * Get the initial state of the store.
 *
 * @param {string} locale
 * @returns {RootState}
 */
export const getStoreInitialState = (locale: string): RootState => {
  return {
    theme: getThemeInitialState(locale),
    readingPreferences: getReadingPreferencesInitialState(locale),
    quranReaderStyles: getQuranReaderStylesInitialState(locale),
    translations: getTranslationsInitialState(locale),
    tafsirs: getTafsirsInitialState(locale),
    // @ts-ignore
    audioPlayerState: getAudioPlayerStateInitialState(locale),
    defaultSettings: { isUsingDefaultSettings: true },
  };
};

const DEFAULT_LOCALE = 'en';

/**
 * Dynamically load the default settings of the locale passed.
 *
 * @param {string} locale
 * @returns {DefaultSettings}
 */
const importLocaleFile = (locale: string): DefaultSettings =>
  require(`src/redux/defaultSettings/locales/${locale}`).default;

/**
 * Get specific settings by its key for a locale.
 * e.g. get the settings for theme by the key 'theme'.
 *
 * @param {string} locale
 * @param {string} key
 * @returns {any}
 */
const getLocaleInitialStateByKey = (locale: string, key: string) => importLocaleFile(locale)[key];

export const getThemeInitialState = (locale = DEFAULT_LOCALE): Theme => {
  return getLocaleInitialStateByKey(locale, 'theme');
};

export const getReadingPreferencesInitialState = (locale = DEFAULT_LOCALE): ReadingPreferences => {
  return getLocaleInitialStateByKey(locale, 'readingPreferences');
};

export const getQuranReaderStylesInitialState = (locale = DEFAULT_LOCALE): QuranReaderStyles => {
  return getLocaleInitialStateByKey(locale, 'quranReaderStyles');
};

export const getTranslationsInitialState = (locale = DEFAULT_LOCALE): TranslationsSettings => {
  return getLocaleInitialStateByKey(locale, 'translations');
};

export const getTafsirsInitialState = (locale = DEFAULT_LOCALE): TafsirsSettings => {
  return getLocaleInitialStateByKey(locale, 'tafsirs');
};
export const getAudioPlayerStateInitialState = (locale = DEFAULT_LOCALE): AudioState => {
  return getLocaleInitialStateByKey(locale, 'audioPlayerState');
};
