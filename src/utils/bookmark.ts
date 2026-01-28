import BookmarkType from '@/types/BookmarkType';

export type ReadingBookmark = string | null;

/**
 * Guest reading bookmark with structured data matching Bookmark interface
 * Used for guest users before sign-in, persisted to localStorage
 */
export interface GuestReadingBookmark {
  /** Surah number for ayah bookmarks, page number for page bookmarks */
  key: number;
  /** Bookmark type - Ayah or Page */
  type: BookmarkType;
  /** Verse number (only for ayah bookmarks) */
  verseNumber?: number;
  /** Mushaf ID for mapping between different mushafs */
  mushafId: number;
  /** ISO timestamp when the bookmark was created */
  createdAt: string;
}

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
