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
