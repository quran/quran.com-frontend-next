import { REPEAT_INFINITY } from '@/redux/types/AudioState';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

/**
 * Convert a persisted value (where -1 = Infinity) to the runtime value.
 * Used when reading from Redux/backend.
 *
 * @param {number | undefined} value - The persisted value (may be -1 for Infinity).
 * @param {number} fallback - The fallback value if value is undefined.
 * @returns {number} The runtime numeric value (with Infinity restored if needed).
 */
export const fromPersistedValue = (value: number | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  if (value === REPEAT_INFINITY) return Infinity;
  return value;
};

/**
 * Convert a runtime value (where Infinity is possible) to the persisted value.
 * Used when saving to Redux/backend (which can't store Infinity).
 *
 * @param {number} value - The runtime value (may be Infinity).
 * @returns {number} The value ready for persistence (-1 if Infinity).
 */
export const toPersistedValue = (value: number): number => {
  if (value === Infinity || !Number.isFinite(value)) return REPEAT_INFINITY;
  return value;
};

/**
 * Ensure from <= to by swapping if needed.
 * This prevents invalid ranges where the start verse is after the end verse.
 *
 * Note: Both verses must be from the same chapter. If they're from different
 * chapters, the original values are returned without swapping.
 *
 * @param {string} fromKey - The starting verse key (e.g. "1:2").
 * @param {string} toKey - The ending verse key (e.g. "1:5").
 * @returns {{ from: string; to: string }} Normalized verse range with from <= to guaranteed.
 */
export const normalizeVerseRange = (
  fromKey: string,
  toKey: string,
): { from: string; to: string } => {
  const fromChapter = getChapterNumberFromKey(fromKey);
  const toChapter = getChapterNumberFromKey(toKey);

  // If verses are from different chapters, return as-is (shouldn't happen in normal usage)
  if (fromChapter !== toChapter) {
    return { from: fromKey, to: toKey };
  }

  const fromVerse = getVerseNumberFromKey(fromKey);
  const toVerse = getVerseNumberFromKey(toKey);

  // Swap if from > to
  if (fromVerse > toVerse) {
    return { from: toKey, to: fromKey };
  }

  return { from: fromKey, to: toKey };
};

/**
 * Check if a verse key belongs to the given chapter.
 * Used to validate persisted from/to values when switching chapters.
 *
 * @param {string | undefined} verseKey - The verse key to check (e.g. "1:2").
 * @param {number} chapterNumber - The chapter number to check against.
 * @returns {boolean} True if the verse key belongs to the chapter.
 */
export const isVerseInChapter = (verseKey: string | undefined, chapterNumber: number): boolean => {
  if (!verseKey) return false;
  return getChapterNumberFromKey(verseKey) === chapterNumber;
};
