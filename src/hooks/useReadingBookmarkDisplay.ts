/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { GuestReadingBookmark } from '@/utils/bookmark';

/**
 * Reading bookmark data structure for display purposes.
 * Contains formatted bookmark information without the complexity of the full Bookmark type.
 */
export interface ReadingBookmarkData {
  type: 'ayah' | 'page';
  surahName?: string;
  surahNameArabic?: string;
  surahNumber?: number;
  ayahNumber?: number;
  pageNumber?: number;
  createdAt?: string;
  verseKey?: string;
}

interface UseReadingBookmarkDisplayReturn {
  bookmark: ReadingBookmarkData | null;
  isLoading: boolean;
}

function mapLoggedInBookmarkToData(readingBookmark: Bookmark | null): ReadingBookmarkData | null {
  if (!readingBookmark) {
    return null;
  }

  if (readingBookmark.type === BookmarkType.Ayah) {
    const surahNumber = readingBookmark.key;
    const ayahNumber = readingBookmark.verseNumber;
    const verseKey =
      typeof surahNumber === 'number' && typeof ayahNumber === 'number'
        ? `${surahNumber}:${ayahNumber}`
        : undefined;

    const bookmarkWithDate = readingBookmark as Bookmark & {
      createdAt?: string;
    };

    return {
      type: readingBookmark.type,
      surahNumber,
      ayahNumber,
      verseKey,
      createdAt: bookmarkWithDate.createdAt,
    };
  }

  if (readingBookmark.type === BookmarkType.Page) {
    const bookmarkWithDate = readingBookmark as Bookmark & {
      createdAt?: string;
    };

    return {
      type: readingBookmark.type,
      pageNumber: readingBookmark.key,
      createdAt: bookmarkWithDate.createdAt,
    };
  }

  return null;
}

function mapGuestBookmarkToData(
  guestReadingBookmark: GuestReadingBookmark | null,
): ReadingBookmarkData | null {
  if (!guestReadingBookmark) {
    return null;
  }

  if (guestReadingBookmark.type === BookmarkType.Ayah) {
    return {
      type: 'ayah',
      surahNumber: guestReadingBookmark.key,
      ayahNumber: guestReadingBookmark.verseNumber,
      verseKey:
        typeof guestReadingBookmark.key === 'number' &&
        typeof guestReadingBookmark.verseNumber === 'number'
          ? `${guestReadingBookmark.key}:${guestReadingBookmark.verseNumber}`
          : undefined,
      createdAt: guestReadingBookmark.createdAt,
    };
  }

  if (guestReadingBookmark.type === BookmarkType.Page) {
    return {
      type: 'page',
      pageNumber: guestReadingBookmark.key,
      createdAt: guestReadingBookmark.createdAt,
    };
  }

  return null;
}

/**
 * useReadingBookmarkDisplay - Lightweight read-only hook for displaying reading bookmark data.
 *
 * This hook provides simple, formatted access to the user's reading bookmark for display purposes.
 * It handles both logged-in users (via API) and guests (via Redux) automatically.
 *
 * Features:
 * - Returns formatted bookmark data (verse key, page number, surah info)
 * - Automatically selects between logged-in user data and guest data
 * - Provides loading state for async data fetching
 *
 * This hook is READ-ONLY and does not provide any mutation capabilities.
 *       For bookmark management (set, update, remove, undo), use the full `useReadingBookmark`
 *       hook from `SaveBookmarkModal/ReadingBookmarkSection/useReadingBookmark.ts` instead.
 *
 * @returns {UseReadingBookmarkDisplayReturn} Object containing:
 *   - bookmark: The formatted reading bookmark data, or null if none exists
 *   - isLoading: Whether the bookmark data is being fetched (only true for logged-in users)
 *
 * @example
 * const { bookmark, isLoading } = useReadingBookmarkDisplay();
 * if (bookmark) {
 *   console.log(`Bookmarked at ${bookmark.verseKey || `page ${bookmark.pageNumber}`}`);
 * }
 */
const useReadingBookmarkDisplay = (): UseReadingBookmarkDisplayReturn => {
  const { isLoggedIn } = useIsLoggedIn();
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines)
    .mushaf as Mushaf;

  const { readingBookmark, isLoading: isReadingBookmarkLoading } =
    useGlobalReadingBookmark(mushafId);

  const bookmark = useMemo((): ReadingBookmarkData | null => {
    if (isLoggedIn) {
      return mapLoggedInBookmarkToData(readingBookmark);
    }
    return mapGuestBookmarkToData(guestReadingBookmark);
  }, [guestReadingBookmark, isLoggedIn, readingBookmark]);

  return {
    bookmark,
    isLoading: isLoggedIn ? isReadingBookmarkLoading : false,
  };
};

export default useReadingBookmarkDisplay;
