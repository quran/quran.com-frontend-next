/* eslint-disable max-lines */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import DataContext from '@/contexts/DataContext';
import useResolvedBookmarkPage from '@/hooks/bookmarks/useResolvedBookmarkPage';
import { selectGuestReadingBookmark, setGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import PreferenceGroup, { ReadingBookmarkPreferenceGroupKey } from '@/types/auth/PreferenceGroup';
import { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { getPageFirstVerseKey } from '@/utils/verse';

/** Debounce delay to prevent flicker when state updates */
const STATE_TRANSITION_DELAY_MS = 300;

interface UseReadingBookmarkOptions {
  type: ReadingBookmarkType;
  verseKey?: string;
  pageNumber?: number;
  currentReadingBookmark?: string | null;
  onBookmarkChanged?: () => void | Promise<void>;
  lang: string;
  isLoggedIn?: boolean;
  mushafId?: number;
  onUpdateUserPreference?: (
    key: string,
    value: string,
    group: string,
    mushafId: number,
  ) => Promise<void>;
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

/**
 * Custom hook to manage reading bookmark state and operations.
 * Handles both logged-in users (persisting to server) and guest users (persisting to Redux/localStorage).
 * @param {UseReadingBookmarkOptions} options - Options for managing reading bookmark
 * @returns {UseReadingBookmarkReturn} The reading bookmark state and handlers
 */
const useReadingBookmark = ({
  type,
  verseKey,
  pageNumber,
  currentReadingBookmark,
  onBookmarkChanged,
  lang,
  isLoggedIn = false,
  mushafId,
  onUpdateUserPreference,
}: UseReadingBookmarkOptions): UseReadingBookmarkReturn => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const currentMushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines)
    .mushaf as Mushaf;

  // Get guest reading bookmark from Redux store for guest users
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingBookmarkValue, setPendingBookmarkValue] = useState<string | null>(null);
  const [previousBookmarkValue, setPreviousBookmarkValue] = useState<string | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [isRemovalInProgress, setIsRemovalInProgress] = useState(false);
  const [isUndoInProgress, setIsUndoInProgress] = useState(false);
  const [normalizedBookmarkValue, setNormalizedBookmarkValue] = useState<string | null>(null);
  const [displayMappedPageNumber, setDisplayMappedPageNumber] = useState<number | null>(null);

  // Refs to track timeout IDs for cleanup
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isVerse = type === ReadingBookmarkType.AYAH;

  // Derived value that always reflects latest state on each render
  const effectiveCurrentBookmark: string | null | undefined = isLoggedIn
    ? currentReadingBookmark
    : guestReadingBookmark;

  // Build the bookmark value based on type
  const bookmarkValue = useMemo(() => {
    if (isVerse && verseKey) {
      const [chapterId, verseNumber] = verseKey.split(':');
      return `${type}:${chapterId}:${verseNumber}`;
    }
    if (!isVerse && pageNumber) {
      return `${type}:${pageNumber}`;
    }
    return null;
  }, [isVerse, verseKey, pageNumber, type]);

  // Display name for the resource
  const resourceDisplayName = useMemo(() => {
    if (isVerse && verseKey) {
      const [chapterId] = verseKey.split(':');
      const chapter = getChapterData(chaptersData, chapterId);
      return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(verseKey, lang)}`;
    }
    if (!isVerse && pageNumber) {
      const pageForDisplay = displayMappedPageNumber ?? pageNumber;
      return `${t('page')} ${toLocalizedNumber(pageForDisplay, lang)}`;
    }
    return '';
  }, [isVerse, verseKey, pageNumber, chaptersData, lang, t, displayMappedPageNumber]);

  // Parse reading bookmark for display
  const parseBookmarkForDisplay = useCallback(
    (bookmark: string | null | undefined): string | null => {
      if (!bookmark) return null;
      const parts = bookmark.split(':');
      if (parts[0] === BookmarkType.Ayah && parts.length === 3) {
        const chapterId = parts[1];
        const verseNum = parts[2];
        const chapter = getChapterData(chaptersData, chapterId);
        return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(
          `${chapterId}:${verseNum}`,
          lang,
        )}`;
      }
      if (parts[0] === BookmarkType.Page && parts.length === 2) {
        return `${t('page')} ${toLocalizedNumber(Number(parts[1]), lang)}`;
      }
      return null;
    },
    [chaptersData, lang, t],
  );

  // Determine section state
  const showNewBookmark =
    normalizedBookmarkValue != null && pendingBookmarkValue === normalizedBookmarkValue;
  const isCurrentBookmark = isVerse
    ? effectiveCurrentBookmark === bookmarkValue
    : effectiveCurrentBookmark === normalizedBookmarkValue;
  const isSelected = showNewBookmark || isCurrentBookmark;

  const displayReadingBookmark = (() => {
    if (showNewBookmark || isCurrentBookmark) return resourceDisplayName;
    const parts = effectiveCurrentBookmark?.split(':');
    if (parts && parts[0] === 'page' && parts.length === 4) {
      const pageForDisplay = displayMappedPageNumber ?? Number(parts[1]);
      return `${t('page')} ${toLocalizedNumber(pageForDisplay, lang)}`;
    }
    return parseBookmarkForDisplay(effectiveCurrentBookmark);
  })();

  const showRemoveSection =
    isCurrentBookmark &&
    !isRemovalInProgress &&
    !isUndoInProgress &&
    pendingBookmarkValue == null &&
    previousBookmarkValue == null;

  // Cleanup effect for setTimeout calls
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (removalTimeoutRef.current) clearTimeout(removalTimeoutRef.current);
    };
  }, []);

  const { data: firstVerseKeyForPage } = useSWR(
    !isVerse && pageNumber ? `first-verse-${pageNumber}-${currentMushafId}` : null,
    () => getPageFirstVerseKey(pageNumber as number, currentMushafId),
  );

  useEffect(() => {
    if (!bookmarkValue) {
      setNormalizedBookmarkValue(null);
      return;
    }
    const parts = bookmarkValue.split(':');
    if (parts[0] === ReadingBookmarkType.PAGE && pageNumber) {
      if (firstVerseKeyForPage) {
        setNormalizedBookmarkValue(
          `page:${pageNumber}:${firstVerseKeyForPage.surahNumber}:${firstVerseKeyForPage.verseNumber}`,
        );
      } else {
        setNormalizedBookmarkValue(bookmarkValue);
      }
      return;
    }
    setNormalizedBookmarkValue(bookmarkValue);
  }, [bookmarkValue, pageNumber, firstVerseKeyForPage]);

  const { resolvedPage: resolvedDisplayPage } = useResolvedBookmarkPage(
    effectiveCurrentBookmark,
    currentMushafId,
  );

  useEffect(() => {
    setDisplayMappedPageNumber(resolvedDisplayPage ?? null);
  }, [resolvedDisplayPage]);

  /**
   * Persist bookmark value to server (logged-in) or Redux (guest)
   */
  const persistBookmark = useCallback(
    async (value: string): Promise<void> => {
      if (isLoggedIn && onUpdateUserPreference && mushafId) {
        await onUpdateUserPreference(
          ReadingBookmarkPreferenceGroupKey.BOOKMARK,
          value,
          PreferenceGroup.READING_BOOKMARK,
          mushafId,
        );
      } else {
        try {
          dispatch(setGuestReadingBookmark(value));
        } catch (reduxError) {
          throw new Error(
            t('error.reading-bookmark-set', {
              defaultValue: 'Failed to set reading bookmark',
            }),
          );
        }
      }
    },
    [isLoggedIn, onUpdateUserPreference, mushafId, dispatch, t],
  );

  /**
   * Handler to set reading bookmark
   */
  const handleSetReadingBookmark = useCallback(async () => {
    if (!bookmarkValue || isCurrentBookmark || showNewBookmark) return;

    setIsLoading(true);
    setError(null);
    setPreviousBookmarkValue(effectiveCurrentBookmark ?? null);
    setPendingBookmarkValue(normalizedBookmarkValue);

    try {
      await persistBookmark(normalizedBookmarkValue || bookmarkValue!);
      await onBookmarkChanged?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('error.reading-bookmark-set', {
              defaultValue: 'Failed to set reading bookmark',
            }),
      );
      setPendingBookmarkValue(null);
      setPreviousBookmarkValue(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    bookmarkValue,
    isCurrentBookmark,
    showNewBookmark,
    effectiveCurrentBookmark,
    persistBookmark,
    onBookmarkChanged,
    t,
    normalizedBookmarkValue,
  ]);

  /**
   * Handler to undo reading bookmark
   */
  const handleUndoReadingBookmark = useCallback(async () => {
    if (previousBookmarkValue === undefined) return;

    setIsLoading(true);
    setError(null);
    setIsUndoInProgress(true);

    const valueToRevert = previousBookmarkValue || '';

    try {
      await persistBookmark(valueToRevert);
      setPendingBookmarkValue(null);
      setPreviousBookmarkValue(undefined);
      await onBookmarkChanged?.();

      undoTimeoutRef.current = setTimeout(() => {
        setIsUndoInProgress(false);
      }, STATE_TRANSITION_DELAY_MS);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('error.reading-bookmark-undo', {
              defaultValue: 'Failed to undo reading bookmark',
            }),
      );
      setIsUndoInProgress(false);
    } finally {
      setIsLoading(false);
    }
  }, [previousBookmarkValue, persistBookmark, onBookmarkChanged, t]);

  /**
   * Handler to remove current reading bookmark
   */
  const handleRemoveCurrentBookmark = useCallback(async () => {
    if (!effectiveCurrentBookmark) return;

    setIsLoading(true);
    setError(null);
    setIsRemovalInProgress(true);
    setPendingBookmarkValue(null);

    try {
      await persistBookmark('');
      await onBookmarkChanged?.();

      setPreviousBookmarkValue(undefined);
      removalTimeoutRef.current = setTimeout(() => {
        setIsRemovalInProgress(false);
      }, STATE_TRANSITION_DELAY_MS);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('error.reading-bookmark-remove', {
              defaultValue: 'Failed to remove reading bookmark',
            }),
      );
      setPreviousBookmarkValue(null);
      setPendingBookmarkValue(null);
      setIsRemovalInProgress(false);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveCurrentBookmark, persistBookmark, onBookmarkChanged, t]);

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
