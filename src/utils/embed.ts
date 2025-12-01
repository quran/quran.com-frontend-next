/* eslint-disable jsdoc/require-param-type, jsdoc/require-returns-type */
import {
  EmbedConfig,
  EmbedFontSize,
  EmbedFontToQuranFont,
  EmbedQueryParams,
  EmbedQuranFont,
  EmbedTextAlignment,
  EmbedTheme,
} from 'types/Embed';
import { QuranFont } from 'types/QuranReader';

/** Default reciter ID (Mishary Rashid Alafasy) */
export const DEFAULT_RECITER_ID = 7;

/**
 * Default embed configuration values.
 */
export const DEFAULT_EMBED_CONFIG: EmbedConfig = {
  chapterId: 1,
  fromVerse: 1,
  toVerse: 1,
  translations: [],
  theme: EmbedTheme.Light,
  locale: 'en',
  analyticsId: null,
  showReference: true,
  showTranslationName: true,
  textAlign: EmbedTextAlignment.Start,
  borderRadius: 8,
  quranFont: QuranFont.MadaniV2,
  fontSize: EmbedFontSize.Normal,
  showAudio: false,
  reciterId: DEFAULT_RECITER_ID,
  autoPlay: false,
  showWordByWord: false,
  wbwLocale: 'en',
  showWbwTransliteration: true,
  showTafsir: false,
};

/**
 * Maximum number of verses allowed in a single embed request.
 * This limit prevents abuse and ensures reasonable load times.
 */
export const MAX_EMBED_VERSES = 10;

interface ParsedVerseRange {
  chapterId: number;
  fromVerse: number;
  toVerse: number;
}

/**
 * Validates and parses a verse range string.
 * Supports formats: "1:1" (single verse), "1:1-7" (verse range)
 *
 * @param {string} verses - Verse range string
 * @returns {ParsedVerseRange | null} Parsed chapter and verse numbers, or null if invalid
 */
export const parseVerseRange = (verses: string): ParsedVerseRange | null => {
  if (!verses) return null;

  // Match patterns like "1:1" or "1:1-7"
  const singleVerseMatch = verses.match(/^(\d+):(\d+)$/);
  const rangeMatch = verses.match(/^(\d+):(\d+)-(\d+)$/);

  if (singleVerseMatch) {
    const chapterId = parseInt(singleVerseMatch[1], 10);
    const verseNum = parseInt(singleVerseMatch[2], 10);
    return { chapterId, fromVerse: verseNum, toVerse: verseNum };
  }

  if (rangeMatch) {
    const chapterId = parseInt(rangeMatch[1], 10);
    const fromVerse = parseInt(rangeMatch[2], 10);
    const toVerse = parseInt(rangeMatch[3], 10);

    // Validate range order
    if (fromVerse > toVerse) return null;

    // Enforce maximum verse limit
    if (toVerse - fromVerse + 1 > MAX_EMBED_VERSES) {
      return { chapterId, fromVerse, toVerse: fromVerse + MAX_EMBED_VERSES - 1 };
    }

    return { chapterId, fromVerse, toVerse };
  }

  return null;
};

/**
 * Validates that chapter and verse numbers are within valid ranges.
 *
 * @param {number} chapterId - Chapter number (1-114)
 * @param {number} fromVerse - Starting verse number
 * @param {number} toVerse - Ending verse number
 * @returns {boolean} Whether the values are valid
 */
export const isValidChapterAndVerse = (
  chapterId: number,
  fromVerse: number,
  toVerse: number,
): boolean => {
  // Valid chapter range is 1-114
  if (chapterId < 1 || chapterId > 114) return false;

  // Verses must be positive
  if (fromVerse < 1 || toVerse < 1) return false;

  // fromVerse must not exceed toVerse
  if (fromVerse > toVerse) return false;

  return true;
};

/**
 * Parses translation IDs from a comma-separated string.
 *
 * @param {string} translations - Comma-separated translation IDs
 * @returns {number[]} Array of valid translation IDs
 */
export const parseTranslations = (translations?: string): number[] => {
  if (!translations) return [];

  return translations
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !Number.isNaN(id) && id > 0);
};

/**
 * Parses a boolean query parameter string.
 *
 * @param {string | undefined} value - String value ('true', 'false', '1', '0')
 * @param {boolean} defaultValue - Default if not provided
 * @returns {boolean} Boolean value
 */
export const parseBooleanParam = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1';
};

/**
 * Resolves embed theme from query parameter.
 *
 * @param theme - Theme string from query
 * @returns {EmbedTheme} Resolved theme value
 */
const resolveTheme = (theme?: string): EmbedTheme => {
  if (theme && Object.values(EmbedTheme).includes(theme as EmbedTheme)) {
    return theme as EmbedTheme;
  }
  return EmbedTheme.Light;
};

/**
 * Resolves text alignment from query parameter.
 *
 * @param textAlign - Alignment string from query
 * @returns {EmbedTextAlignment} Resolved alignment value
 */
const resolveTextAlign = (textAlign?: string): EmbedTextAlignment => {
  if (textAlign && Object.values(EmbedTextAlignment).includes(textAlign as EmbedTextAlignment)) {
    return textAlign as EmbedTextAlignment;
  }
  return EmbedTextAlignment.Start;
};

/**
 * Resolves border radius from query parameter.
 *
 * @param borderRadius - Border radius string from query
 * @returns {number} Resolved border radius value
 */
const resolveBorderRadius = (borderRadius?: string): number => {
  const parsed = borderRadius ? parseInt(borderRadius, 10) : null;
  if (parsed !== null && !Number.isNaN(parsed)) return parsed;
  return DEFAULT_EMBED_CONFIG.borderRadius;
};

/**
 * Resolves Quran font from query parameter.
 *
 * @param font - Font string from query (v1, v2, uthmani, indopak)
 * @returns {QuranFont} Resolved Quran font value
 */
const resolveQuranFont = (font?: string): QuranFont => {
  if (font && Object.values(EmbedQuranFont).includes(font as EmbedQuranFont)) {
    return EmbedFontToQuranFont[font as EmbedQuranFont];
  }
  return DEFAULT_EMBED_CONFIG.quranFont;
};

/**
 * Resolves font size from query parameter.
 *
 * @param fontSize - Font size string from query
 * @returns {EmbedFontSize} Resolved font size value
 */
const resolveFontSize = (fontSize?: string): EmbedFontSize => {
  if (fontSize && Object.values(EmbedFontSize).includes(fontSize as EmbedFontSize)) {
    return fontSize as EmbedFontSize;
  }
  return DEFAULT_EMBED_CONFIG.fontSize;
};

/**
 * Resolves reciter ID from query parameter.
 *
 * @param reciter - Reciter ID string from query
 * @returns {number} Resolved reciter ID
 */
const resolveReciterId = (reciter?: string): number => {
  const parsed = reciter ? parseInt(reciter, 10) : null;
  if (parsed !== null && !Number.isNaN(parsed) && parsed > 0) return parsed;
  return DEFAULT_RECITER_ID;
};

/**
 * Parses and validates all embed query parameters into a configuration object.
 *
 * @param {Partial<EmbedQueryParams>} query - Raw query parameters
 * @param {string} defaultLocale - Default locale to use
 * @returns {EmbedConfig | null} Validated embed configuration or null if invalid
 */
export const parseEmbedConfig = (
  query: Partial<EmbedQueryParams>,
  defaultLocale: string = 'en',
): EmbedConfig | null => {
  const verseRange = parseVerseRange(query.verses || '');
  if (!verseRange) return null;

  const { chapterId, fromVerse, toVerse } = verseRange;
  if (!isValidChapterAndVerse(chapterId, fromVerse, toVerse)) return null;

  return {
    chapterId,
    fromVerse,
    toVerse,
    translations: parseTranslations(query.translations),
    theme: resolveTheme(query.theme),
    locale: query.locale || defaultLocale,
    analyticsId: query.aid || null, // Must be null, not undefined, for Next.js serialization
    showReference: parseBooleanParam(query.showReference, DEFAULT_EMBED_CONFIG.showReference),
    showTranslationName: parseBooleanParam(
      query.showTranslationName,
      DEFAULT_EMBED_CONFIG.showTranslationName,
    ),
    textAlign: resolveTextAlign(query.textAlign),
    borderRadius: resolveBorderRadius(query.borderRadius),
    quranFont: resolveQuranFont(query.font),
    fontSize: resolveFontSize(query.fontSize),
    showAudio: parseBooleanParam(query.audio, DEFAULT_EMBED_CONFIG.showAudio),
    reciterId: resolveReciterId(query.reciter),
    autoPlay: parseBooleanParam(query.autoPlay, DEFAULT_EMBED_CONFIG.autoPlay),
    showWordByWord: parseBooleanParam(query.wbw, DEFAULT_EMBED_CONFIG.showWordByWord),
    wbwLocale: query.wbwLocale || DEFAULT_EMBED_CONFIG.wbwLocale,
    showWbwTransliteration: parseBooleanParam(
      query.wbwTransliteration,
      DEFAULT_EMBED_CONFIG.showWbwTransliteration,
    ),
    showTafsir: parseBooleanParam(query.tafsir, DEFAULT_EMBED_CONFIG.showTafsir),
  };
};

/**
 * Generates an embed URL for sharing.
 *
 * @param {Partial<EmbedConfig>} config - Embed configuration
 * @param {string} baseUrl - Base URL of the embed endpoint
 * @returns {string} Full embed URL
 */
export const generateEmbedUrl = (config: Partial<EmbedConfig>, baseUrl: string = ''): string => {
  const params = new URLSearchParams();

  if (config.chapterId && config.fromVerse) {
    const verses =
      config.toVerse && config.toVerse !== config.fromVerse
        ? `${config.chapterId}:${config.fromVerse}-${config.toVerse}`
        : `${config.chapterId}:${config.fromVerse}`;
    params.set('verses', verses);
  }

  if (config.translations?.length) {
    params.set('translations', config.translations.join(','));
  }

  if (config.theme && config.theme !== EmbedTheme.Light) {
    params.set('theme', config.theme);
  }

  if (config.locale && config.locale !== 'en') {
    params.set('locale', config.locale);
  }

  if (config.analyticsId) {
    params.set('aid', config.analyticsId);
  }

  return `${baseUrl}/embed/v1?${params.toString()}`;
};
