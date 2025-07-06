import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectBookmarkedPages, togglePageBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

interface PageBookmarkActionProps {
  pageNumber: number;
}

/**
 * Component for bookmarking a Quran page
 * @returns {JSX.Element} A React component that displays a bookmark icon for the current page
 */
const PageBookmarkAction: React.FC<PageBookmarkActionProps> = React.memo(({ pageNumber }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const toast = useToast();
  const { cache } = useSWRConfig();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Use SWR to fetch bookmark data
  const {
    data: bookmark,
    isValidating: isLoading,
    mutate,
  } = useSWRImmutable<Bookmark>(
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

  // Handle bookmark toggle action
  const handleBookmarkAdd = async () => {
    try {
      const response = await addBookmark({
        key: Number(pageNumber),
        mushafId,
        type: BookmarkType.Page,
      });
      // Explicitly cast the response to Bookmark type
      mutate(() => response as Bookmark, { revalidate: false });
      toast(t('quran-reader:page-bookmarked'), {
        status: ToastStatus.Success,
      });
    } catch (error) {
      // Revalidate to get the correct state
      mutate();
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    }
  };

  // Handle bookmark removal
  const handleBookmarkRemove = async () => {
    if (!bookmark) return;
    try {
      // Optimistic update
      mutate(null, { revalidate: false });
      await deleteBookmarkById(bookmark.id);
      toast(t('quran-reader:page-bookmark-removed'), {
        status: ToastStatus.Success,
      });
    } catch (error) {
      // Revalidate to get the correct state
      mutate();
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
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
});

export default PageBookmarkAction;
