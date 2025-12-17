/* eslint-disable max-lines */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import { selectGuestReadingBookmark, setGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import PreferenceGroup, { ReadingBookmarkPreferenceGroupKey } from '@/types/auth/PreferenceGroup';
import { ReadingBookmarkType } from '@/types/Bookmark';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';

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

  // Refs to track timeout IDs for cleanup
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isVerse = type === ReadingBookmarkType.AYAH;

  // Determine the effective current reading bookmark based on login status
  const effectiveCurrentBookmark = useMemo(() => {
    if (isLoggedIn) {
      return currentReadingBookmark;
    }
    return guestReadingBookmark;
  }, [isLoggedIn, currentReadingBookmark, guestReadingBookmark]);

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
      return `${t('page')} ${toLocalizedNumber(pageNumber, lang)}`;
    }
    return '';
  }, [isVerse, verseKey, pageNumber, chaptersData, lang, t]);

  // Parse reading bookmark for display
  const parseBookmarkForDisplay = useCallback(
    (bookmark: string | null | undefined): string | null => {
      if (!bookmark) return null;
      const parts = bookmark.split(':');
      if (parts[0] === 'ayah' && parts.length === 3) {
        const chapterId = parts[1];
        const verseNum = parts[2];
        const chapter = getChapterData(chaptersData, chapterId);
        return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(
          `${chapterId}:${verseNum}`,
          lang,
        )}`;
      }
      if (parts[0] === 'page' && parts.length === 2) {
        return `${t('page')} ${toLocalizedNumber(Number(parts[1]), lang)}`;
      }
      return null;
    },
    [chaptersData, lang, t],
  );

  // Determine section state
  const showNewBookmark = pendingBookmarkValue === bookmarkValue;
  const isCurrentBookmark = effectiveCurrentBookmark === bookmarkValue;
  const isSelected = showNewBookmark || isCurrentBookmark;

  const displayReadingBookmark =
    showNewBookmark || isCurrentBookmark
      ? resourceDisplayName
      : parseBookmarkForDisplay(effectiveCurrentBookmark);

  const showRemoveSection =
    isCurrentBookmark &&
    !isRemovalInProgress &&
    !isUndoInProgress &&
    pendingBookmarkValue === null &&
    previousBookmarkValue === null;

  // Cleanup effect for setTimeout calls
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (removalTimeoutRef.current) clearTimeout(removalTimeoutRef.current);
    };
  }, []);

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
          const errorMessage =
            reduxError instanceof Error
              ? `Failed to save guest reading bookmark via Redux: ${reduxError.message}`
              : 'Failed to save guest reading bookmark via Redux.';
          throw new Error(errorMessage);
        }
      }
    },
    [isLoggedIn, onUpdateUserPreference, mushafId, dispatch],
  );

  /**
   * Handler to set reading bookmark
   */
  const handleSetReadingBookmark = useCallback(async () => {
    if (!bookmarkValue || isCurrentBookmark || showNewBookmark) return;

    setIsLoading(true);
    setError(null);
    setPreviousBookmarkValue(effectiveCurrentBookmark || null);
    setPendingBookmarkValue(bookmarkValue);

    try {
      await persistBookmark(bookmarkValue);
      await onBookmarkChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set reading bookmark');
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
  ]);

  /**
   * Handler to undo reading bookmark
   */
  const handleUndoReadingBookmark = useCallback(async () => {
    if (previousBookmarkValue === undefined) return;

    setIsLoading(true);
    setError(null);
    setIsUndoInProgress(true);

    try {
      const valueToRevert = previousBookmarkValue || '';
      await persistBookmark(valueToRevert);

      setPendingBookmarkValue(null);
      setPreviousBookmarkValue(undefined);
      await onBookmarkChanged?.();

      undoTimeoutRef.current = setTimeout(() => {
        setIsUndoInProgress(false);
      }, STATE_TRANSITION_DELAY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo reading bookmark');
      setIsUndoInProgress(false);
    } finally {
      setIsLoading(false);
    }
  }, [previousBookmarkValue, persistBookmark, onBookmarkChanged]);

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
      setError(err instanceof Error ? err.message : 'Failed to remove reading bookmark');
      setPreviousBookmarkValue(null);
      setIsRemovalInProgress(false);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveCurrentBookmark, persistBookmark, onBookmarkChanged]);

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
