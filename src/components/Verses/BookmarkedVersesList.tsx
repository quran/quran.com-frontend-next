import React, { useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './BookmarkedVersesList.module.scss';

import Button, { ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { privateFetcher } from 'src/utils/auth/api';
import { makeBookmarksUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { getVerseNavigationUrlByVerseKey } from 'src/utils/navigation';
import { getChapterNumberFromKey, makeVerseKey } from 'src/utils/verse';
import Bookmark from 'types/Bookmark';

const BookmarkedVersesList: React.FC = () => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);

  const { data } = useSWRImmutable<Bookmark[]>(
    isLoggedIn() // only fetch the data when user is loggedIn
      ? makeBookmarksUrl(
          getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        )
      : null,
    privateFetcher,
  );

  const bookmarkedVersesKeys = useMemo(() => {
    if (isLoggedIn() && data) {
      return data.map((bookmark) => makeVerseKey(bookmark.key, bookmark.verseNumber));
    }

    if (bookmarkedVerses) {
      return Object.keys(bookmarkedVerses);
    }

    return [];
  }, [bookmarkedVerses, data]);

  if (!bookmarkedVersesKeys.length) {
    return null;
  }

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
                <Button
                  href={getVerseNavigationUrlByVerseKey(verseKey)}
                  className={styles.bookmarkItem}
                  type={ButtonType.Success}
                  shape={ButtonShape.Pill}
                  key={verseKey}
                  onClick={() => {
                    logButtonClick('homepage_bookmark');
                  }}
                >
                  {bookmarkText}
                </Button>
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
