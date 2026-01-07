/**
 * Widget Defaults - Constants and default values for the Ayah Widget Builder.
 */

import type { BasePreferenceContext, Preferences } from './widget-types';

import ThemeType from '@/redux/types/ThemeType';
import type { MushafType } from '@/types/ayah-widget';
import { QuranFont } from '@/types/QuranReader';

/**
 * Static default values for the Ayah Widget Builder.
 */
export const DEFAULTS = {
  clientId: 'My Website Name',
  surah: 33,
  ayah: 56,
  reciterId: 7,
  translationId: 131,
  copySuccessDurationMs: 2000,
  embedUrl: process.env.NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL || '',
  embedOrigin: process.env.NEXT_PUBLIC_AYAH_WIDGET_ORIGIN || '',
  iframeHeight: 500,
} as const;

/**
 * Initial settings shown in the builder UI (static defaults only).
 */
export const INITIAL_PREFERENCES: Preferences = {
  clientId: DEFAULTS.clientId,
  selectedSurah: DEFAULTS.surah,
  selectedAyah: DEFAULTS.ayah,
  translations: [],
  theme: ThemeType.Light,
  mushaf: 'qpc',
  enableAudio: true,
  enableWbwTranslation: false,
  showTranslatorName: false,
  showTafsirs: true,
  showReflections: true,
  showAnswers: true,
  locale: 'en',
  reciter: DEFAULTS.reciterId,
  showArabic: true,
  rangeEnabled: false,
  rangeEnd: DEFAULTS.ayah + 1,
  mergeVerses: false,
  customSize: {
    width: '100%',
    height: '',
  },
};

/**
 * Map the selected Quran font (reader setting) to the widget mushaf option.
 *
 * @param {QuranFont} quranFont - The selected Quran font.
 * @returns {MushafType} The corresponding mushaf type for the widget.
 */
export const getMushafFromQuranFont = (quranFont: QuranFont): MushafType => {
  switch (quranFont) {
    case QuranFont.MadaniV1:
      return 'kfgqpc_v1';
    case QuranFont.MadaniV2:
      return 'kfgqpc_v2';
    case QuranFont.IndoPak:
      return 'indopak';
    case QuranFont.TajweedV4:
    case QuranFont.Tajweed:
      return 'tajweed';
    default:
      return 'qpc';
  }
};

/**
 * Build base preferences from QDC defaults (theme/locale/mushaf/wbw).
 *
 * @param {BasePreferenceContext} context - The QDC-derived defaults.
 * @returns {Preferences} Base widget preferences.
 */
export const getBasePreferences = (context: BasePreferenceContext): Preferences => ({
  ...INITIAL_PREFERENCES,
  theme: context.theme,
  locale: context.locale,
  mushaf: context.mushaf,
  enableWbwTranslation: context.enableWbwTranslation,
});
