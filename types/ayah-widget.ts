import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';

export type MushafType = 'qpc' | 'kfgqpc_v1' | 'kfgqpc_v2' | 'indopak' | 'tajweed';

/**
 * Options for configuring the Ayah Widget.
 */
export type WidgetOptions = {
  // Should the widget has a play button
  enableAudio: boolean;

  // Should the widget display inline word-by-word translations
  enableWbw: boolean;

  // The theme of the widget
  theme: ThemeTypeVariant;

  // The type of Mushaf to display
  mushaf: MushafType;

  // Should the widget display translator names
  showTranslatorNames: boolean;

  // Should the widget display the Quran.com link
  showQuranLink: boolean;

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
