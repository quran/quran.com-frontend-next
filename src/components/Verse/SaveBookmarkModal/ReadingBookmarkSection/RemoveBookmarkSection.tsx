import { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingBookmarkSection.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import BookmarkStarIcon from '@/icons/bookmark-star.svg';
import CheckIcon from '@/icons/check.svg';
import QuestionIcon from '@/icons/question-mark-rounded.svg';

interface RemoveBookmarkSectionProps {
  /** Display name for the current bookmark location */
  resourceDisplayName: string;
  /** Whether the remove operation is in progress */
  isLoading: boolean;
  /** Error message to display, if any */
  error: string | null;
  /** Handler to remove the current bookmark */
  onRemove: () => Promise<void>;
}

/**
 * Section component for removing the current reading bookmark.
 * Shown when the current verse/page is the active reading bookmark.
 * Displays the current bookmark state and allows removing the bookmark.
 * @returns {JSX.Element} The RemoveBookmarkSection component
 */
const RemoveBookmarkSection: React.FC<RemoveBookmarkSectionProps> = ({
  resourceDisplayName,
  isLoading,
  error,
  onRemove,
}) => {
  const { t } = useTranslation('quran-reader');

  const handleClick = useCallback(() => {
    onRemove();
  }, [onRemove]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <div
      className={classNames(styles.removeReadingBookmarkSection)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={t('remove-my-reading-bookmark')}
    >
      <div className={styles.removeIcon}>
        <BookmarkStarIcon />
      </div>
      <div className={styles.removeContent}>
        <div className={styles.removeTitle}>
          {t('remove-my-reading-bookmark')}
          <span className={styles.questionIcon} title={t('remove-my-reading-bookmark')}>
            <QuestionIcon />
          </span>
        </div>
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
  );
};

export default RemoveBookmarkSection;
