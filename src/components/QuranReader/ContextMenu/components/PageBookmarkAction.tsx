import React, { useCallback, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWR from 'swr';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import BookmarkStarIcon from '@/icons/bookmark-star.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { getUserPreferences } from '@/utils/auth/api';
import { makeUserPreferencesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getPageNumberFromBookmark } from '@/utils/bookmark';
import { logButtonClick } from '@/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

const SaveBookmarkModal = dynamic(
  () => import('@/components/Verse/SaveBookmarkModal/SaveBookmarkModal'),
  { ssr: false },
);

interface PageBookmarkActionProps {
  pageNumber: number;
}

/**
 * Component for bookmarking a Quran page
 * Opens SaveBookmarkModal for both logged-in users and guests
 *
 * @returns {JSX.Element} A React component that displays a bookmark icon for the current page
 */
const PageBookmarkAction: React.FC<PageBookmarkActionProps> = React.memo(({ pageNumber }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const isGuest = !isLoggedIn();

  // TODO: use these to make the page mapping and normalization
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user preferences for reading bookmark (logged-in users)
  const { data: userPreferences, isValidating: isLoading } = useSWR(
    !isGuest ? makeUserPreferencesUrl() : null,
    getUserPreferences,
  );

  const pageBookmark = isGuest
    ? guestReadingBookmark
    : (userPreferences?.readingBookmark?.bookmark as string);

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = useMemo((): boolean => {
    if (pageBookmark?.startsWith?.(BookmarkType.Page)) {
      const page = getPageNumberFromBookmark(pageBookmark);
      return page === pageNumber;
    }

    return false;
  }, [pageBookmark, pageNumber]);

  const onModalClose = useCallback((): void => {
    setIsModalOpen(false);
  }, []);

  const onBookmarkClicked = useCallback((): void => {
    logButtonClick('context_menu_page_bookmark_open');
    setIsModalOpen(true);
  }, []);

  let bookmarkIcon = <Spinner />;
  if (!isLoading) {
    bookmarkIcon = isPageBookmarked ? (
      <BookmarkStarIcon className={styles.bookmarkedIcon} />
    ) : (
      <UnBookmarkedIcon className={styles.unbookmarkedIcon} />
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.bookmarkButton}
        onClick={onBookmarkClicked}
        disabled={isLoading}
        aria-label={
          isPageBookmarked ? t('quran-reader:remove-bookmark') : t('quran-reader:add-bookmark')
        }
      >
        {bookmarkIcon}
      </button>
      <SaveBookmarkModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        type={SaveBookmarkType.PAGE}
        pageNumber={pageNumber}
      />
    </>
  );
});

export default PageBookmarkAction;
