/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import useSWR from 'swr';

import styles from './BookmarkedVersesList.module.scss';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CloseIcon from '@/icons/close.svg';
import { selectBookmarks, toggleVerseBookmark } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { deleteBookmarkById, privateFetcher } from '@/utils/auth/api';
import { makeBookmarksUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import {
  getChapterNumberFromKey,
  getVerseAndChapterNumbersFromKey,
  makeVerseKey,
} from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import Bookmark from 'types/Bookmark';

const BookmarkedVersesList: React.FC = () => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const dispatch = useDispatch();

  const toast = useToast();

  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);

  const { data, isValidating, mutate } = useSWR<Bookmark[]>(
    isLoggedIn() // only fetch the data when user is loggedIn
      ? makeBookmarksUrl(
          getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        )
      : null,
    privateFetcher,
  );

  const bookmarkedVersesKeys = useMemo(() => {
    if (isValidating) return [];

    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && data) {
      return data.map((bookmark) => makeVerseKey(bookmark.key, bookmark.verseNumber));
    }

    if (!isUserLoggedIn) {
      return Object.keys(bookmarkedVerses);
    }

    return [];
  }, [bookmarkedVerses, data, isValidating]);

  if (!bookmarkedVersesKeys.length) {
    return null;
  }

  const onBookmarkDeleted = (verseKey) => () => {
    logButtonClick('bookmarked_verses_list_delete');
    if (isLoggedIn()) {
      const selectedBookmark = data.find((bookmark) => {
        const [chapter, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
        return (
          Number(chapter) === Number(bookmark.key) &&
          Number(verseNumber) === Number(bookmark.verseNumber)
        );
      });

      deleteBookmarkById(selectedBookmark.id)
        .then(() => {
          mutate();
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
    } else {
      dispatch(toggleVerseBookmark(verseKey));
    }
  };

  const onLinkClicked = () => {
    logButtonClick('bookmarked_verses_list_link');
  };

  return (
    <div className={styles.container}>
      {bookmarkedVersesKeys.length > 0 ? (
        <div className={styles.bookmarksContainer}>
          <div className={styles.verseLinksContainer}>
            {bookmarkedVersesKeys?.map((verseKey) => {
              const chapterNumber = getChapterNumberFromKey(verseKey);
              const chapterData = getChapterData(chaptersData, chapterNumber.toString());
              const bookmarkText = `${chapterData.transliteratedName} ${toLocalizedVerseKey(
                verseKey,
                lang,
              )}`;
              return (
                <div key={verseKey} className={styles.bookmarkItem}>
                  <Link href={getVerseNavigationUrlByVerseKey(verseKey)}>
                    <a className={styles.linkButtonContainer} onClick={onLinkClicked}>
                      {bookmarkText}
                    </a>
                  </Link>
                  <button
                    onClick={onBookmarkDeleted(verseKey)}
                    type="button"
                    className={styles.closeIconContainer}
                  >
                    <span>
                      <CloseIcon />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>{t('no-bookmarks')}</div>
      )}
    </div>
  );
};

export default BookmarkedVersesList;
