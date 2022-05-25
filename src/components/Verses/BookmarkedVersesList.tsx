import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import styles from './BookmarkedVersesList.module.scss';

import Button, { ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import { privateFetcher } from 'src/utils/auth/api';
import { makeBookmarksUrl } from 'src/utils/auth/apiPaths';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { getVerseNavigationUrlByVerseKey } from 'src/utils/navigation';
import { getChapterNumberFromKey } from 'src/utils/verse';

const BookmarkedVersesList: React.FC = () => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const verseKeys = Object.keys(bookmarkedVerses);

  const { data } = useSWR<any>(makeBookmarksUrl(), privateFetcher);

  if (!data) return null;

  return (
    <div className={styles.container}>
      {verseKeys.length > 0 ? (
        <div className={styles.bookmarksContainer}>
          <div className={styles.verseLinksContainer}>
            {data?.map((item) => {
              const verseKey = `${item.chapterNumber}:${item.verseNumber}`;
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
