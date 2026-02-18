/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import Language from '@/types/Language';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import { getChapterData } from '@/utils/chapter';
import {
  Direction,
  isRTLLocale,
  toLocalizedNumber,
  toLocalizedVerseKey,
  toLocalizedVerseKeyRTL,
} from '@/utils/locale';
import { getResultType } from '@/utils/search';

/**
 * Normalizes a string value for comparison by trimming whitespace and converting to lowercase.
 * This ensures case-insensitive and whitespace-insensitive comparisons between names.
 *
 * @param {string | undefined} value - The string to normalize
 * @returns {string | undefined} The normalized string, or undefined if input is undefined
 *
 * @example
 * normalizeNameForComparison('  Al-Fatihah  ') // returns 'al-fatihah'
 * normalizeNameForComparison('THE OPENER') // returns 'the opener'
 */
export const normalizeNameForComparison = (value?: string) => value?.trim().toLowerCase();

/**
 * Determines whether the translated name should be displayed alongside the transliterated name.
 * This is used to avoid redundancy when both names are the same.
 *
 * @param {string | undefined} transliteratedName - The romanized/transliterated version of the name
 * @param {string | undefined} translatedName - The translated version in the user's locale
 * @returns {boolean} True if the translated name should be shown (names are different), false otherwise
 *
 * @example
 * shouldIncludeTranslatedName('Al-Fatihah', 'The Opener') // true - names differ
 * shouldIncludeTranslatedName('Al-Fatihah', 'al-fatihah') // false - same after normalization
 */
export const shouldIncludeTranslatedName = (
  transliteratedName?: string,
  translatedName?: string,
): boolean => {
  // Normalize both names for case-insensitive comparison
  const normalizedTransliteration = normalizeNameForComparison(transliteratedName);
  const normalizedTranslation = normalizeNameForComparison(translatedName);

  // Only include if translation exists AND differs from transliteration
  return !!translatedName && normalizedTranslation !== normalizedTransliteration;
};

/**
 * Generates the formatted display text for a Surah (chapter) search result.
 * The format is: `{number}. {transliteration} ({translation if different})`
 *
 * @param {SearchNavigationResult} result - The search result object containing result type info
 * @param {string} surahNumber - The chapter number (1-114)
 * @param {string} baseName - Fallback name if chapter data is unavailable
 * @param {any} chaptersData - The chapters metadata from DataContext containing names
 * @param {string} lang - The current locale code (e.g., 'en', 'ar', 'fr')
 * @returns {string | undefined} Formatted surah text, or undefined if not a SURAH result
 *
 * @example
 * // For Surah 1 in English:
 * getSurahDisplayText(result, '1', 'Al-Fatihah', chaptersData, 'en')
 * // Returns: "1. Al-Fatihah (The Opener)"
 */
export const getSurahDisplayText = (
  result: SearchNavigationResult,
  surahNumber: string,
  baseName: string,
  chaptersData: any,
  lang: string,
): string | undefined => {
  // Only process SURAH type results
  const type = getResultType(result);
  if (type !== SearchNavigationType.SURAH) return undefined;

  // Fetch chapter metadata for names
  const chapterData = surahNumber ? getChapterData(chaptersData, surahNumber) : undefined;
  const transliteratedName = chapterData?.transliteratedName;
  const translatedName = chapterData?.translatedName;

  // Convert surah number to localized format (e.g., "١" in Arabic, "1" in English)
  const localizedSurahNumber = surahNumber
    ? toLocalizedNumber(Number(surahNumber), lang)
    : undefined;

  // Determine if we should show the translation in parentheses
  const shouldShowTranslatedName = shouldIncludeTranslatedName(transliteratedName, translatedName);
  const translatedLabel = shouldShowTranslatedName ? translatedName : undefined;

  // Build the final display string
  const translatedSuffix = translatedLabel ? ` (${translatedLabel})` : '';
  const surahLabel = transliteratedName || baseName;
  const surahPrefix = localizedSurahNumber ? `${localizedSurahNumber}. ` : '';

  return `${surahPrefix}${surahLabel}${translatedSuffix}`.trim();
};

/**
 * Retrieves suffix parts needed to display a verse (Ayah) search result.
 *
 * @param {SearchNavigationResult} result - The search result object
 * @param {string} resultKeyString - The verse key string (e.g., "1:1" for Al-Fatihah verse 1)
 * @param {string} surahNumber - The chapter number extracted from the key
 * @param {any} arabicChaptersData - Chapter metadata specifically for Arabic locale
 * @param {any} chaptersData - Chapter metadata for the user's current locale
 * @param {string} lang - The current locale code
 * @returns {object} An object containing:
 *   - isAyahResult: Whether this is an Ayah-type result
 *   - arabicSuffixParts: Array of parts for Arabic suffix (e.g., ["الفاتحة", "١:١"])
 *   - translationSuffixParts: Array of parts for translation suffix (e.g., ["Al-Fatihah", "1:1"])
 */
export const getVerseTextData = (
  result: SearchNavigationResult,
  resultKeyString: string,
  surahNumber: string,
  arabicChaptersData: any,
  chaptersData: any,
  lang: string,
) => {
  // Determine if this is an Ayah-related result type
  const type = getResultType(result);
  const isAyahResult = [
    SearchNavigationType.AYAH,
    SearchNavigationType.TRANSLITERATION,
    SearchNavigationType.TRANSLATION,
  ].includes(type);

  // Return empty values for non-Ayah results
  if (!isAyahResult) {
    return {
      isAyahResult,
      arabicSuffixParts: [],
      translationSuffixParts: [],
    };
  }

  // Fetch chapter data for both Arabic and user's locale
  const arabicChapterData =
    arabicChaptersData && surahNumber ? getChapterData(arabicChaptersData, surahNumber) : undefined;
  const chapterData = surahNumber ? getChapterData(chaptersData, surahNumber) : undefined;

  // Get the transliterated name for the translation line suffix
  const transliteratedName = chapterData?.transliteratedName;

  // Get Arabic surah name (prefer nameArabic, fallback to translatedName)
  const arabicSurahName = arabicChapterData?.nameArabic || arabicChapterData?.translatedName;

  // Convert verse key to localized format for both Arabic and user's locale
  const arabicVerseKey = resultKeyString
    ? toLocalizedVerseKeyRTL(resultKeyString, Language.AR)
    : '';

  let localizedVerseKey = '';
  if (resultKeyString) {
    if (lang === Language.AR) {
      localizedVerseKey = toLocalizedVerseKeyRTL(resultKeyString, lang);
    } else {
      localizedVerseKey = toLocalizedVerseKey(resultKeyString, lang);
    }
  }

  // Build suffix arrays, filtering out undefined/null values
  const arabicSuffixParts = [arabicSurahName, arabicVerseKey].filter(Boolean) as string[];
  const translationSuffixParts = [transliteratedName, localizedVerseKey].filter(
    Boolean,
  ) as string[];

  return {
    isAyahResult,
    arabicSuffixParts,
    translationSuffixParts,
  };
};

/**
 * Builds the final display text lines for a search result row.
 * Handles three display scenarios:
 * 1. Surah results: Uses the formatted surah display text
 * 2. Ayah results: Arabic line with suffix, translation line with suffix
 * 3. Search page: Uses the "search for" translation key
 *
 * @param {SearchNavigationResult} result - The search result object
 * @param {string} baseName - The base/fallback name for display
 * @param {string | undefined} surahDisplayText - Pre-formatted surah text (from getSurahDisplayText)
 * @param {string | undefined} arabic - The Arabic text content of the verse (if available)
 * @param {boolean} isAyahResult - Whether this is an Ayah-type result
 * @param {string[]} arabicSuffixParts - Parts for Arabic line suffix (e.g., ["الفاتحة", "١:١"])
 * @param {string[]} translationSuffixParts - Parts for translation line suffix
 * @param {(key: string, values?: any) => string} t - The translation function from next-translate
 * @returns {object} An object containing:
 *   - arabicLine: The full Arabic text line with suffix (undefined if not Ayah)
 *   - translationLine: The translation/transliteration text line
 *   - singleLineText: Fallback single-line display text
 *   - isSearchPage: Whether this is a search page result
 *   - isSurahResult: Whether this is a surah result
 */
export const buildResultRowText = (
  result: SearchNavigationResult,
  baseName: string,
  surahDisplayText: string | undefined,
  arabic: string | undefined,
  isAyahResult: boolean,
  arabicSuffixParts: string[],
  translationSuffixParts: string[],
  t: (key: string, values?: any) => string,
) => {
  // Determine result type for conditional logic
  const type = getResultType(result);
  const isSearchPage = result.resultType === SearchNavigationType.SEARCH_PAGE;
  const isSurahResult = type === SearchNavigationType.SURAH;

  // Build Arabic line (only for Ayah results with Arabic content)
  // Format: "Arabic text (سورة الفاتحة ١:١)"
  let arabicLine: string | undefined;
  if (isAyahResult && arabic) {
    arabicLine = arabicSuffixParts.length ? `${arabic} (${arabicSuffixParts.join(' ')})` : arabic;
  }

  // Build translation line based on result type
  let translationLine: string;
  if (isSurahResult) {
    // Surah results use the pre-formatted surah display text
    translationLine = surahDisplayText || baseName;
  } else if (!isAyahResult) {
    // Non-Ayah, non-Surah results (e.g., Page, Juz) use base name directly
    translationLine = baseName;
  } else {
    // Ayah results: append suffix with surah name and verse key
    const suffixText = translationSuffixParts.length
      ? ` (${translationSuffixParts.join(' ')})`
      : '';
    translationLine = `${baseName}${suffixText}`;
  }

  // Build single-line fallback text (used for non-bilingual display)
  let singleLineText: string;
  if (isSearchPage) {
    // Search page row shows "Search for: {query}"
    singleLineText = t('search-for', { searchQuery: result.name });
  } else if (isSurahResult) {
    // Surah results use formatted surah text
    singleLineText = surahDisplayText || baseName;
  } else {
    // All other results use the translation line
    singleLineText = translationLine;
  }

  return {
    arabicLine,
    translationLine,
    singleLineText,
    isSearchPage,
    isSurahResult,
  };
};

/**
 * Determines the text direction (LTR/RTL) and language attributes for result layout.
 *
 * @param {boolean} isArabicResult - Whether the result content itself is in Arabic
 * @param {boolean} isSurahResult - Whether this is a surah-type result
 * @param {boolean} isSearchPage - Whether this is the "search for" row
 * @param {boolean} isArabic - Whether the normalized result has Arabic text
 * @param {string} lang - The current UI locale code
 * @returns {object} An object containing:
 *   - translationDir: Direction for the translation column ('ltr' or 'rtl')
 *   - singleLineDirection: Direction for single-line display
 *   - singleLineLanguage: Language attribute for the single-line element
 */
export const determineLayoutProps = (
  isArabicResult: boolean,
  isSurahResult: boolean,
  isSearchPage: boolean,
  isArabic: boolean,
  lang: string,
) => {
  // Determine translation column direction
  // For RTL locales, keep translation LTR (matches Arabic locale behavior).
  const isRtlLocale = isRTLLocale(lang);
  let translationDir = Direction.LTR;
  if (isRtlLocale && !isArabicResult && !isSurahResult && !isSearchPage) {
    translationDir = Direction.LTR;
  }

  // Single-line direction: RTL if content is Arabic OR locale is RTL
  const singleLineDirection = isArabic || isRtlLocale ? Direction.RTL : translationDir;

  // Determine language attribute for screen readers and spell checkers
  let singleLineLanguage = lang as Language;
  if (isArabic) {
    // Arabic content always gets 'ar' language attribute
    singleLineLanguage = Language.AR;
  }
  if (isSearchPage) {
    // Search page uses English for the "Search for:" text
    singleLineLanguage = Language.EN;
  }

  return {
    translationDir,
    singleLineDirection,
    singleLineLanguage,
  };
};
