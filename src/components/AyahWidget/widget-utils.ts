import ThemeType from '@/redux/types/ThemeType';
import type { WidgetOptions, WidgetColors } from '@/types/Embed';
import { getVerseWords } from '@/utils/verse';
import type Verse from 'types/Verse';

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
 * @returns {WidgetColors} The widget color configuration.
 */
export const getColors = (): WidgetColors => {
  return {
    borderColor: 'var(--color-borders-hairline)',
    linkColor: 'var(--color-text-link)',
    secondaryBg: 'var(--color-background-alternative-faint)',
    secondaryText: 'var(--color-text-faded)',
    hoverBg: 'var(--color-background-alternative-medium)',
    iconColor: 'var(--color-grey-icons)',
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
