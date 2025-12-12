/* eslint-disable max-lines */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import { RootState } from '../RootState';
import NotificationsState from '../types/NotificationsState';

import { DefaultSettings } from '@/redux/defaultSettings/defaultSettings';
import AudioState from '@/redux/types/AudioState';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import ReadingPreferences from '@/redux/types/ReadingPreferences';
import SliceName from '@/redux/types/SliceName';
import TafsirsSettings from '@/redux/types/TafsirsSettings';
import Theme from '@/redux/types/Theme';
import TranslationsSettings from '@/redux/types/TranslationsSettings';
import Language from '@/types/Language';
import { QuranFont, Mushaf, MushafLines } from '@/types/QuranReader';
import { CountryLanguagePreferenceResponse } from 'types/ApiResponses';
import ReflectionLanguage from 'types/QuranReflect/ReflectionLanguage';

/* eslint-disable react-func/max-lines-per-function */

/**
 * Get the initial state of the store.
 *
 * @param {string} locale
 * @param {CountryLanguagePreferenceResponse} [countryPreference] optional country/language preference coming from the server. When provided, we will override the locale defaults according to the product requirements.
 * @param {string} [detectedLanguage] the detected language from server-side detection
 * @param {string} [detectedCountry] the detected country from server-side detection
 * @returns {RootState}
 */
export const getStoreInitialState = (
  locale: string,
  countryPreference?: CountryLanguagePreferenceResponse,
  detectedLanguage?: string,
  detectedCountry?: string,
): RootState => {
  // the original locale-based defaults
  const baseState: RootState = {
    [SliceName.THEME]: getThemeInitialState(locale as Language),
    [SliceName.READING_PREFERENCES]: getReadingPreferencesInitialState(locale as Language),
    [SliceName.QURAN_READER_STYLES]: getQuranReaderStylesInitialState(locale as Language),
    [SliceName.TRANSLATIONS]: getTranslationsInitialState(locale as Language),
    [SliceName.TAFSIRS]: getTafsirsInitialState(locale as Language),
    // @ts-ignore – audioPlayerState is not part of RootState static typing in this util.
    [SliceName.AUDIO_PLAYER_STATE]: getAudioPlayerStateInitialState(locale as Language),
    [SliceName.DEFAULT_SETTINGS]: {
      isUsingDefaultSettings: true,
      detectedCountry: detectedCountry || '',
      detectedLanguage: detectedLanguage || '',
      userHasCustomised: false,
      ayahReflectionsLanguages: [ReflectionLanguage.ENGLISH], // Default to English only
      ayahReflectionsLanguageIsoCodes: ['en'], // Default to English ISO code
      learningPlanLanguageIsoCodes: ['en'],
    },
    [SliceName.NOTIFICATIONS]: getNotificationsInitialState(locale as Language),
  } as unknown as RootState;

  if (!countryPreference) {
    return baseState;
  }

  // Helper to map mushaf id → quranFont & mushafLines
  const mapMushafToFontAndLines = (
    mushafId: number,
  ): { quranFont: QuranFont; mushafLines?: MushafLines } => {
    switch (mushafId) {
      case Mushaf.QCFV1:
        return { quranFont: QuranFont.MadaniV1 };
      case Mushaf.QCFV2:
        return { quranFont: QuranFont.MadaniV2 };
      case Mushaf.Tajweed:
        return { quranFont: QuranFont.Tajweed };
      case Mushaf.QCFTajweedV4:
        return { quranFont: QuranFont.TajweedV4 };
      case Mushaf.UthmaniHafs:
        return { quranFont: QuranFont.Uthmani };
      case Mushaf.Indopak15Lines:
        return { quranFont: QuranFont.IndoPak, mushafLines: MushafLines.FifteenLines };
      case Mushaf.Indopak16Lines:
        return { quranFont: QuranFont.IndoPak, mushafLines: MushafLines.SixteenLines };
      case Mushaf.Indopak:
        return { quranFont: QuranFont.IndoPak };
      case Mushaf.KFGQPCHAFS:
        return { quranFont: QuranFont.QPCHafs };
      default:
        return { quranFont: QuranFont.QPCHafs };
    }
  };

  // Helper to map ISO codes to ReflectionLanguage enum
  const mapIsoCodeToReflectionLanguage = (isoCode: string): ReflectionLanguage | null => {
    const mapping: Record<string, ReflectionLanguage> = {
      en: ReflectionLanguage.ENGLISH,
      ar: ReflectionLanguage.ARABIC,
      ur: ReflectionLanguage.URDU,
      fr: ReflectionLanguage.FRENCH,
      ms: ReflectionLanguage.MALAY,
      id: ReflectionLanguage.MALAY, // Indonesian maps to Malay
      es: ReflectionLanguage.SPANISH,
    };

    return mapping[isoCode] || null;
  };

  // 1. Quran Reader Styles overrides (Mushaf related).
  if (countryPreference.defaultMushaf?.id) {
    const { quranFont, mushafLines } = mapMushafToFontAndLines(countryPreference.defaultMushaf.id);
    baseState[SliceName.QURAN_READER_STYLES] = {
      ...baseState[SliceName.QURAN_READER_STYLES],
      quranFont,
      mushafLines: mushafLines || baseState[SliceName.QURAN_READER_STYLES].mushafLines,
    } as any;
  }

  // 2. Translations overrides.
  if (countryPreference.defaultTranslations?.length) {
    baseState[SliceName.TRANSLATIONS] = {
      ...baseState[SliceName.TRANSLATIONS],
      selectedTranslations: countryPreference.defaultTranslations.map((t) => t.id),
      isUsingDefaultTranslations: true,
    } as any;
  }

  // 3. Tafsir override.
  if (countryPreference.defaultTafsir?.id) {
    baseState[SliceName.TAFSIRS] = {
      ...baseState[SliceName.TAFSIRS],
      selectedTafsirs: [String(countryPreference.defaultTafsir.id)],
      isUsingDefaultTafsirs: true,
    } as any;
  }

  // 4. Word-by-word locale override.
  if (countryPreference.defaultWbwLanguage?.isoCode) {
    baseState[SliceName.READING_PREFERENCES] = {
      ...baseState[SliceName.READING_PREFERENCES],
      selectedWordByWordLocale: countryPreference.defaultWbwLanguage.isoCode,
      isUsingDefaultWordByWordLocale: true,
    } as any;
  }

  // 5. Ayah reflections languages override.
  if (countryPreference.ayahReflectionsLanguages?.length) {
    const reflectionLanguages = countryPreference.ayahReflectionsLanguages
      .map((lang) => mapIsoCodeToReflectionLanguage(lang.isoCode))
      .filter(Boolean) as ReflectionLanguage[];

    const reflectionLanguagesToStore =
      reflectionLanguages.length > 0 ? reflectionLanguages : [ReflectionLanguage.ENGLISH];

    const reflectionIsoCodes = countryPreference.ayahReflectionsLanguages
      .map((lang) => lang.isoCode?.toLowerCase())
      .filter(Boolean);

    const isoCodesToStore = reflectionIsoCodes.length > 0 ? reflectionIsoCodes : ['en'];

    baseState[SliceName.DEFAULT_SETTINGS] = {
      ...baseState[SliceName.DEFAULT_SETTINGS],
      ayahReflectionsLanguages: reflectionLanguagesToStore,
      ayahReflectionsLanguageIsoCodes: isoCodesToStore,
    } as any;
  }

  const learningPlanLanguageIsoCodes = (
    countryPreference.learningPlanLanguages?.map((lang) => lang.isoCode) || ['en']
  )
    .map((code) => code?.trim().toLowerCase())
    .filter((code, index, array) => code && array.indexOf(code) === index);

  if (!learningPlanLanguageIsoCodes.length) {
    learningPlanLanguageIsoCodes.push('en');
  }

  baseState[SliceName.DEFAULT_SETTINGS] = {
    ...baseState[SliceName.DEFAULT_SETTINGS],
    learningPlanLanguageIsoCodes,
  } as any;

  // NOTE: Reciter will be handled in the AudioPlayer xstate service (see ReduxProvider).

  return baseState;
};

const DEFAULT_LOCALE = Language.EN;

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

export const getLocaleInitialState = (locale: string) => importLocaleFile(locale);

export const getThemeInitialState = (locale: Language | string = DEFAULT_LOCALE): Theme => {
  return getLocaleInitialStateByKey(locale, SliceName.THEME);
};

export const getReadingPreferencesInitialState = (
  locale: Language | string = DEFAULT_LOCALE,
): ReadingPreferences => {
  return getLocaleInitialStateByKey(locale, SliceName.READING_PREFERENCES);
};

export const getQuranReaderStylesInitialState = (
  locale: Language | string = DEFAULT_LOCALE,
): QuranReaderStyles => {
  return getLocaleInitialStateByKey(locale, SliceName.QURAN_READER_STYLES);
};

export const getTranslationsInitialState = (
  locale: Language | string = DEFAULT_LOCALE,
): TranslationsSettings => {
  return getLocaleInitialStateByKey(locale, SliceName.TRANSLATIONS);
};

export const getTafsirsInitialState = (
  locale: Language | string = DEFAULT_LOCALE,
): TafsirsSettings => {
  return getLocaleInitialStateByKey(locale, SliceName.TAFSIRS);
};
export const getAudioPlayerStateInitialState = (
  locale: Language | string = DEFAULT_LOCALE,
): AudioState => {
  return getLocaleInitialStateByKey(locale, SliceName.AUDIO_PLAYER_STATE);
};

export const getNotificationsInitialState = (
  locale: Language | string = DEFAULT_LOCALE,
): NotificationsState => {
  return getLocaleInitialStateByKey(locale, SliceName.NOTIFICATIONS);
};
