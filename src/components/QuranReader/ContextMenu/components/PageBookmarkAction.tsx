import React, { useCallback, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import useMappedBookmark from '@/hooks/useMappedBookmark';
import BookmarkStarIcon from '@/icons/bookmark-star.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
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
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const isGuest = !isLoggedIn();

  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use global reading bookmark hook for logged-in users
  const { readingBookmark, isLoading } = useGlobalReadingBookmark(mushafId);

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

    // For logged-in users, check readingBookmark from global hook
    if (!readingBookmark) return false;

    return readingBookmark.type === BookmarkType.Page && readingBookmark.key === pageNumber;
  }, [
    isGuest,
    guestReadingBookmark,
    needsMapping,
    effectivePageNumber,
    readingBookmark,
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
