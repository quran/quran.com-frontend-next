/* eslint-disable no-nested-ternary */
import { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingBookmarkSection.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import BookmarkStarIcon from '@/icons/bookmark-star.svg';
import BookmarkBlankIcon from '@/icons/bookmark_blank.svg';
import CheckIcon from '@/icons/check.svg';
import QuestionIcon from '@/icons/question-mark-rounded.svg';

interface SetBookmarkSectionProps {
  /** Whether this bookmark option is selected */
  isSelected: boolean;
  /** Whether a new bookmark is being set (pending state) */
  showNewBookmark: boolean;
  /** Display name for the resource being bookmarked */
  resourceDisplayName: string;
  /** Display text for the current reading bookmark */
  displayReadingBookmark: string | null;
  /** Current effective bookmark value */
  effectiveCurrentBookmark: string | null | undefined;
  /** Previous bookmark value for undo functionality */
  previousBookmarkValue: string | null | undefined;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Error message to display, if any */
  error: string | null;
  /** Optional CSS class name */
  className?: string;
  /** Handler to set the bookmark */
  onSet: () => Promise<void>;
  /** Handler to undo the bookmark change */
  onUndo: () => Promise<void>;
}

/**
 * Section component for setting a new reading bookmark.
 * Displays the current bookmark state and allows setting/undoing bookmarks.
 * @returns {JSX.Element} The SetBookmarkSection component
 */
const SetBookmarkSection: React.FC<SetBookmarkSectionProps> = ({
  isSelected,
  showNewBookmark,
  resourceDisplayName,
  displayReadingBookmark,
  effectiveCurrentBookmark,
  previousBookmarkValue,
  isLoading,
  error,
  className,
  onSet,
  onUndo,
}) => {
  const { t } = useTranslation('quran-reader');

  const handleClick = useCallback(() => {
    if (!isSelected) {
      onSet();
    }
  }, [isSelected, onSet]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isSelected) {
        e.preventDefault();
        handleClick();
      }
    },
    [isSelected, handleClick],
  );

  const handleUndoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onUndo();
    },
    [onUndo],
  );

  const showUndoButton =
    showNewBookmark && previousBookmarkValue !== undefined && previousBookmarkValue !== null;

  return (
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
        <div className={styles.readingBookmarkTitle}>
          {t('set-as-reading-bookmark')}
          <span className={styles.questionIcon} title={t('reading-bookmark-info-tooltip')}>
            <QuestionIcon />
          </span>
        </div>
        <div className={styles.readingBookmarkInfo}>
          {showNewBookmark ? (
            <>
              <span className={styles.label}>{t('new')}:</span>
              <span className={styles.value}>{resourceDisplayName}</span>
              {showUndoButton && (
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
              <span className={styles.value}>{displayReadingBookmark || t('no-bookmark-set')}</span>
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
  );
};

export default SetBookmarkSection;
