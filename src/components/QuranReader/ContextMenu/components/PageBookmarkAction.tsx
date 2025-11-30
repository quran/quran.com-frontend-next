import React, { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import usePageBookmark from '@/hooks/usePageBookmark';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { logButtonClick } from '@/utils/eventLogger';

interface PageBookmarkActionProps {
  pageNumber: number;
}

/**
 * Component for bookmarking a Quran page
 * @returns {JSX.Element} A React component that displays a bookmark icon for the current page
 */
const PageBookmarkAction: React.FC<PageBookmarkActionProps> = React.memo(({ pageNumber }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation();

  // Use custom hook for all bookmark logic
  const { isPageBookmarked, isLoading, handleToggleBookmark } = usePageBookmark({
    pageNumber,
    mushafId,
  });

  // Helper: Get event name for analytics
  const getEventName = useCallback(() => {
    const action = isPageBookmarked ? 'un_bookmark' : 'bookmark';
    return `context_menu_page_${action}`;
  }, [isPageBookmarked]);

  const onToggleBookmarkClicked = useCallback(() => {
    logButtonClick(getEventName());
    handleToggleBookmark();
  }, [getEventName, handleToggleBookmark]);

  // Render appropriate bookmark icon based on loading and bookmark state
  const bookmarkIcon = useMemo(() => {
    if (isLoading) {
      return <Spinner />;
    }
    if (isPageBookmarked) {
      return <BookmarkedIcon className={styles.bookmarkedIcon} />;
    }
    return <UnBookmarkedIcon className={styles.unbookmarkedIcon} />;
  }, [isLoading, isPageBookmarked]);

  return (
    <button
      type="button"
      className={styles.bookmarkButton}
      onClick={onToggleBookmarkClicked}
      disabled={isLoading}
      aria-label={
        isPageBookmarked ? t('quran-reader:remove-bookmark') : t('quran-reader:add-bookmark')
      }
    >
      {bookmarkIcon}
    </button>
  );
});

export default PageBookmarkAction;
