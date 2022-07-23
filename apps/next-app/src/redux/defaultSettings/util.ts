/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import { RootState } from '../RootState';

import { DefaultSettings } from 'src/redux/defaultSettings/defaultSettings';
import AudioState from 'src/redux/types/AudioState';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import ReadingPreferences from 'src/redux/types/ReadingPreferences';
import SliceName from 'src/redux/types/SliceName';
import TafsirsSettings from 'src/redux/types/TafsirsSettings';
import Theme from 'src/redux/types/Theme';
import TranslationsSettings from 'src/redux/types/TranslationsSettings';

import EnLocal from 'src/redux/defaultSettings/locales/en';
import ArLocal from 'src/redux/defaultSettings/locales/ar';
import BnLocal from 'src/redux/defaultSettings/locales/bn';
import FaLocal from 'src/redux/defaultSettings/locales/fa';
import FrLocal from 'src/redux/defaultSettings/locales/fr';
import IdLocal from 'src/redux/defaultSettings/locales/id';
import ItLocal from 'src/redux/defaultSettings/locales/it';
import MsLocal from 'src/redux/defaultSettings/locales/ms';
import NlLocal from 'src/redux/defaultSettings/locales/nl';
import PtLocal from 'src/redux/defaultSettings/locales/pt';
import RuLocal from 'src/redux/defaultSettings/locales/ru';
import SqLocal from 'src/redux/defaultSettings/locales/sq';
import ThLocal from 'src/redux/defaultSettings/locales/th';
import TrLocal from 'src/redux/defaultSettings/locales/tr';
import UrLocal from 'src/redux/defaultSettings/locales/ur';
import ZhLocal from 'src/redux/defaultSettings/locales/zh';


/**
 * Get the initial state of the store.
 *
 * @param {string} locale
 * @returns {RootState}
 */
export const getStoreInitialState = (locale: string): RootState => {
  return {
    [SliceName.THEME]: getThemeInitialState(locale),
    [SliceName.READING_PREFERENCES]: getReadingPreferencesInitialState(locale),
    [SliceName.QURAN_READER_STYLES]: getQuranReaderStylesInitialState(locale),
    [SliceName.TRANSLATIONS]: getTranslationsInitialState(locale),
    [SliceName.TAFSIRS]: getTafsirsInitialState(locale),
    // @ts-ignore
    [SliceName.AUDIO_PLAYER_STATE]: getAudioPlayerStateInitialState(locale),
    [SliceName.DEFAULT_SETTINGS]: { isUsingDefaultSettings: true },
  };
};

const DEFAULT_LOCALE = 'en';

/**
 * Dynamically load the default settings of the locale passed.
 *
 * @param {string} locale
 * @returns {DefaultSettings}
 */
const importLocaleFile = (locale: string): DefaultSettings => {
  switch (locale) {
    case 'ar': return ArLocal;
    case 'bn': return BnLocal;
    case 'fa': return FaLocal;
    case 'fr': return FrLocal;
    case 'id': return IdLocal;
    case 'it': return ItLocal;
    case 'ms': return MsLocal;
    case 'nl': return NlLocal;
    case 'pt': return PtLocal;
    case 'ru': return RuLocal;
    case 'sq': return SqLocal;
    case 'th': return ThLocal;
    case 'tr': return TrLocal;
    case 'ur': return UrLocal;
    case 'zh': return ZhLocal;
    default: return EnLocal;
  }
}

/**
 * Get specific settings by its key for a locale.
 * e.g. get the settings for theme by the key 'theme'.
 *
 * @param {string} locale
 * @param {string} key
 * @returns {any}
 */
const getLocaleInitialStateByKey = (locale: string, key: string) => importLocaleFile(locale)[key];

export const getLocaleInitialState = (locale: string) => importLocaleFile(locale);

export const getThemeInitialState = (locale = DEFAULT_LOCALE): Theme => {
  return getLocaleInitialStateByKey(locale, SliceName.THEME);
};

export const getReadingPreferencesInitialState = (locale = DEFAULT_LOCALE): ReadingPreferences => {
  return getLocaleInitialStateByKey(locale, SliceName.READING_PREFERENCES);
};

export const getQuranReaderStylesInitialState = (locale = DEFAULT_LOCALE): QuranReaderStyles => {
  return getLocaleInitialStateByKey(locale, SliceName.QURAN_READER_STYLES);
};

export const getTranslationsInitialState = (locale = DEFAULT_LOCALE): TranslationsSettings => {
  return getLocaleInitialStateByKey(locale, SliceName.TRANSLATIONS);
};

export const getTafsirsInitialState = (locale = DEFAULT_LOCALE): TafsirsSettings => {
  return getLocaleInitialStateByKey(locale, SliceName.TAFSIRS);
};
export const getAudioPlayerStateInitialState = (locale = DEFAULT_LOCALE): AudioState => {
  return getLocaleInitialStateByKey(locale, SliceName.AUDIO_PLAYER_STATE);
};
