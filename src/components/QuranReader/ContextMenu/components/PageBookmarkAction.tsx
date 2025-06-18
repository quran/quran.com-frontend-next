import React, { useState, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectBookmarkedPages, togglePageBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

interface PageBookmarkActionProps {
  pageNumber: number;
}

/**
 * Component for bookmarking a Quran page
 * @returns {JSX.Element} A React component that displays a bookmark icon for the current page
 */
const PageBookmarkAction: React.FC<PageBookmarkActionProps> = ({ pageNumber }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const toast = useToast();
  const { cache } = useSWRConfig();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // State to track loading state
  const [isLoading, setIsLoading] = useState(false);
  // State to track bookmark data
  const [bookmark, setBookmark] = useState(null);

  // Determine if the page is bookmarked based on user login status and data source
  const isPageBookmarked = isLoggedIn() ? !!bookmark : !!bookmarkedPages?.[pageNumber.toString()];

  // Fetch bookmark data whenever the page number changes
  useEffect(() => {
    const fetchBookmarkData = async () => {
      if (!isLoggedIn()) return;

      setIsLoading(true);
      try {
        const response = await getBookmark(mushafId, Number(pageNumber), BookmarkType.Page);
        setBookmark(response);
      } catch (error) {
        // If there's an error, assume the page is not bookmarked
        setBookmark(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkData();

    // Clean up bookmark data when component unmounts or page changes
    return () => {
      setBookmark(null);
    };
  }, [pageNumber, mushafId]);

  // Handle bookmark toggle action
  const handleBookmarkAdd = async () => {
    setIsLoading(true);
    try {
      const response = await addBookmark({
        key: Number(pageNumber),
        mushafId,
        type: BookmarkType.Page,
      });
      setBookmark(response);
      toast(t('quran-reader:page-bookmarked'), {
        status: ToastStatus.Success,
      });
    } catch (error) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bookmark removal
  const handleBookmarkRemove = async () => {
    if (!bookmark) return;
    setIsLoading(true);
    try {
      await deleteBookmarkById(bookmark.id);
      setBookmark(null);
      toast(t('quran-reader:page-bookmark-removed'), {
        status: ToastStatus.Success,
      });
    } catch (error) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onToggleBookmarkClicked = () => {
    logButtonClick(`context_menu_page_${isPageBookmarked ? 'un_bookmark' : 'bookmark'}`);

    if (isLoggedIn()) {
      // Invalidate bookmarks cache
      cache.delete(
        makeBookmarksUrl(
          getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        ),
      );

      if (!isPageBookmarked) {
        handleBookmarkAdd();
      } else {
        handleBookmarkRemove();
      }
    } else {
      // For logged-out users, use Redux to store bookmarks locally
      dispatch(togglePageBookmark(pageNumber.toString()));
    }
  };

  let bookmarkIcon = <Spinner />;
  if (!isLoading) {
    bookmarkIcon = isPageBookmarked ? (
      <BookmarkedIcon className={styles.bookmarkedIcon} />
    ) : (
      <UnBookmarkedIcon className={styles.unbookmarkedIcon} />
    );
  }

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
};

export default PageBookmarkAction;
