import Language from '@/types/Language';
import { getLocaleName } from '@/utils/locale';

export const ARABIC_LANGUAGE_ID = 1;
const URDU_LANGUAGE_ID = 5;

const RTL_LANGUAGE_IDS = [ARABIC_LANGUAGE_ID, URDU_LANGUAGE_ID];

const LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID = {
  [Language.AR]: ARABIC_LANGUAGE_ID,
  [Language.EN]: 2,
  [Language.ES]: 3,
  [Language.MS]: 4,
  [Language.UR]: URDU_LANGUAGE_ID,
  [Language.ID]: 6,
  [Language.FR]: 7,
  [Language.BN]: 69,
  [Language.FA]: 32,
  [Language.IT]: 41,
  [Language.NL]: 39,
  [Language.PT]: 48,
  [Language.RU]: 67,
  [Language.SQ]: 45,
  [Language.TH]: 62,
  [Language.TR]: 65,
  [Language.ZH]: 71,
  [Language.SW]: 59,
};

export const LOCALE_TO_TRANSLATION_ID = {
  [Language.AR]: null, // Arabic text doesn't need translation
  [Language.EN]: 131, // The Clear Quran (Khattab)
  [Language.ES]: 83, // Garcia
  [Language.MS]: 39, // Basmeih
  [Language.UR]: 97, // Tafheem e Qur'an - Syed Abu Ali Maududi
  [Language.ID]: 33, // Indonesian Islamic Affairs Ministry
  [Language.FR]: 31, // Muhammad Hamiduallah
};

/**
 * Get language items for reflection/lesson language selector.
 * Derives items from LOCALE_TO_TRANSLATION_ID keys using getLocaleName for labels.
 *
 * @returns {Array<{ id: string; value: string; label: string }>}
 */
export const getReflectionLanguageItems = () =>
  Object.keys(LOCALE_TO_TRANSLATION_ID).map((locale) => ({
    id: locale,
    value: locale,
    label: getLocaleName(locale),
  }));

export const localeToQuranReflectLanguageID = (locale: string): number => {
  return (
    LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID[locale] || LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID[Language.EN]
  );
};

const QURAN_REFLECT_LANGUAGE_ID_TO_LOCALE = Object.fromEntries(
  Object.entries(LOCALE_TO_QURAN_REFLECT_LANGUAGE_ID).map(([locale, id]) => [id, locale]),
);

export const quranReflectLanguageIDToLocale = (languageId: number): string | undefined =>
  QURAN_REFLECT_LANGUAGE_ID_TO_LOCALE[languageId];

export const localeToTranslationID = (locale: string): number | null => {
  return LOCALE_TO_TRANSLATION_ID[locale] ?? LOCALE_TO_TRANSLATION_ID[Language.EN];
};

/**
 * Check whether the reflection is RTL or LTR.
 *
 * @param {number} languageId
 * @returns {boolean}
 */
export const isRTLReflection = (languageId: number): boolean => {
  return RTL_LANGUAGE_IDS.includes(languageId);
};
