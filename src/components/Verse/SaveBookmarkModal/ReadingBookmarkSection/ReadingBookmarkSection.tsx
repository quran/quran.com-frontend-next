/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
import { useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingBookmarkSection.module.scss';

import DataContext from '@/contexts/DataContext';
import Spinner from '@/dls/Spinner/Spinner';
import BookmarkStarIcon from '@/icons/bookmark-star.svg';
import BookmarkBlankIcon from '@/icons/bookmark_blank.svg';
import CheckIcon from '@/icons/check.svg';
import { selectGuestReadingBookmark, setGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import PreferenceGroup, { ReadingBookmarkPreferenceGroupKey } from '@/types/auth/PreferenceGroup';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';

// Flickering issue resolving by smooth state changes
// Debounce removal flag to prevent flicker when state updates
const STATE_TRANSITION_DELAY_MS = 300;

export enum ReadingBookmarkType {
  Verse = 'verse',
  Page = 'page',
}

interface ReadingBookmarkSectionProps {
  /** Type of reading bookmark (verse or page) */
  type: ReadingBookmarkType;
  /** Verse key in format "chapterId:verseNumber" (required for verse type) */
  verseKey?: string;
  /** Page number (required for page type) */
  pageNumber?: number;
  /** Current reading bookmark value (format: "ayah:chapterId:verseNumber" or "page:pageNumber") */
  currentReadingBookmark?: string | null;
  /** Callback when reading bookmark is successfully set (for parent to invalidate caches) */
  onBookmarkChanged?: () => void | Promise<void>;
  /** Optional CSS class name for the root element */
  className?: string;
  /** Language for localization */
  lang: string;
  /** Is user logged in - determines if changes persist to server */
  isLoggedIn?: boolean;
  /** Mushaf ID for logged-in users */
  mushafId?: number;
  /** API function to update user preference (for logged-in users) */
  onUpdateUserPreference?: (
    key: string,
    value: string,
    group: string,
    mushafId: number,
  ) => Promise<void>;
}

/**
 * Self-contained reading bookmark section component for both SaveBookmarkModal and GuestUserPrompt
 * Manages all reading bookmark state and logic internally, providing a clean interface
 * Handles both logged-in users (persisting to server) and guest users (persisting to Redux/localStorage via redux-persist)
 *
 * @returns {JSX.Element} The ReadingBookmarkSection component
 */
const ReadingBookmarkSection: React.FC<ReadingBookmarkSectionProps> = ({
  type,
  verseKey,
  pageNumber,
  currentReadingBookmark,
  onBookmarkChanged,
  className,
  lang,
  isLoggedIn = false,
  mushafId,
  onUpdateUserPreference,
}) => {
  const { t } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;
  const chaptersData = useContext(DataContext);
  const dispatch = useDispatch();

  // Get guest reading bookmark from Redux store for guest users
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);

  // Determine the effective current reading bookmark based on login status
  const effectiveCurrentBookmark = useMemo(() => {
    if (isLoggedIn) {
      return currentReadingBookmark;
    }
    return guestReadingBookmark;
  }, [isLoggedIn, currentReadingBookmark, guestReadingBookmark]);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingBookmarkValue, setPendingBookmarkValue] = useState<string | null>(null);
  const [previousBookmarkValue, setPreviousBookmarkValue] = useState<string | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  // Track if we just removed a bookmark to prevent showing remove section immediately after
  const [isRemovalInProgress, setIsRemovalInProgress] = useState(false);
  // Track if an undo operation is in progress
  const [isUndoInProgress, setIsUndoInProgress] = useState(false);
  // Refs to track timeout IDs for cleanup
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isVerse = type === ReadingBookmarkType.Verse;

  // Build the bookmark value based on type
  const bookmarkValue = useMemo(() => {
    if (isVerse && verseKey) {
      const [chapterId, verseNumber] = verseKey.split(':');
      return `ayah:${chapterId}:${verseNumber}`;
    }
    if (!isVerse && pageNumber) {
      return `page:${pageNumber}`;
    }
    return null;
  }, [isVerse, verseKey, pageNumber]);

  // Display name for the resource
  const resourceDisplayName = useMemo(() => {
    if (isVerse && verseKey) {
      const [chapterId] = verseKey.split(':');
      const chapter = getChapterData(chaptersData, chapterId);
      return `${chapter?.transliteratedName || ''} ${toLocalizedVerseKey(verseKey, lang)}`;
    }
    if (!isVerse && pageNumber) {
      return `${commonT('page')} ${toLocalizedNumber(pageNumber, lang)}`;
    }
    return '';
  }, [isVerse, verseKey, pageNumber, chaptersData, lang, commonT]);

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
        return `${commonT('page')} ${toLocalizedNumber(Number(parts[1]), lang)}`;
      }
      return null;
    },
    [chaptersData, lang, commonT],
  );

  // Determine section state
  // showNewBookmark: User clicked to set a different bookmark and it's pending/saved
  const showNewBookmark = pendingBookmarkValue === bookmarkValue;

  // isCurrentBookmark: This verse/page IS the current reading bookmark
  const isCurrentBookmark = effectiveCurrentBookmark === bookmarkValue;

  // isSelected: Either it's the new pending bookmark or it's the current bookmark
  const isSelected = showNewBookmark || isCurrentBookmark;

  // Get display text for reading bookmark
  const displayReadingBookmark =
    showNewBookmark || isCurrentBookmark
      ? resourceDisplayName
      : parseBookmarkForDisplay(effectiveCurrentBookmark);

  // Determine if we should show the remove section
  const showRemoveSection =
    isCurrentBookmark &&
    !isRemovalInProgress &&
    !isUndoInProgress &&
    pendingBookmarkValue == null &&
    previousBookmarkValue == null;

  /**
   * Cleanup effect for setTimeout calls to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (removalTimeoutRef.current) clearTimeout(removalTimeoutRef.current);
    };
  }, []);

  /**
   * Internal handler to set reading bookmark
   * When saving: if changing from one bookmark to another, store the previous value for undo
   * After saving: show undo button only if we changed FROM something (previousBookmarkValue is set)
   */
  const handleSetReadingBookmark = useCallback(async () => {
    if (!bookmarkValue || isCurrentBookmark || showNewBookmark) return;

    setIsLoading(true);
    setError(null);
    // Store the previous bookmark only if there IS one (changing FROM something)
    // If there's no previous bookmark, don't set previousBookmarkValue
    setPreviousBookmarkValue(effectiveCurrentBookmark || null);
    setPendingBookmarkValue(bookmarkValue);
    try {
      if (isLoggedIn && onUpdateUserPreference && mushafId) {
        // For logged-in users: persist to server
        // Pass the group parameter as a string that matches the enum value
        await onUpdateUserPreference(
          ReadingBookmarkPreferenceGroupKey.BOOKMARK,
          bookmarkValue,
          PreferenceGroup.READING_BOOKMARK,
          mushafId,
        );
      } else {
        // For guest users: persist to Redux (which syncs to localStorage via redux-persist)
        try {
          dispatch(setGuestReadingBookmark(bookmarkValue));
        } catch (reduxError) {
          // If Redux fails, we can't persist for guests
          throw new Error('Unable to save reading bookmark. Please try again.');
        }
      }

      // Notify parent to invalidate caches
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
    isLoggedIn,
    onUpdateUserPreference,
    mushafId,
    onBookmarkChanged,
    dispatch,
  ]);

  /**
   * Internal handler to undo reading bookmark
   * Reverts to previous bookmark value (or clears if there was no previous)
   */
  const handleUndoReadingBookmark = useCallback(async () => {
    // previousBookmarkValue can be null (meaning we set a bookmark when there was none)
    // or a string (meaning we're reverting to a previous bookmark)
    if (previousBookmarkValue === undefined) return;

    setIsLoading(true);
    setError(null);
    setIsUndoInProgress(true);

    try {
      // If previousBookmarkValue is null, we're clearing the bookmark (reverting to no bookmark)
      const valueToRevert = previousBookmarkValue || '';

      if (isLoggedIn && onUpdateUserPreference && mushafId) {
        // For logged-in users: persist to server
        await onUpdateUserPreference(
          ReadingBookmarkPreferenceGroupKey.BOOKMARK,
          valueToRevert,
          PreferenceGroup.READING_BOOKMARK,
          mushafId,
        );
      } else {
        // For guest users: update Redux store (which syncs to localStorage via redux-persist)
        try {
          dispatch(setGuestReadingBookmark(valueToRevert));
        } catch (reduxError) {
          // If Redux fails, we can't persist for guests
          throw new Error('Unable to undo reading bookmark. Please try again.');
        }
      }

      setPendingBookmarkValue(null);
      setPreviousBookmarkValue(undefined);

      // Notify parent to invalidate caches
      await onBookmarkChanged?.();

      // Use debounce timeout to prevent flicker - wait for parent re-render with updated
      // effectiveCurrentBookmark before clearing isUndoInProgress flag
      undoTimeoutRef.current = setTimeout(() => {
        setIsUndoInProgress(false);
      }, STATE_TRANSITION_DELAY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo reading bookmark');
      setIsUndoInProgress(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    previousBookmarkValue,
    isLoggedIn,
    onUpdateUserPreference,
    mushafId,
    onBookmarkChanged,
    dispatch,
  ]);

  /**
   * Handle click to set bookmark
   */
  const handleClick = useCallback(() => {
    if (!isCurrentBookmark && !showNewBookmark) {
      handleSetReadingBookmark();
    }
  }, [isCurrentBookmark, showNewBookmark, handleSetReadingBookmark]);

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isCurrentBookmark && !showNewBookmark) {
        e.preventDefault(); // Prevent page scroll on Space
        handleClick();
      }
    },
    [isCurrentBookmark, showNewBookmark, handleClick],
  );

  /**
   * Handle undo button click
   */
  const handleUndoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleUndoReadingBookmark();
    },
    [handleUndoReadingBookmark],
  );

  /**
   * Handle remove current reading bookmark
   */
  const handleRemoveCurrentBookmark = useCallback(async () => {
    if (!effectiveCurrentBookmark) return;

    setIsLoading(true);
    setError(null);
    // Mark removal in progress immediately to prevent flicker
    setIsRemovalInProgress(true);
    // Clear pending bookmark value to allow setting again during removal
    setPendingBookmarkValue(null);

    try {
      const emptyBookmarkValue = '';
      if (isLoggedIn && onUpdateUserPreference && mushafId) {
        // For logged-in users: persist to server
        await onUpdateUserPreference(
          ReadingBookmarkPreferenceGroupKey.BOOKMARK,
          emptyBookmarkValue,
          PreferenceGroup.READING_BOOKMARK,
          mushafId,
        );
      } else {
        // For guest users: clear from Redux store
        try {
          dispatch(setGuestReadingBookmark(emptyBookmarkValue));
        } catch (reduxError) {
          throw new Error('Unable to remove reading bookmark. Please try again.');
        }
      }

      // Notify parent to invalidate caches
      await onBookmarkChanged?.();

      // Reset state after successful remove
      setPreviousBookmarkValue(undefined);
      // Use debounce timeout to prevent flicker - wait for parent re-render with updated
      // effectiveCurrentBookmark before clearing isRemovalInProgress flag
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
  }, [
    effectiveCurrentBookmark,
    isLoggedIn,
    onUpdateUserPreference,
    mushafId,
    onBookmarkChanged,
    dispatch,
  ]);

  /**
   * Handle click to remove current reading bookmark
   */
  const handleRemoveClick = useCallback(() => {
    handleRemoveCurrentBookmark();
  }, [handleRemoveCurrentBookmark]);

  /**
   * Handle keyboard interaction for remove button
   */
  const handleRemoveKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleRemoveClick();
      }
    },
    [handleRemoveClick],
  );

  /**
   * Determine which section to show:
   * Remove section shows only when:
   * - Current verse/page IS the reading bookmark
   * - No pending bookmark change (pendingBookmarkValue is null)
   * - No undo action pending (previousBookmarkValue is undefined or null)
   * - No removal is in progress
   *
   * This prevents flicker and ensures clean state transitions:
   * - No bookmark → Show set option
   * - Bookmark set → Show remove option (when viewing same verse/page)
   * - After remove → Reset state, show set option again
   * - After setting new bookmark → Show undo option until confirmed or undo clicked
   */
  return (
    <div className={styles.readingBookmarkContainer}>
      {/* Remove current reading bookmark section - shown only when current verse/page is the reading bookmark */}
      {showRemoveSection && (
        <div
          className={classNames(styles.removeReadingBookmarkSection)}
          onClick={handleRemoveClick}
          role="button"
          tabIndex={0}
          onKeyDown={handleRemoveKeyDown}
          aria-label={t('remove-my-reading-bookmark')}
        >
          <div className={styles.removeIcon}>
            <BookmarkStarIcon />
          </div>
          <div className={styles.removeContent}>
            <div className={styles.removeTitle}>{t('remove-my-reading-bookmark')}</div>
            <div className={styles.removeInfo}>
              <span className={styles.label}>{t('current')}:</span>
              <span className={styles.value}>{resourceDisplayName}</span>
            </div>
          </div>

          {isLoading ? (
            <Spinner />
          ) : (
            <div className={classNames(styles.checkIcon, styles.checked)}>
              <CheckIcon />
            </div>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      )}

      {/* Main reading bookmark section - shown when:
          - Not viewing the current bookmark, OR
          - There's a pending bookmark change, OR
          - There's an undo action pending
      */}
      {!showRemoveSection && (
        <div
          className={classNames(styles.readingBookmarkSection, className, {
            [styles.selected]: isSelected,
          })}
          onClick={handleClick}
          role="button"
          tabIndex={isSelected ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          <div className={styles.readingBookmarkIcon}>
            {isSelected ? <BookmarkStarIcon /> : <BookmarkBlankIcon />}
          </div>
          <div className={styles.readingBookmarkContent}>
            <div className={styles.readingBookmarkTitle}>{t('set-as-reading-bookmark')}</div>
            <div className={styles.readingBookmarkInfo}>
              {showNewBookmark ? (
                <>
                  <span className={styles.label}>{t('new')}:</span>
                  <span className={styles.value}>{resourceDisplayName}</span>
                  {previousBookmarkValue !== undefined && previousBookmarkValue !== null && (
                    <button
                      type="button"
                      className={styles.undoButton}
                      onClick={handleUndoClick}
                      disabled={isLoading}
                      aria-label={t('undo')}
                    >
                      ({t('undo')})
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className={styles.label}>
                    {effectiveCurrentBookmark ? t('current') : t('none')}:
                  </span>
                  <span className={styles.value}>
                    {displayReadingBookmark || t('no-bookmark-set')}
                  </span>
                </>
              )}
            </div>
          </div>

          {isLoading ? (
            <Spinner />
          ) : isSelected ? (
            <div className={classNames(styles.checkIcon, styles.checked)}>
              <CheckIcon />
            </div>
          ) : (
            <div className={styles.checkbox} />
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      )}
    </div>
  );
};

export default ReadingBookmarkSection;
