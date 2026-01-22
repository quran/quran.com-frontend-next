import { useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWR from 'swr';

import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { mapMushaf } from '@/utils/auth/api';
import { MappedPage, MappedVerse } from '@/utils/auth/types/MushafMapping';
import { GuestReadingBookmark } from '@/utils/bookmark';

export interface EffectiveVerseKey {
  surahNumber: number;
  verseNumber: number;
  pageNumber?: number;
}

export interface UseMappedBookmarkOptions {
  /** The bookmark data to map (from guest state or backend) */
  bookmark: GuestReadingBookmark | Bookmark | null | undefined;
  /** Override the current mushafId (defaults to user's selected mushaf) */
  currentMushafId?: Mushaf;
  /** Unique key prefix for SWR caching */
  swrKeyPrefix?: string;
}

export interface UseMappedBookmarkReturn {
  /** The mushafId where the bookmark was originally stored */
  bookmarkMushafId: Mushaf;
  /** Current user's mushafId */
  currentMushafId: Mushaf;
  /** Whether cross-mushaf mapping is needed */
  needsMapping: boolean;
  /** For page bookmarks: the effective page number in current mushaf */
  effectivePageNumber: number | null;
  /** For ayah bookmarks: the effective verse key in current mushaf (first target verse) */
  effectiveAyahVerseKey: EffectiveVerseKey | null;
  /** Whether mapping data is still loading */
  isLoading: boolean;
  /** The raw mapped page data from the API */
  mappedPageData: MappedPage | null | undefined;
  /** The raw mapped verse data from the API */
  mappedVerseData: MappedVerse | null | undefined;
}

/**
 * Hook to handle cross-mushaf bookmark mapping.
 *
 * When a bookmark is stored in one mushaf but the user is viewing a different mushaf,
 * this hook maps the bookmark to the correct location in the current mushaf.
 *
 * For page bookmarks: Maps to the target page number.
 * For ayah bookmarks: Maps to the first target verse (handles 1:many verse mappings).
 *
 * @param {UseMappedBookmarkOptions} options - Configuration options
 * @returns {UseMappedBookmarkReturn} Mapped bookmark data and loading state
 */
const useMappedBookmark = ({
  bookmark,
  currentMushafId: overrideMushafId,
  swrKeyPrefix = 'map-bookmark',
}: UseMappedBookmarkOptions): UseMappedBookmarkReturn => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const defaultMushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines)
    .mushaf as Mushaf;
  const currentMushafId = overrideMushafId ?? defaultMushafId;

  // Get bookmark's mushafId (for guest users, it's stored in the bookmark)
  const bookmarkMushafId = useMemo((): Mushaf => {
    if (!bookmark) return currentMushafId;
    // GuestReadingBookmark has mushafId, Bookmark doesn't
    if ('mushafId' in bookmark) {
      return (bookmark as GuestReadingBookmark).mushafId;
    }
    // For logged-in users, the bookmark was fetched for current mushafId
    return currentMushafId;
  }, [bookmark, currentMushafId]);

  // Determine if we need cross-mushaf mapping
  const needsMapping = bookmarkMushafId !== currentMushafId && !!bookmark;

  // Fetch mapped page data when mushaf differs (for page bookmarks)
  const { data: mappedPageData, isValidating: isLoadingPage } = useSWR(
    needsMapping && bookmark?.type === BookmarkType.Page
      ? `${swrKeyPrefix}-page-${bookmark.key}-${bookmarkMushafId}-${currentMushafId}`
      : null,
    async () => {
      const res = await mapMushaf<MappedPage>({
        type: 'page',
        sourcePage: bookmark!.key,
        sourceMushaf: bookmarkMushafId,
        targetMushaf: currentMushafId,
      });
      return res.success ? res.data : null;
    },
  );

  // Fetch mapped verse data when mushaf differs (for ayah bookmarks)
  const { data: mappedVerseData, isValidating: isLoadingVerse } = useSWR(
    needsMapping && bookmark?.type === BookmarkType.Ayah
      ? `${swrKeyPrefix}-verse-${bookmark.key}-${bookmark.verseNumber}-${bookmarkMushafId}-${currentMushafId}`
      : null,
    async () => {
      const res = await mapMushaf<MappedVerse>({
        type: 'verse',
        surah: bookmark!.key,
        verse: bookmark!.verseNumber!,
        sourceMushaf: bookmarkMushafId,
        targetMushaf: currentMushafId,
      });
      return res.success ? res.data : null;
    },
  );

  // Get the effective page number (mapped if needed) for page bookmarks
  const effectivePageNumber = useMemo((): number | null => {
    if (!bookmark) return null;
    if (bookmark.type !== BookmarkType.Page) return null;
    if (needsMapping) {
      return mappedPageData?.targetPageNumber ?? null; // null while loading
    }
    return bookmark.key;
  }, [bookmark, needsMapping, mappedPageData]);

  // Get the effective verse key for ayah bookmarks (first verse from mapped target verses)
  const effectiveAyahVerseKey = useMemo((): EffectiveVerseKey | null => {
    if (!bookmark) return null;
    if (bookmark.type !== BookmarkType.Ayah) return null;

    if (needsMapping) {
      const firstTargetVerse = mappedVerseData?.targetVerses?.[0];
      if (!firstTargetVerse) return null; // null while loading
      return {
        surahNumber: firstTargetVerse.surahNumber,
        verseNumber: firstTargetVerse.verseNumber,
        pageNumber: firstTargetVerse.pageNumber,
      };
    }
    // Same mushaf - use original values
    return {
      surahNumber: bookmark.key,
      verseNumber: bookmark.verseNumber ?? 1,
      pageNumber: undefined,
    };
  }, [bookmark, needsMapping, mappedVerseData]);

  const isLoading =
    (needsMapping && bookmark?.type === BookmarkType.Page && isLoadingPage) ||
    (needsMapping && bookmark?.type === BookmarkType.Ayah && isLoadingVerse);

  return {
    bookmarkMushafId,
    currentMushafId,
    needsMapping,
    effectivePageNumber,
    effectiveAyahVerseKey,
    isLoading,
    mappedPageData,
    mappedVerseData,
  };
};

export default useMappedBookmark;
