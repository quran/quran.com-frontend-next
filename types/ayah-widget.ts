import { QuranFont } from './QuranReader';

import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';

export type MushafType = 'qpc' | 'kfgqpc_v1' | 'kfgqpc_v2' | 'indopak' | 'tajweed';

/**
 * Type guard to check if a value is a valid MushafType.
 * @param {unknown} value The value to check.
 * @returns {boolean} True if the value is a valid MushafType.
 */
export const isMushafType = (value: unknown): value is MushafType => {
  return (
    typeof value === 'string' &&
    ['qpc', 'kfgqpc_v1', 'kfgqpc_v2', 'indopak', 'tajweed'].includes(value)
  );
};

/**
 * Gets the Quran font for a specific mushaf.
 * @param {MushafType} mushaf The mushaf type.
 * @returns {QuranFont} The corresponding Quran font.
 */
export const getQuranFontForMushaf = (mushaf: MushafType): QuranFont => {
  switch (mushaf) {
    case 'indopak':
      return QuranFont.IndoPak;
    case 'kfgqpc_v1':
      return QuranFont.MadaniV1;
    case 'kfgqpc_v2':
      return QuranFont.MadaniV2;
    case 'tajweed':
      return QuranFont.TajweedV4;
    default:
      return QuranFont.QPCHafs;
  }
};

/**
 * Options for configuring the Ayah Widget.
 */
export type WidgetOptions = {
  // Should the widget have a play button
  enableAudio: boolean;

  // Should the widget display inline word-by-word translations
  enableWbw: boolean;

  // Should the widget display inline word-by-word transliteration
  enableWbwTransliteration: boolean;

  // The theme of the widget
  theme: ThemeTypeVariant;

  // The type of Mushaf to display
  mushaf: MushafType;

  // Should the widget display translator names
  showTranslatorNames: boolean;

  // Should the arabic verse be rendered
  showArabic: boolean;

  // Inclusive ending verse number when rendering a range
  rangeEnd?: number;

  // Should verses in a range be merged (Arabic together, then translations together)
  mergeVerses?: boolean;

  // Should the widget display tafsirs button
  showTafsirs: boolean;

  // Should the widget display reflections button
  showReflections: boolean;

  // Should the widget display answers button
  showAnswers: boolean;

  // Locale code for widget labels (e.g. "en", "fr")
  locale: string;

  // Localized labels for the widget
  labels: WidgetLabels;

  // Ayah identifier in S:V format (e.g. "33:56")
  ayah: string;

  // Whether any translations exist for the current ayah
  hasAnyTranslations: boolean;

  // Surah name to show in the header
  surahName?: string;

  // Custom width to constrain the widget (e.g. "600px" or "100%")
  customWidth?: string;

  // Custom height to constrain the widget (e.g. "500px")
  customHeight?: string;

  // Audio URL for playback
  audioUrl?: string;

  // Start time (seconds) for the selected ayah audio segment
  audioStart?: number;

  // End time (seconds) for the selected ayah audio segment
  audioEnd?: number;
};

export type WidgetColors = {
  borderColor: string;
  linkColor: string;
  secondaryBg: string;
  secondaryText: string;
  hoverBg: string;
  iconColor: string;
  bgColor: string;
  textColor: string;
};

export type WidgetLabels = {
  surah: string;
  verse: string;
  tafsirs: string;
  reflectionsAndLessons: string;
  answers: string;
};
