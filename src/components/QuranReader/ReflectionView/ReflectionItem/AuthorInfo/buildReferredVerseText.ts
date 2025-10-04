import { isRTLLocale, toLocalizedNumber } from '@/utils/locale';
import { makeVerseKey } from '@/utils/verse';
import { ReflectionVerseReference } from 'types/QuranReflect/ReflectionVerseReference';

const LTR_COMMA = ',';
const AR_COMMA = '، ';

/**
 * Checks if a reference is chapter-only (no specific verses)
 *
 * @param {ReflectionVerseReference} verse - The verse reference to check
 * @returns {boolean} True if the reference is chapter-only
 */
const isChapterOnly = (verse: ReflectionVerseReference): boolean => {
  return !verse.from || !verse.to;
};

/**
 * Checks if a reference has a verse range (from !== to)
 *
 * @param {ReflectionVerseReference} verse - The verse reference to check
 * @returns {boolean} True if the reference has a range
 */
const hasRange = (verse: ReflectionVerseReference): boolean => {
  return (
    typeof verse.from === 'number' &&
    typeof verse.to === 'number' &&
    verse.from > 0 &&
    verse.to > 0 &&
    verse.to !== verse.from
  );
};

/**
 * Build the referred verse text for RTL locales (Arabic, Urdu, Farsi, etc.)
 * RTL format: verse:chapter (e.g., "5:2" means verse 5 of chapter 2)
 *
 * @param {ReflectionVerseReference[]} verseReferences - All verse references
 * @param {ReflectionVerseReference[]} nonChapterVerseReferences - Verse references with specific verses
 * @param {string} lang - Language code
 * @param {Function} t - Translation function
 * @returns {string} Formatted text string
 */
function buildRTLText(
  verseReferences: ReflectionVerseReference[],
  nonChapterVerseReferences: ReflectionVerseReference[],
  lang: string,
  t: (key: string) => string,
): string {
  const chapterNumbers = verseReferences
    .filter(isChapterOnly)
    .map((verse) => toLocalizedNumber(verse.chapter, lang));

  const chaptersText = chapterNumbers.join(AR_COMMA);

  const verseItems = nonChapterVerseReferences.map((verse) => {
    const chapterNum = toLocalizedNumber(verse.chapter, lang);
    const startAyah = toLocalizedNumber(verse.from!, lang);
    const isRange = hasRange(verse);
    const endAyah = isRange ? toLocalizedNumber(verse.to!, lang) : '';
    return isRange ? `${startAyah}:${chapterNum}-${endAyah}` : `${startAyah}:${chapterNum}`;
  });

  const versesText = verseItems.join(AR_COMMA);

  if (chaptersText && versesText) {
    return `${t('common:surah')} ${chaptersText} ${t('common:and')} ${t(
      'common:ayah',
    )} ${versesText}`;
  }
  if (chaptersText) return `${t('common:surah')} ${chaptersText}`;
  if (versesText) return `${t('common:ayah')} ${versesText}`;
  return '';
}

/**
 * Build the referred verse text for LTR locales (English, etc.)
 * LTR format: chapter:verse (e.g., "2:5" means verse 5 of chapter 2)
 *
 * @param {ReflectionVerseReference[]} verseReferences - All verse references
 * @param {ReflectionVerseReference[]} nonChapterVerseReferences - Verse references with specific verses
 * @param {string} lang - Language code
 * @param {Function} t - Translation function
 * @returns {string} Formatted text string
 */
function buildLTRText(
  verseReferences: ReflectionVerseReference[],
  nonChapterVerseReferences: ReflectionVerseReference[],
  lang: string,
  t: (key: string) => string,
): string {
  const chapters = verseReferences
    .filter(isChapterOnly)
    .map((verse) => toLocalizedNumber(verse.chapter, lang));

  let text = '';
  if (chapters.length > 0) {
    text += `${t('common:surah')} ${chapters.join(LTR_COMMA)}`;
  }

  const verses = nonChapterVerseReferences.map((verse) =>
    makeVerseKey(
      toLocalizedNumber(verse.chapter, lang),
      toLocalizedNumber(verse.from!, lang),
      toLocalizedNumber(verse.to!, lang),
    ),
  );

  if (verses.length > 0) {
    if (chapters.length > 0) text += ` ${t('common:and')} `;
    text += `${t('common:ayah')} ${verses.join(LTR_COMMA)}`;
  }

  return text;
}

/**
 * Build a localized text representation of verse references
 * Handles both RTL and LTR locales with appropriate formatting
 *
 * @param {ReflectionVerseReference[]} verseReferences - All verse references (including chapter-only)
 * @param {string} lang - Language code
 * @param {Function} t - Translation function
 * @returns {string} Formatted text string
 */
export default function buildReferredVerseText(
  verseReferences: ReflectionVerseReference[],
  lang: string,
  t: (key: string) => string,
): string {
  const nonChapterVerseReferences = verseReferences.filter((verse) => verse.from && verse.to);

  return isRTLLocale(lang)
    ? buildRTLText(verseReferences, nonChapterVerseReferences, lang, t)
    : buildLTRText(verseReferences, nonChapterVerseReferences, lang, t);
}
