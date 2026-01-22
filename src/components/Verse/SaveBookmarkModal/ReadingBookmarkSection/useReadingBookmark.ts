/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import useMappedBookmark from '@/hooks/useMappedBookmark';
import { selectGuestReadingBookmark, setGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark, { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { addBookmark } from '@/utils/auth/api';
import { GuestReadingBookmark } from '@/utils/bookmark';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';

/** Debounce delay to prevent flicker when state updates */
const STATE_TRANSITION_DELAY_MS = 300;

interface UseReadingBookmarkOptions {
  type: ReadingBookmarkType;
  verseKey?: string;
  pageNumber?: number;
  onBookmarkChanged?: () => void | Promise<void>;
  lang: string;
  isLoggedIn?: boolean;
  mushafId?: number;
  readingBookmarkData?: Bookmark | null;
  /** Mutate function from useGlobalReadingBookmark for optimistic updates */
  mutateReadingBookmark?: (
    data?: Bookmark | null | Promise<Bookmark | null>,
    opts?: { revalidate?: boolean },
  ) => Promise<Bookmark | null | undefined>;
}

interface UseReadingBookmarkReturn {
  isLoading: boolean;
  error: string | null;
  isSelected: boolean;
  isCurrentBookmark: boolean;
  showNewBookmark: boolean;
  showRemoveSection: boolean;
  resourceDisplayName: string;
  displayReadingBookmark: string | null;
  effectiveCurrentBookmark: string | null | undefined;
  previousBookmarkValue: string | null | undefined;
  handleSetReadingBookmark: () => Promise<void>;
  handleUndoReadingBookmark: () => Promise<void>;
  handleRemoveCurrentBookmark: () => Promise<void>;
}

const useReadingBookmark = ({
  type,
  verseKey,
  pageNumber,
  onBookmarkChanged,
  lang,
  isLoggedIn = false,
  mushafId,
  readingBookmarkData,
  mutateReadingBookmark,
}: UseReadingBookmarkOptions): UseReadingBookmarkReturn => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const currentMushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines)
    .mushaf as Mushaf;

  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingBookmark, setPendingBookmark] = useState<GuestReadingBookmark | Bookmark | null>(
    null,
  );
  const [previousBookmark, setPreviousBookmark] = useState<
    GuestReadingBookmark | Bookmark | null | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isRemovalInProgress, setIsRemovalInProgress] = useState(false);
  const [isUndoInProgress, setIsUndoInProgress] = useState(false);

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isVerse = type === ReadingBookmarkType.AYAH;

  // Get effective current bookmark based on user type
  const effectiveCurrentBookmarkData: GuestReadingBookmark | Bookmark | null | undefined =
    useMemo(() => {
      if (isLoggedIn) {
        return readingBookmarkData;
      }
      return guestReadingBookmark;
    }, [isLoggedIn, readingBookmarkData, guestReadingBookmark]);

  // Build display name for current resource
  const resourceDisplayName = useMemo(() => {
    if (isVerse && verseKey) {
      const [chapterId] = verseKey.split(':');
      const chapter = getChapterData(chaptersData, chapterId);
      return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(verseKey, lang)}`;
    }
    if (!isVerse && pageNumber) {
      return `${t('page')} ${toLocalizedNumber(pageNumber, lang)}`;
    }
    return '';
  }, [isVerse, verseKey, pageNumber, chaptersData, lang, t]);

  // Format bookmark for display
  const formatBookmarkForDisplay = useCallback(
    (bookmark: GuestReadingBookmark | Bookmark | null | undefined): string | null => {
      if (!bookmark) return null;
      if (bookmark.type === BookmarkType.Ayah) {
        const chapter = getChapterData(chaptersData, String(bookmark.key));
        const verseNum = bookmark.verseNumber || 1;
        return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(
          `${bookmark.key}:${verseNum}`,
          lang,
        )}`;
      }
      if (bookmark.type === BookmarkType.Page) {
        return `${t('page')} ${toLocalizedNumber(bookmark.key, lang)}`;
      }
      return null;
    },
    [chaptersData, lang, t],
  );

  // Use the reusable mapping hook for cross-mushaf bookmark handling
  const { needsMapping, effectivePageNumber, effectiveAyahVerseKey } = useMappedBookmark({
    bookmark: effectiveCurrentBookmarkData,
    currentMushafId,
    swrKeyPrefix: 'map-bookmark-modal',
  });

  // Check if current resource matches the reading bookmark
  const isCurrentBookmark = useMemo((): boolean => {
    // For logged-in users, compare readingBookmarkData with current resource
    if (isLoggedIn) {
      if (!readingBookmarkData) return false;

      if (isVerse && verseKey) {
        const [chapterId, verseNum] = verseKey.split(':');
        // Handle cross-mushaf mapping if needed
        if (needsMapping) {
          if (!effectiveAyahVerseKey) return false; // Still loading
          return (
            effectiveAyahVerseKey.surahNumber === Number(chapterId) &&
            effectiveAyahVerseKey.verseNumber === Number(verseNum)
          );
        }
        // Same mushaf - compare directly
        return (
          readingBookmarkData.type === BookmarkType.Ayah &&
          readingBookmarkData.key === Number(chapterId) &&
          readingBookmarkData.verseNumber === Number(verseNum)
        );
      }

      if (!isVerse && pageNumber) {
        // Handle cross-mushaf mapping if needed
        if (needsMapping) {
          if (effectivePageNumber === null) return false; // Still loading
          return effectivePageNumber === pageNumber;
        }
        // Same mushaf - compare directly
        return (
          readingBookmarkData.type === BookmarkType.Page && readingBookmarkData.key === pageNumber
        );
      }

      return false;
    }

    // For guests, compare guestReadingBookmark with current resource
    if (!guestReadingBookmark) return false;

    if (isVerse && verseKey && guestReadingBookmark.type === BookmarkType.Ayah) {
      const [chapterId, verseNum] = verseKey.split(':');
      return (
        guestReadingBookmark.key === Number(chapterId) &&
        guestReadingBookmark.verseNumber === Number(verseNum)
      );
    }

    if (!isVerse && pageNumber && guestReadingBookmark.type === BookmarkType.Page) {
      return guestReadingBookmark.key === pageNumber;
    }

    return false;
  }, [
    isLoggedIn,
    readingBookmarkData,
    guestReadingBookmark,
    isVerse,
    verseKey,
    pageNumber,
    needsMapping,
    effectiveAyahVerseKey,
    effectivePageNumber,
  ]);

  const showNewBookmark = pendingBookmark != null;

  // For backward compatibility with SetBookmarkSection (returns strings)
  const displayReadingBookmark = useMemo(() => {
    if (!effectiveCurrentBookmarkData) return null;
    if (effectiveCurrentBookmarkData.type === BookmarkType.Ayah) {
      // Use mapped verse key if mapping was applied, otherwise use original
      if (needsMapping && !effectiveAyahVerseKey) {
        return t('loading'); // Still loading mapped verse
      }
      const surahNumber = effectiveAyahVerseKey?.surahNumber ?? effectiveCurrentBookmarkData.key;
      const verseNumber =
        effectiveAyahVerseKey?.verseNumber ?? effectiveCurrentBookmarkData.verseNumber ?? 1;
      const chapter = getChapterData(chaptersData, String(surahNumber));
      return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(
        `${surahNumber}:${verseNumber}`,
        lang,
      )}`;
    }
    if (effectiveCurrentBookmarkData.type === BookmarkType.Page) {
      if (effectivePageNumber === null) {
        return t('loading'); // Still loading mapped page
      }
      return `${t('page')} ${toLocalizedNumber(effectivePageNumber, lang)}`;
    }
    return null;
  }, [
    effectiveCurrentBookmarkData,
    effectivePageNumber,
    effectiveAyahVerseKey,
    needsMapping,
    chaptersData,
    lang,
    t,
  ]);

  const effectiveCurrentBookmark = formatBookmarkForDisplay(effectiveCurrentBookmarkData);
  // Use empty string for null to distinguish from undefined (undo not triggered yet)
  const previousBookmarkValue =
    previousBookmark === undefined ? undefined : formatBookmarkForDisplay(previousBookmark) || '';

  // Show RemoveSection ONLY if:
  // - This is the current bookmark AND
  // - There's no previous bookmark to undo to (user hasn't just changed it)
  // - Not in the middle of removal or undo
  const hasUndoAvailable = previousBookmark !== undefined;
  const showRemoveSection =
    isCurrentBookmark && !hasUndoAvailable && !isRemovalInProgress && !isUndoInProgress;

  const isSelected = isCurrentBookmark || showNewBookmark;

  /**
   * Persist bookmark to backend (logged-in) or Redux (guest)
   */
  const persistBookmark = useCallback(
    async (bookmark: GuestReadingBookmark | Bookmark) => {
      if (isLoggedIn && mushafId) {
        // For logged-in users, call backend API
        if (bookmark.type === BookmarkType.Ayah) {
          await addBookmark({
            key: bookmark.key,
            mushafId,
            type: BookmarkType.Ayah,
            verseNumber: bookmark.verseNumber!,
            isReading: true,
          });
        } else if (bookmark.type === BookmarkType.Page) {
          await addBookmark({
            key: bookmark.key,
            mushafId,
            type: BookmarkType.Page,
            isReading: true,
          });
        }
      } else {
        // For guests, dispatch to Redux
        dispatch(
          setGuestReadingBookmark({
            key: bookmark.key,
            type: bookmark.type,
            verseNumber: bookmark.verseNumber,
            mushafId: currentMushafId,
          }),
        );
      }
    },
    [isLoggedIn, mushafId, currentMushafId, dispatch],
  );

  /**
   * Unset reading bookmark
   */
  const unsetBookmark = useCallback(
    async (bookmark: GuestReadingBookmark | Bookmark) => {
      if (isLoggedIn && mushafId) {
        // For logged-in users, use isReading=null to unset
        if (bookmark.type === BookmarkType.Ayah) {
          await addBookmark({
            key: bookmark.key,
            mushafId,
            type: BookmarkType.Ayah,
            verseNumber: bookmark.verseNumber!,
            isReading: null,
          });
        } else if (bookmark.type === BookmarkType.Page) {
          await addBookmark({
            key: bookmark.key,
            mushafId,
            type: BookmarkType.Page,
            isReading: null,
          });
        }
      } else {
        // For guests, set to null
        dispatch(setGuestReadingBookmark(null));
      }
    },
    [isLoggedIn, mushafId, dispatch],
  );

  /**
   * Set reading bookmark to current resource
   */
  const handleSetReadingBookmark = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const newBookmark: GuestReadingBookmark | Bookmark =
        isVerse && verseKey
          ? {
              key: Number(verseKey.split(':')[0]),
              type: BookmarkType.Ayah,
              verseNumber: Number(verseKey.split(':')[1]),
              mushafId: currentMushafId,
            }
          : {
              key: pageNumber!,
              type: BookmarkType.Page,
              mushafId: currentMushafId,
            };

      // Persist to backend
      await persistBookmark(newBookmark);

      // For logged-in users, optimistically update the cache since we know API succeeded
      // Don't refetch immediately as backend has eventual consistency
      if (isLoggedIn && mutateReadingBookmark) {
        const optimisticBookmark: Bookmark = {
          id: `optimistic-${Date.now()}`,
          key: newBookmark.key,
          type: newBookmark.type,
          verseNumber: newBookmark.verseNumber,
          isReading: true,
        };
        // Update cache without revalidating (backend is eventually consistent)
        await mutateReadingBookmark(optimisticBookmark, { revalidate: false });
      }

      // Save previous state for undo and set pending state
      setPreviousBookmark(effectiveCurrentBookmarkData);
      setPendingBookmark(newBookmark);

      setTimeout(() => {
        setPendingBookmark(null);
      }, STATE_TRANSITION_DELAY_MS);

      // Note: We intentionally DON'T call onBookmarkChanged() here for logged-in users
      // because immediate refetch returns stale data due to eventual consistency.
      // The cache will naturally revalidate on next page load or when user navigates away.
    } catch (err) {
      setError(
        t('error.reading-bookmark-set', {
          defaultValue: 'Failed to set reading bookmark',
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    isVerse,
    verseKey,
    pageNumber,
    currentMushafId,
    persistBookmark,
    isLoggedIn,
    mutateReadingBookmark,
    effectiveCurrentBookmarkData,
    t,
  ]);

  /**
   * Undo reading bookmark (restore previous)
   */
  const handleUndoReadingBookmark = useCallback(async () => {
    if (isLoading || previousBookmark === undefined) return;

    setIsLoading(true);
    setError(null);
    setIsUndoInProgress(true);

    try {
      // If previous was null, unset the bookmark; otherwise restore it
      if (previousBookmark === null) {
        // Need to get current bookmark to unset
        if (effectiveCurrentBookmarkData) {
          await unsetBookmark(effectiveCurrentBookmarkData);
        }
        // For logged-in users, optimistically clear the cache
        if (isLoggedIn && mutateReadingBookmark) {
          await mutateReadingBookmark(null, { revalidate: false });
        }
      } else {
        await persistBookmark(previousBookmark);
        // For logged-in users, optimistically update the cache
        if (isLoggedIn && mutateReadingBookmark) {
          const optimisticBookmark: Bookmark = {
            id: `optimistic-undo-${Date.now()}`,
            key: previousBookmark.key,
            type: previousBookmark.type,
            verseNumber: previousBookmark.verseNumber,
            isReading: true,
          };
          await mutateReadingBookmark(optimisticBookmark, { revalidate: false });
        }
      }

      setPendingBookmark(null);
      setPreviousBookmark(undefined);

      // Only call onBookmarkChanged for guests
      if (!isLoggedIn && onBookmarkChanged) {
        await onBookmarkChanged();
      }
    } catch (err) {
      setError(
        t('error.reading-bookmark-undo', {
          defaultValue: 'Failed to undo reading bookmark',
        }),
      );
    } finally {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      undoTimeoutRef.current = setTimeout(() => {
        setIsUndoInProgress(false);
        setIsLoading(false);
      }, STATE_TRANSITION_DELAY_MS);
    }
  }, [
    isLoading,
    previousBookmark,
    effectiveCurrentBookmarkData,
    isLoggedIn,
    mutateReadingBookmark,
    persistBookmark,
    unsetBookmark,
    onBookmarkChanged,
    t,
  ]);

  /**
   * Remove current reading bookmark
   */
  const handleRemoveCurrentBookmark = useCallback(async () => {
    // Use the appropriate bookmark data based on user type
    // For logged-in users, use readingBookmarkData (what isCurrentBookmark checks)
    // For guests, use guestReadingBookmark
    const bookmarkToRemove = isLoggedIn ? readingBookmarkData : guestReadingBookmark;

    if (isLoading || !bookmarkToRemove) return;

    setIsLoading(true);
    setError(null);
    setIsRemovalInProgress(true);

    try {
      await unsetBookmark(bookmarkToRemove);

      // For logged-in users, optimistically clear the cache
      // Don't refetch as backend has eventual consistency
      if (isLoggedIn && mutateReadingBookmark) {
        await mutateReadingBookmark(null, { revalidate: false });
      }

      // Trigger refetch for guests only
      if (!isLoggedIn && onBookmarkChanged) {
        await onBookmarkChanged();
      }
    } catch (err) {
      setError(
        t('error.reading-bookmark-remove', {
          defaultValue: 'Failed to remove reading bookmark',
        }),
      );
    } finally {
      if (removalTimeoutRef.current) {
        clearTimeout(removalTimeoutRef.current);
      }
      removalTimeoutRef.current = setTimeout(() => {
        setIsRemovalInProgress(false);
        setIsLoading(false);
      }, STATE_TRANSITION_DELAY_MS);
    }
  }, [
    isLoading,
    isLoggedIn,
    readingBookmarkData,
    guestReadingBookmark,
    mutateReadingBookmark,
    unsetBookmark,
    onBookmarkChanged,
    t,
  ]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      if (removalTimeoutRef.current) {
        clearTimeout(removalTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    error,
    isSelected,
    isCurrentBookmark,
    showNewBookmark,
    showRemoveSection,
    resourceDisplayName,
    displayReadingBookmark,
    effectiveCurrentBookmark,
    previousBookmarkValue,
    handleSetReadingBookmark,
    handleUndoReadingBookmark,
    handleRemoveCurrentBookmark,
  };
};

export default useReadingBookmark;
