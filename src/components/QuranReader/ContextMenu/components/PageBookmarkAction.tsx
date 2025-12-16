import React, { useCallback, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectBookmarkedPages } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { getBookmark } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import Bookmark from 'types/Bookmark';
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
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use SWR to fetch bookmark data
  const { data: bookmark, isValidating: isLoading } = useSWRImmutable<Bookmark>(
    isLoggedIn() ? makeBookmarkUrl(mushafId, Number(pageNumber), BookmarkType.Page) : null,
    async () => {
      const response = await getBookmark(mushafId, Number(pageNumber), BookmarkType.Page);
      return response;
    },
  );

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = useMemo(() => {
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && bookmark) {
      return bookmark;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedPages?.[pageNumber.toString()];
    }
    return false;
  }, [bookmarkedPages, bookmark, pageNumber]);

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
      <BookmarkedIcon className={styles.bookmarkedIcon} />
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
        type={SaveBookmarkType.Page}
        pageNumber={pageNumber}
      />
    </>
  );
});

export default PageBookmarkAction;
