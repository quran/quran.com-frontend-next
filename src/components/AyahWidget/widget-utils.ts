/* eslint-disable max-lines */
import ThemeType from '@/redux/types/ThemeType';
import type { WidgetOptions, WidgetColors, WidgetTrimOptions, WordTrimRange } from '@/types/Embed';
import { stripHtml } from '@/utils/string';
import { getVerseWords } from '@/utils/verse';
import type Verse from 'types/Verse';
import type Word from 'types/Word';

/** Default font scale for widget (medium size). */
export const WIDGET_FONT_SCALE = 3;

/** Fixed Arabic font size for the widget (non-responsive). */
export const WIDGET_ARABIC_FONT_SIZE = '28px';

/** Fixed translation font size for the widget (non-responsive). */
export const WIDGET_TRANSLATION_FONT_SIZE = '16px';

/**
 * Map widget theme to Tajweed font-palette CSS value.
 * The font palettes are defined by TajweedFontPalettes component.
 * @param {WidgetOptions['theme']} theme - The widget theme.
 * @returns {string} The CSS font-palette value.
 */
export const getTajweedFontPalette = (theme: WidgetOptions['theme']): string => {
  switch (theme) {
    case ThemeType.Dark:
      return '--Dark';
    case ThemeType.Sepia:
      return '--Sepia';
    case ThemeType.Light:
    default:
      return '--Light';
  }
};

/**
 * Get the data-theme attribute value for the widget.
 * @param {WidgetOptions['theme']} theme - The widget theme.
 * @returns {string} The data-theme attribute value.
 */
export const getThemeDataAttribute = (theme: WidgetOptions['theme']): string => {
  switch (theme) {
    case ThemeType.Dark:
      return 'dark';
    case ThemeType.Sepia:
      return 'sepia';
    case ThemeType.Light:
    default:
      return 'light';
  }
};

/**
 * Get widget colors using CSS variables.
 * These will be resolved based on data-theme attribute.
 * @param {WidgetOptions['theme']} theme - Widget theme.
 * @returns {WidgetColors} The widget color configuration.
 */
export const getColors = (theme: WidgetOptions['theme']): WidgetColors => {
  // for sepia theme, we use a different color for icons to ensure sufficient contrast
  const iconColor =
    theme === ThemeType.Sepia ? 'var(--color-blue-buttons-and-icons)' : 'var(--color-grey-icons)';

  return {
    borderColor: 'var(--color-borders-hairline)',
    linkColor: 'var(--color-text-link)',
    secondaryBg: 'var(--color-background-alternative-faint)',
    secondaryText: 'var(--color-text-faded)',
    hoverBg: 'var(--color-background-alternative-medium)',
    iconColor,
    bgColor: 'var(--color-background-default)',
    textColor: 'var(--color-text-default)',
  };
};

/**
 * Get the content padding for the widget.
 * @param {boolean} showArabic Whether to show the Arabic text.
 * @param {boolean} hasTranslations Whether the verse has translations.
 * @returns {string} The content padding CSS value.
 */
export const getContentPadding = (showArabic: boolean, hasTranslations: boolean): string => {
  if (!showArabic) {
    // Add 16px top padding when Arabic is hidden to prevent translation from touching header
    return '16px 24px 0 24px';
  }
  return hasTranslations ? '20px 24px 0 24px' : '20px 24px 20px 24px';
};

/**
 * Get the margin-top value for a verse item based on its position.
 * @param {number} index The index of the verse in the list.
 * @param {boolean} showArabic Whether the Arabic text is shown.
 * @returns {number} The margin-top value in pixels.
 */
export const getVerseMarginTop = (index: number, showArabic: boolean): number => {
  if (index === 0) {
    return 0;
  }
  if (showArabic) {
    return 20;
  }
  return 0;
};

type NormalizedWordRange = {
  startWordIndex: number;
  endWordIndex: number;
};

/**
 * Normalize and clamp a word range into [0..length-1].
 *
 * @param {number} length - Number of words.
 * @param {number | undefined} startWordIndex - Requested start index.
 * @param {number | undefined} endWordIndex - Requested end index.
 * @returns {NormalizedWordRange | undefined} Normalized range or undefined when empty.
 */
export const normalizeWordRange = (
  length: number,
  startWordIndex?: number,
  endWordIndex?: number,
): NormalizedWordRange | undefined => {
  if (!length) return undefined;

  const lastWordIndex = length - 1;
  const start = Math.max(0, Math.min(startWordIndex ?? 0, lastWordIndex));
  const end = Math.max(0, Math.min(endWordIndex ?? lastWordIndex, lastWordIndex));

  if (start > end) return undefined;

  return { startWordIndex: start, endWordIndex: end };
};

/**
 * Trim Arabic words using an inclusive start / inclusive end range.
 * The verse-end number token is preserved when the selected range includes
 * the last Arabic word of the verse.
 *
 * @param {Word[]} words - Verse words.
 * @param {WordTrimRange | undefined} trimRange - Optional trim range.
 * @returns {Word[]} Trimmed words.
 */
export const trimArabicWords = (words: Word[], trimRange?: WordTrimRange): Word[] => {
  if (!trimRange) return words;

  const arabicWords = words.filter((word) => word.charTypeName !== 'end');
  const verseEndWords = words.filter((word) => word.charTypeName === 'end');

  const normalized = normalizeWordRange(
    arabicWords.length,
    trimRange.startWordIndex,
    trimRange.endWordIndex,
  );

  if (!normalized) return [];

  const trimmed = arabicWords.slice(normalized.startWordIndex, normalized.endWordIndex + 1);

  // Preserve verse-end marker if last Arabic word is included
  if (normalized.endWordIndex === arabicWords.length - 1 && verseEndWords.length) {
    return [...trimmed, ...verseEndWords];
  }

  return trimmed;
};

/**
 * Trim translation text by words in plain-text mode
 *
 * @param {string} text - Translation text.
 * @param {WordTrimRange} trimRange - Trim range.
 * @returns {string} Trimmed plain text.
 */
export const trimTranslationTextPlain = (text: string, trimRange: WordTrimRange): string => {
  const plainText = stripHtml(text);
  const words = plainText.split(/\s+/).filter(Boolean);

  const normalized = normalizeWordRange(
    words.length,
    trimRange.startWordIndex,
    trimRange.endWordIndex,
  );

  if (!normalized) return '';

  return words.slice(normalized.startWordIndex, normalized.endWordIndex + 1).join(' ');
};

/**
 * Resolve the effective trim range for a verse based on its position and the overall range settings.
 *
 * @returns {WordTrimRange | undefined} The resolved trim range for the verse, or undefined if no trimming should be applied.
 */
const resolveVerseTrimRange = (
  trimRange: WordTrimRange | undefined,
  isRangeEnabled: boolean,
  isFirstVerse: boolean,
  isLastVerse: boolean,
): WordTrimRange | undefined => {
  if (!trimRange) return undefined;
  if (!isRangeEnabled) return trimRange;

  const scopedRange: WordTrimRange = {};
  if (isFirstVerse) scopedRange.startWordIndex = trimRange.startWordIndex;
  if (isLastVerse) scopedRange.endWordIndex = trimRange.endWordIndex;

  if (scopedRange.startWordIndex === undefined && scopedRange.endWordIndex === undefined) {
    return undefined;
  }

  return scopedRange;
};

type VerseTrimPosition = {
  isFirstVerse: boolean;
  isLastVerse: boolean;
};

const trimVerseTranslations = (
  verse: Verse,
  translationRanges: WidgetTrimOptions['translations'],
  isRangeEnabled: boolean,
  position: VerseTrimPosition,
): Verse['translations'] => {
  if (!translationRanges || !verse.translations?.length) return verse.translations;

  return verse.translations.map((translation) => {
    const translationId = translation.resourceId ?? translation.id;
    if (!translationId) return translation;

    const scopedTrim = resolveVerseTrimRange(
      translationRanges[String(translationId)],
      isRangeEnabled,
      position.isFirstVerse,
      position.isLastVerse,
    );
    if (!scopedTrim) return translation;

    return {
      ...translation,
      text: trimTranslationTextPlain(translation.text, scopedTrim),
    };
  });
};

const applyTrimToVerse = (
  verse: Verse,
  trim: WidgetTrimOptions,
  isRangeEnabled: boolean,
  position: VerseTrimPosition,
): Verse => {
  const scopedArabicTrim = resolveVerseTrimRange(
    trim.arabic,
    isRangeEnabled,
    position.isFirstVerse,
    position.isLastVerse,
  );
  const nextWords = scopedArabicTrim ? trimArabicWords(verse.words, scopedArabicTrim) : verse.words;
  const nextTranslations = trimVerseTranslations(
    verse,
    trim.translations,
    isRangeEnabled,
    position,
  );

  if (nextWords === verse.words && nextTranslations === verse.translations) return verse;
  return { ...verse, words: nextWords, translations: nextTranslations };
};

/**
 * Apply prop-based trimming to Arabic and translation words across verses.
 *
 * @param {Verse[]} verses - Raw verses.
 * @param {WidgetTrimOptions | undefined} trim - Trim config.
 * @param {boolean} isRangeEnabled - Whether widget is rendering a verse range.
 * @returns {Verse[]} Trimmed verses.
 */
export const applyWidgetTrimToVerses = (
  verses: Verse[],
  trim: WidgetTrimOptions | undefined,
  isRangeEnabled: boolean,
): Verse[] => {
  if (!verses.length || !trim) return verses;
  if (!trim.arabic && !trim.translations) return verses;

  return verses.map((verse, index) => {
    // Determine if this verse is the first or last in the range for trimming purposes
    const position = {
      isFirstVerse: index === 0,
      isLastVerse: index === verses.length - 1,
    };
    return applyTrimToVerse(verse, trim, isRangeEnabled, position);
  });
};

/**
 * Grouped translation item for merged verse display.
 */
export type GroupedTranslation = {
  translatorName: string;
  languageId: number;
  texts: string[];
};

/**
 * Group translations by translator (resourceName or authorName).
 * Used in merged mode to display all verses' translations grouped by translator.
 *
 * @param {Verse[]} verses - Array of verses.
 * @returns {GroupedTranslation[]} Grouped translations.
 */
export const groupTranslationsByTranslator = (verses: Verse[]): GroupedTranslation[] => {
  const translatorMap = new Map<string, { languageId: number; texts: string[] }>();

  verses.forEach((verse) => {
    verse.translations?.forEach((translation) => {
      const translatorName = translation.resourceName || translation.authorName || 'Unknown';
      const existing = translatorMap.get(translatorName);

      // Prefix with verse number for merged display
      const textWithNumber = `${translation.text} (${verse.verseNumber})`;

      if (existing) {
        existing.texts.push(textWithNumber);
      } else {
        translatorMap.set(translatorName, {
          languageId: translation.languageId,
          texts: [textWithNumber],
        });
      }
    });
  });

  return Array.from(translatorMap.entries()).map(([translatorName, data]) => ({
    translatorName,
    languageId: data.languageId,
    texts: data.texts,
  }));
};

/**
 * Copy data structure for the widget.
 */
export type WidgetCopyData = {
  mergeVerses: boolean;
  verses: {
    verseNumber: number;
    arabicText: string;
    translations: { text: string; translatorName?: string }[];
  }[];
};

/**
 * Build copy data from verses for the widget.
 * This creates a structured object that can be serialized and used by the copy handler.
 *
 * @param {Verse[]} verses - Array of verses.
 * @param {WidgetOptions} options - Widget options.
 * @returns {WidgetCopyData} Copy data object.
 */
export const buildWidgetCopyData = (verses: Verse[], options: WidgetOptions): WidgetCopyData => {
  const verseData = verses.map((verse) => {
    // Get Arabic text from words' textUthmani (plain Arabic, not font glyphs)
    let arabicText = '';
    if (options.showArabic) {
      const words = getVerseWords(verse);
      arabicText = words
        .filter((word) => word.charTypeName !== 'end') // Exclude verse end markers
        .map((word) => word.textUthmani || word.text || '')
        .join(' ')
        .trim();
    }

    // Collect translations
    const translations = (verse.translations || []).map((translation) => ({
      text: translation.text.replace(/<[^>]*>/g, ''), // Strip HTML tags
      translatorName: options.showTranslatorNames
        ? translation.resourceName || translation.authorName
        : undefined,
    }));

    return {
      verseNumber: verse.verseNumber,
      arabicText,
      translations,
    };
  });

  return {
    mergeVerses: Boolean(options.mergeVerses && options.rangeEnd),
    verses: verseData,
  };
};
