import { getVerseAndChapterNumbersFromKey, makeVerseKey } from '@/utils/verse';

export type StartingVerseTarget = {
  chapterId: string;
  verseNumber: number;
  verseKey: string;
  isChapterNumericFormat: boolean;
};

type GetStartingVerseTargetParams = {
  startingVerse?: string;
  chapterIdFromLoadedVerses?: string;
  isChapterScopedRoute: boolean;
};

/**
 * Parse a SS:VV value into a validated target.
 * @returns {StartingVerseTarget | null}
 */
const getKeyFormatTarget = (startingVerse: string): StartingVerseTarget | null => {
  const [targetChapterId, targetVerseNumber] = getVerseAndChapterNumbersFromKey(startingVerse);
  const parsedChapterId = Number(targetChapterId);
  const parsedVerseNumber = Number(targetVerseNumber);

  if (!Number.isInteger(parsedChapterId) || parsedChapterId <= 0) return null; // Reject invalid chapter ids.
  if (!Number.isInteger(parsedVerseNumber) || parsedVerseNumber <= 0) return null; // Reject invalid verse numbers.

  return {
    chapterId: String(parsedChapterId),
    verseNumber: parsedVerseNumber,
    verseKey: makeVerseKey(parsedChapterId, parsedVerseNumber),
    isChapterNumericFormat: false, // Mark as key format.
  };
};

/**
 * Parse a chapter-scoped numeric verse into a target.
 * @returns {StartingVerseTarget | null}
 */
const getChapterFormatTarget = (
  startingVerse: string,
  chapterIdFromLoadedVerses: string,
): StartingVerseTarget | null => {
  const parsedVerseNumber = Number(startingVerse); // Parse numeric chapter format (V).
  if (!Number.isInteger(parsedVerseNumber) || parsedVerseNumber <= 0) return null; // Reject invalid verse numbers.

  return {
    chapterId: chapterIdFromLoadedVerses,
    verseNumber: parsedVerseNumber,
    verseKey: makeVerseKey(chapterIdFromLoadedVerses, parsedVerseNumber),
    isChapterNumericFormat: true,
  };
};

/**
 * Normalize and validate both V and SS:VV startingVerse formats.
 * @returns {StartingVerseTarget | null}
 */
export const getStartingVerseTarget = ({
  startingVerse,
  chapterIdFromLoadedVerses,
  isChapterScopedRoute,
}: GetStartingVerseTargetParams): StartingVerseTarget | null => {
  if (!startingVerse) return null;
  if (startingVerse.includes(':')) return getKeyFormatTarget(startingVerse); // Handle multi-surah key format (SS:VV).
  if (!isChapterScopedRoute || !chapterIdFromLoadedVerses) return null; // Ignore numeric format on multi-surah routes.
  return getChapterFormatTarget(startingVerse, chapterIdFromLoadedVerses);
};
