/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useMemo, useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import useSWR from 'swr';

import styles from './BookmarkedVersesList.module.scss';
import BookmarkedVersesListSkeleton from './BookmarkedVesesListSkeleton';
import BookmarkPill from './BookmarkPill';

import Link from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { deleteBookmarkById, privateFetcher } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import mutatingFetcherConfig from '@/utils/swr';
import { getVerseAndChapterNumbersFromKey, makeVerseKey } from '@/utils/verse';
import Bookmark from 'types/Bookmark';

const BOOKMARKS_API_LIMIT = 10;

const BookmarkedVersesList = () => {
  const { t } = useTranslation('home');
  const { isLoggedIn } = useIsLoggedIn();

  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const dispatch = useDispatch();

  const toast = useToast();
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();

  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);

  const [deletingVerseKey, setDeletingVerseKey] = useState<string | null>(null);

  const { data, isValidating, mutate } = useSWR<Bookmark[]>(
    isLoggedIn
      ? makeBookmarksUrl(
          getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
          BOOKMARKS_API_LIMIT,
        )
      : null,
    privateFetcher,
    mutatingFetcherConfig,
  );

  const bookmarkedVersesKeys = useMemo(() => {
    if (isValidating) return [];

    if (isLoggedIn && data) {
      return data.map((bookmark) => makeVerseKey(bookmark.key, bookmark.verseNumber));
    }

    if (!isLoggedIn) {
      return Object.keys(bookmarkedVerses);
    }

    return [];
  }, [bookmarkedVerses, data, isValidating, isLoggedIn]);

  const hasReachedBookmarksLimit = useMemo(() => {
    return isLoggedIn && data && data.length >= BOOKMARKS_API_LIMIT;
  }, [data, isLoggedIn]);

  const onBookmarkDeleted = useCallback(
    async (verseKey: string) => {
      // Prevent duplicate delete requests
      if (deletingVerseKey !== null) return;

      logButtonClick('bookmarked_verses_list_delete');
      if (isLoggedIn) {
        const selectedBookmark = data?.find((bookmark) => {
          const [chapter, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
          return (
            Number(chapter) === Number(bookmark.key) &&
            Number(verseNumber) === Number(bookmark.verseNumber)
          );
        });

        if (selectedBookmark) {
          setDeletingVerseKey(verseKey);
          try {
            await deleteBookmarkById(selectedBookmark.id);
            mutate();
            invalidateAllBookmarkCaches();
          } catch {
            toast(t('common:error.general'), {
              status: ToastStatus.Error,
            });
          } finally {
            setDeletingVerseKey(null);
          }
        }
      } else {
        dispatch(toggleVerseBookmark(verseKey));
      }
    },
    [isLoggedIn, data, mutate, invalidateAllBookmarkCaches, toast, t, dispatch, deletingVerseKey],
  );

  const onViewAllBookmarksClicked = () => {
    logButtonClick('view_all_bookmarks');
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
      {bookmarkedVersesKeys.length > 0 ? (
        <div className={styles.verseLinksContainer}>
          {bookmarkedVersesKeys?.map((verseKey) => (
            <BookmarkPill
              key={verseKey}
              verseKey={verseKey}
              onDeleted={onBookmarkDeleted}
              isDeleting={deletingVerseKey === verseKey}
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
        <div>{t('no-bookmarks')}</div>
      )}
    </div>
  );
};

export default BookmarkedVersesList;
