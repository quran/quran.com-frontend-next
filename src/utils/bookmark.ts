import { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';

interface ParsedBookmarkResult {
  surahNumber: number | null;
  verseNumber: number | null;
  pageNumber?: number | null;
}

interface RecentlyReadVerse {
  surah?: string | number;
  ayah?: string | number;
}

// Reading bookmark format: "ayah:chapterId:verseNumber" or "page:pageNumber"
// Examples: "ayah:1:5" (chapter 1, verse 5), "page:42" (page 42)
export type ReadingBookmark = string | null;

/**
 * Validates the bookmark format.
 * @param {ReadingBookmark} bookmark The bookmark to validate
 * @returns {boolean} True if valid format, false otherwise
 */
export const isValidReadingBookmarkFormat = (bookmark: ReadingBookmark): boolean => {
  if (!bookmark) {
    return true;
  }

  // Validate "ayah:chapterId:verseNumber" format
  const ayahPattern = /^ayah:\d+:\d+$/;
  if (ayahPattern.test(bookmark)) {
    return true;
  }

  // Validate "page:pageNumber" or "page:pageNumber:surah:verse" formats
  const pagePatternSimple = /^page:\d+$/;
  const pagePatternExtended = /^page:\d+:\d+:\d+$/;
  if (pagePatternSimple.test(bookmark) || pagePatternExtended.test(bookmark)) {
    return true;
  }

  return false;
};

// page:pageNumber:surahNumber:verseNumber
const READING_BOOKMARK_PAGE_PARTS_LENGTH = 4;

// ayah:surahNumber:verseNumber
const READING_BOOKMARK_AYAH_PARTS_LENGTH = 3;

/**
 * Parses a reading bookmark string to extract surah and verse numbers.
 * Falls back to recently read verses if reading bookmark is not available.
 * Supports both ayah bookmarks (ayah:surah:verse) and page bookmarks (page:pageNumber:surah:verse).
 *
 * @param {string | null | undefined} bookmark - The bookmark string to parse
 * @param {RecentlyReadVerse[] | null | undefined} recentlyReadVerseKeys - Fallback recently read verses
 * @returns {ParsedBookmarkResult} Object containing surahNumber and verseNumber
 */
// eslint-disable-next-line react-func/max-lines-per-function
export const parseReadingBookmark = (
  bookmark: string | null | undefined,
  recentlyReadVerseKeys: RecentlyReadVerse[] | null | undefined = null,
): ParsedBookmarkResult => {
  if (!isValidReadingBookmarkFormat(bookmark)) {
    return { surahNumber: 1, verseNumber: null };
  }
  // Primary: Use reading bookmark if available
  if (bookmark) {
    const parts = bookmark.split(':');

    if (
      parts[0] === ReadingBookmarkType.AYAH &&
      parts.length === READING_BOOKMARK_AYAH_PARTS_LENGTH
    ) {
      return {
        surahNumber: Number(parts[1]),
        verseNumber: Number(parts[2]),
      };
    }

    if (
      parts[0] === ReadingBookmarkType.PAGE &&
      parts.length === READING_BOOKMARK_PAGE_PARTS_LENGTH
    ) {
      return {
        surahNumber: Number(parts[2]),
        verseNumber: Number(parts[3]),
        pageNumber: Number(parts[1]),
      };
    }
    return { surahNumber: null, verseNumber: null };
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

export const parsePageReadingBookmark = (bookmark: string) => {
  if (!bookmark || typeof bookmark !== 'string') return null;
  const parts = bookmark.split(':');

  if (parts.length !== READING_BOOKMARK_PAGE_PARTS_LENGTH) {
    return null;
  }

  if (parts[0] !== BookmarkType.Page) {
    return null;
  }

  return {
    pageNumber: Number(parts[1]),
    surahNumber: Number(parts[2]),
    verseNumber: Number(parts[3]),
  };
};
