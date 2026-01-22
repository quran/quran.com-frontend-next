import React, { useCallback, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import BookmarkType from '../../../../../types/BookmarkType';
import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import useMappedBookmark from '@/hooks/useMappedBookmark';
import BookmarkStarIcon from '@/icons/bookmark-star.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { getUserPreferences } from '@/utils/auth/api';
import { makeUserPreferencesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';

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
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const isGuest = !isLoggedIn();

  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user preferences for reading bookmark (logged-in users)
  const { data: userPreferences, isValidating: isLoading } = useSWR(
    !isGuest ? makeUserPreferencesUrl() : null,
    getUserPreferences,
  );

  // Use the reusable mapping hook for cross-mushaf bookmark handling (guests only)
  const {
    needsMapping,
    effectivePageNumber,
    isLoading: isMappingLoading,
  } = useMappedBookmark({
    bookmark: isGuest ? guestReadingBookmark : null,
    swrKeyPrefix: 'map-bookmark-nav',
  });

  // Check if current page is the reading bookmark
  const isPageBookmarked = useMemo((): boolean => {
    if (isGuest) {
      // For guest, compare with effective (mapped) page number
      if (guestReadingBookmark?.type !== BookmarkType.Page) return false;
      // If mapping is still loading, treat as not bookmarked yet
      if (needsMapping && effectivePageNumber === null) return false;
      return effectivePageNumber === pageNumber;
    }

    // For logged-in users, check readingBookmark data
    const readingBookmark = userPreferences?.readingBookmark?.bookmark;
    if (!readingBookmark) return false;

    return readingBookmark.type === BookmarkType.Page && readingBookmark.key === pageNumber;
  }, [
    isGuest,
    guestReadingBookmark,
    needsMapping,
    effectivePageNumber,
    userPreferences,
    pageNumber,
  ]);

  const onModalClose = useCallback((): void => {
    setIsModalOpen(false);
  }, []);

  const onBookmarkClicked = useCallback((): void => {
    logButtonClick('context_menu_page_bookmark_open');
    setIsModalOpen(true);
  }, []);

  const isLoadingAny = isLoading || isMappingLoading;

  let bookmarkIcon = <Spinner />;
  if (!isLoadingAny) {
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
        disabled={isLoadingAny}
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
