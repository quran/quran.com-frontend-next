import { QuranFont } from './QuranReader';

/**
 * Embed widget configuration types for the Quran.com embed feature.
 * Allows third-party websites to embed Quran verses with translations.
 */

/** Supported embed themes */
export enum EmbedTheme {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto',
}

/** Embed text alignment options */
export enum EmbedTextAlignment {
  Start = 'start',
  Center = 'center',
  End = 'end',
}

/** Supported Quran fonts for embed */
export enum EmbedQuranFont {
  MadaniV1 = 'v1',
  MadaniV2 = 'v2',
  Uthmani = 'uthmani',
  IndoPak = 'indopak',
}

/** Font size options for embed */
export enum EmbedFontSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
  XLarge = 'xlarge',
}

/** Map embed font values to QuranFont enum */
export const EmbedFontToQuranFont: Record<EmbedQuranFont, QuranFont> = {
  [EmbedQuranFont.MadaniV1]: QuranFont.MadaniV1,
  [EmbedQuranFont.MadaniV2]: QuranFont.MadaniV2,
  [EmbedQuranFont.Uthmani]: QuranFont.Uthmani,
  [EmbedQuranFont.IndoPak]: QuranFont.IndoPak,
};

/**
 * Query parameters accepted by the embed endpoint.
 * Example: /embed/v1?verses=1:1-7&translations=131,85&theme=light&font=v2
 */
export interface EmbedQueryParams {
  /** Verse range in format "chapter:from-to" or single verse "chapter:verse" */
  verses: string;
  /** Comma-separated translation IDs */
  translations?: string;
  /** Theme for the embed widget */
  theme?: string;
  /** Locale/language code */
  locale?: string;
  /** Analytics ID for tracking (optional) */
  aid?: string;
  /** Whether to show the verse reference (default: true) */
  showReference?: string;
  /** Whether to show the translation author name (default: true) */
  showTranslationName?: string;
  /** Text alignment for the content */
  textAlign?: string;
  /** Border radius in pixels */
  borderRadius?: string;
  /** Quran font style (v1, v2, uthmani, indopak) */
  font?: string;
  /** Font size scale (small, normal, large, xlarge) */
  fontSize?: string;
  /** Enable audio player */
  audio?: string;
  /** Reciter ID for audio */
  reciter?: string;
  /** Auto-play audio on load */
  autoPlay?: string;
  /** Enable word-by-word translation */
  wbw?: string;
  /** Word-by-word translation locale */
  wbwLocale?: string;
  /** Show word-by-word transliteration */
  wbwTransliteration?: string;
  /** Show tafsir button */
  tafsir?: string;
}

/**
 * Parsed and validated embed configuration.
 */
export interface EmbedConfig {
  chapterId: number;
  fromVerse: number;
  toVerse: number;
  translations: number[];
  theme: EmbedTheme;
  locale: string;
  analyticsId: string | null;
  showReference: boolean;
  showTranslationName: boolean;
  textAlign: EmbedTextAlignment;
  borderRadius: number;
  /** The Quran font to use for Arabic text */
  quranFont: QuranFont;
  /** Font size scale */
  fontSize: EmbedFontSize;
  /** Enable audio player */
  showAudio: boolean;
  /** Reciter ID for audio playback */
  reciterId: number;
  /** Auto-play audio on load */
  autoPlay: boolean;
  /** Enable word-by-word translation */
  showWordByWord: boolean;
  /** Word-by-word translation locale */
  wbwLocale: string;
  /** Show word-by-word transliteration */
  showWbwTransliteration: boolean;
  /** Show tafsir button */
  showTafsir: boolean;
}

/**
 * Analytics event data collected for embed usage tracking.
 */
export interface EmbedAnalyticsEvent {
  /** Type of event */
  type: 'load' | 'error';
  /** Referer domain */
  referer?: string;
  /** Analytics ID provided by embedder */
  analyticsId?: string;
  /** Verses being viewed */
  verses: string;
  /** Translations selected */
  translations: number[];
  /** Locale used */
  locale: string;
  /** Theme applied */
  theme: EmbedTheme;
  /** Timestamp */
  timestamp: number;
}
