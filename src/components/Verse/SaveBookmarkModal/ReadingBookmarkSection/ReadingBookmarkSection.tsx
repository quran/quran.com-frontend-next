import { useEffect } from 'react';

import styles from './ReadingBookmarkSection.module.scss';
import RemoveBookmarkSection from './RemoveBookmarkSection';
import SetBookmarkSection from './SetBookmarkSection';
import useReadingBookmark from './useReadingBookmark';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import Bookmark, { ReadingBookmarkType } from '@/types/Bookmark';

export { ReadingBookmarkType };

interface ReadingBookmarkSectionProps {
  /** Type of reading bookmark (verse or page) */
  type: ReadingBookmarkType;
  /** Verse key in format "chapterId:verseNumber" (required for verse type) */
  verseKey?: string;
  /** Page number (required for page type) */
  pageNumber?: number;
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
  /** Actual reading bookmark data (for logged-in users) */
  readingBookmarkData?: Bookmark | null;
  /** Mutate function for optimistic updates */
  mutateReadingBookmark?: (
    data?: Bookmark | null | Promise<Bookmark | null>,
    opts?: { revalidate?: boolean },
  ) => Promise<Bookmark | null | undefined>;
}

/**
 * Self-contained reading bookmark section component for both SaveBookmarkModal and GuestUserPrompt.
 * Manages all reading bookmark state and logic internally via useReadingBookmark hook.
 * Handles both logged-in users (persisting to server) and guest users (persisting to Redux/localStorage).
 *
 * @returns {JSX.Element} The ReadingBookmarkSection component
 */
const ReadingBookmarkSection: React.FC<ReadingBookmarkSectionProps> = ({
  type,
  verseKey,
  pageNumber,
  onBookmarkChanged,
  className,
  lang,
  isLoggedIn = false,
  mushafId,
  readingBookmarkData,
  mutateReadingBookmark,
}) => {
  const toast = useToast();
  const {
    isLoading,
    error,
    isSelected,
    showNewBookmark,
    showRemoveSection,
    resourceDisplayName,
    displayReadingBookmark,
    effectiveCurrentBookmark,
    previousBookmarkValue,
    handleSetReadingBookmark,
    handleUndoReadingBookmark,
    handleRemoveCurrentBookmark,
  } = useReadingBookmark({
    type,
    verseKey,
    pageNumber,
    onBookmarkChanged,
    lang,
    isLoggedIn,
    mushafId,
    readingBookmarkData,
    mutateReadingBookmark,
  });

  useEffect(() => {
    if (error) {
      toast(error, { status: ToastStatus.Error });
    }
  }, [error, toast]);

  return (
    <div className={styles.readingBookmarkContainer}>
      {showRemoveSection ? (
        <RemoveBookmarkSection
          resourceDisplayName={resourceDisplayName}
          isLoading={isLoading}
          onRemove={handleRemoveCurrentBookmark}
        />
      ) : (
        <SetBookmarkSection
          isSelected={isSelected}
          showNewBookmark={showNewBookmark}
          resourceDisplayName={resourceDisplayName}
          displayReadingBookmark={displayReadingBookmark}
          effectiveCurrentBookmark={effectiveCurrentBookmark}
          previousBookmarkValue={previousBookmarkValue}
          isLoading={isLoading}
          error={error}
          className={className}
          onSet={handleSetReadingBookmark}
          onUndo={handleUndoReadingBookmark}
        />
      )}
    </div>
  );
};

export default ReadingBookmarkSection;
