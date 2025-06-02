import React, { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { addBookmark, deleteBookmarkById, getBookmark } from '@/utils/auth/api';
import { makeBookmarksUrl, makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import BookmarkType from 'types/BookmarkType';

interface PageBookmarkActionProps {
  pageNumber: number;
  t: (key: string) => string;
}

/**
 * Component for bookmarking a Quran page
 * @returns {JSX.Element} A React component that displays a bookmark icon for the current page
 */
const PageBookmarkAction: React.FC<PageBookmarkActionProps> = ({ pageNumber, t }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const toast = useToast();
  const { cache } = useSWRConfig();

  const {
    data: bookmark,
    isValidating: isPageBookmarkedLoading,
    mutate,
  } = useSWRImmutable(
    isLoggedIn() ? makeBookmarkUrl(mushafId, Number(pageNumber), BookmarkType.Page) : null,
    async () => {
      const response = await getBookmark(mushafId, Number(pageNumber), BookmarkType.Page);
      return response;
    },
  );

  const isPageBookmarked = useMemo(() => {
    return !!bookmark;
  }, [bookmark]);

  // Handle bookmark toggle action
  const handleBookmarkAdd = () => {
    addBookmark({
      key: Number(pageNumber),
      mushafId,
      type: BookmarkType.Page,
    })
      .then(() => {
        mutate();
        toast(t('page-bookmarked'), {
          status: ToastStatus.Success,
        });
      })
      .catch(() => {
        toast(t('error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  // Handle bookmark removal
  const handleBookmarkRemove = () => {
    deleteBookmarkById(bookmark.id).then(() => {
      toast(t('page-bookmark-removed'), {
        status: ToastStatus.Success,
      });
    });
  };

  const onToggleBookmarkClicked = () => {
    logButtonClick(`context_menu_page_${isPageBookmarked ? 'un_bookmark' : 'bookmark'}`);

    if (isLoggedIn()) {
      // Optimistic update
      if (isPageBookmarked) {
        mutate(() => null, {
          revalidate: false,
        });
      }

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
    }
  };

  let bookmarkIcon = <Spinner />;
  if (!isPageBookmarkedLoading) {
    bookmarkIcon = isPageBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />;
  }

  return (
    <button
      type="button"
      className={styles.bookmarkButton}
      onClick={onToggleBookmarkClicked}
      disabled={isPageBookmarkedLoading}
      aria-label={isPageBookmarked ? t('remove-bookmark') : t('add-bookmark')}
    >
      {bookmarkIcon}
    </button>
  );
};

export default PageBookmarkAction;
