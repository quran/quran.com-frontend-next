import { VersesResponse } from '@/types/ApiResponses';
import { ReadingBookmarkType } from '@/types/Bookmark';

interface ParsedBookmarkResult {
  surahNumber: number | null;
  verseNumber: number | null;
}

interface RecentlyReadVerse {
  surah?: string | number;
  ayah?: string | number;
}

/**
 * Extracts the page number from a bookmark string if it's a page bookmark.
 *
 * @param {string | null | undefined} bookmark - The bookmark string in format "page:123" or "ayah:1:2"
 * @returns {number | null} The page number if bookmark is a page bookmark, null otherwise
 */
export const getPageNumberFromBookmark = (bookmark: string | null | undefined): number | null => {
  if (!bookmark) return null;

  const parts = bookmark.split(':');
  if (parts[0] === ReadingBookmarkType.PAGE && parts.length === 2) {
    return Number(parts[1]);
  }
  return null;
};

/**
 * Parses a reading bookmark string to extract surah and verse numbers.
 * Falls back to recently read verses if reading bookmark is not available.
 * Supports both ayah bookmarks (ayah:surah:verse) and page bookmarks (page:number).
 *
 * @param {string | null | undefined} bookmark - The bookmark string to parse
 * @param {PageVersesData | null | undefined} pageVersesData - Page verses data for page bookmarks
 * @param {RecentlyReadVerse[] | null | undefined} recentlyReadVerseKeys - Fallback recently read verses
 * @returns {ParsedBookmarkResult} Object containing surahNumber and verseNumber
 */
export const parseReadingBookmark = (
  bookmark: string | null | undefined,
  pageVersesData: VersesResponse | null | undefined,
  recentlyReadVerseKeys: RecentlyReadVerse[] | null | undefined,
): ParsedBookmarkResult => {
  // Primary: Use reading bookmark if available
  if (bookmark) {
    const parts = bookmark.split(':');

    if (parts[0] === ReadingBookmarkType.AYAH && parts.length === 3) {
      return {
        surahNumber: Number(parts[1]),
        verseNumber: Number(parts[2]),
      };
    }

    if (parts[0] === ReadingBookmarkType.PAGE && parts.length === 2) {
      // For page bookmarks, get the first verse from the fetched page verses
      if (pageVersesData?.verses && pageVersesData.verses.length > 0) {
        const firstVerse = pageVersesData.verses[0];
        return {
          surahNumber: Number(firstVerse.chapterId),
          verseNumber: Number(firstVerse.verseNumber),
        };
      }
      // Return null if page verses are not yet loaded
      return { surahNumber: null, verseNumber: null };
    }
  }

  // Fallback: Use recently read verses if reading bookmark is not available
  if (recentlyReadVerseKeys && recentlyReadVerseKeys.length > 0) {
    const lastReadVerse = recentlyReadVerseKeys[0];
    return {
      surahNumber: lastReadVerse?.surah ? Number(lastReadVerse.surah) : 1,
      verseNumber: lastReadVerse?.ayah ? Number(lastReadVerse.ayah) : null,
    };
  }

  // Default fallback
  return { surahNumber: 1, verseNumber: null };
};
