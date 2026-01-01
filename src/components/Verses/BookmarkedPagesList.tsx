import React, { useMemo, useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import useSWR from 'swr';

import styles from './BookmarkedVersesList.module.scss';
import BookmarkedVersesListSkeleton from './BookmarkedVesesListSkeleton';
import PageBookmarkPill from './PageBookmarkPill';

import Link from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import { selectBookmarkedPages, togglePageBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { deleteBookmarkById, privateFetcher } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import mutatingFetcherConfig from '@/utils/swr';
import Bookmark from 'types/Bookmark';
import BookmarkType from 'types/BookmarkType';

const BOOKMARKS_API_LIMIT = 10;

const BookmarkedPagesList = () => {
  const { t } = useTranslation('home');
  const { isLoggedIn } = useIsLoggedIn();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const dispatch = useDispatch();
  const toast = useToast();
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const [deletingPageNumber, setDeletingPageNumber] = useState<number | null>(null);

  const { data, isValidating, mutate } = useSWR<Bookmark[]>(
    isLoggedIn ? makeBookmarksUrl(mushafId, BOOKMARKS_API_LIMIT, BookmarkType.Page) : null,
    privateFetcher,
    mutatingFetcherConfig,
  );

  const bookmarkedPageNumbers = useMemo(() => {
    if (isValidating) return [];
    if (isLoggedIn && data) {
      return data.map((bookmark) => bookmark.key);
    }
    if (!isLoggedIn) {
      return Object.keys(bookmarkedPages).map(Number);
    }
    return [];
  }, [bookmarkedPages, data, isValidating, isLoggedIn]);

  const hasReachedBookmarksLimit = useMemo(() => {
    return isLoggedIn && data && data.length >= BOOKMARKS_API_LIMIT;
  }, [data, isLoggedIn]);

  const onBookmarkDeleted = useCallback(
    async (pageNumber: number) => {
      // Prevent duplicate delete requests
      if (deletingPageNumber !== null) return;

      logButtonClick('bookmarked_pages_list_delete');
      if (isLoggedIn) {
        const selectedBookmark = data?.find((bookmark) => bookmark.key === pageNumber);
        if (selectedBookmark) {
          setDeletingPageNumber(pageNumber);
          try {
            await deleteBookmarkById(selectedBookmark.id);
            mutate();
            invalidateAllBookmarkCaches();
          } catch {
            toast(t('common:error.general'), { status: ToastStatus.Error });
          } finally {
            setDeletingPageNumber(null);
          }
        }
      } else {
        dispatch(togglePageBookmark(pageNumber.toString()));
      }
    },
    [isLoggedIn, data, mutate, invalidateAllBookmarkCaches, toast, t, dispatch, deletingPageNumber],
  );

  const onViewAllBookmarksClicked = () => {
    logButtonClick('view_all_page_bookmarks');
  };

  if (isValidating) {
    return (
      <div className={styles.container}>
        <div className={styles.bookmarksContainer}>
          <div className={styles.verseLinksContainer}>
            <BookmarkedVersesListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {bookmarkedPageNumbers.length > 0 ? (
        <div className={styles.verseLinksContainer}>
          {bookmarkedPageNumbers.map((pageNumber) => (
            <PageBookmarkPill
              key={pageNumber}
              pageNumber={pageNumber}
              onDeleted={onBookmarkDeleted}
              isDeleting={deletingPageNumber === pageNumber}
            />
          ))}
          {hasReachedBookmarksLimit && (
            <Link
              href="/collections/all"
              className={styles.viewAllBookmarksContainer}
              onClick={onViewAllBookmarksClicked}
            >
              {t('view-all-bookmarks')}
            </Link>
          )}
        </div>
      ) : (
        <div>{t('no-page-bookmarks')}</div>
      )}
    </div>
  );
};

export default BookmarkedPagesList;
