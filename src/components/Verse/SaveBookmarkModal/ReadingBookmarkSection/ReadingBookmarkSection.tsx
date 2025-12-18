import { useEffect } from 'react';

import styles from './ReadingBookmarkSection.module.scss';
import RemoveBookmarkSection from './RemoveBookmarkSection';
import SetBookmarkSection from './SetBookmarkSection';
import useReadingBookmark from './useReadingBookmark';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { ReadingBookmarkType } from '@/types/Bookmark';

export { ReadingBookmarkType };

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
  currentReadingBookmark,
  onBookmarkChanged,
  className,
  lang,
  isLoggedIn = false,
  mushafId,
  onUpdateUserPreference,
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
    currentReadingBookmark,
    onBookmarkChanged,
    lang,
    isLoggedIn,
    mushafId,
    onUpdateUserPreference,
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
          error={error}
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
