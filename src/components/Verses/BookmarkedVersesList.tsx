import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './BookmarkedVersesList.module.scss';

import Button, { ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import { getVerseNavigationUrl } from 'src/utils/navigation';

const BookmarkedVersesList: React.FC = () => {
  const { t } = useTranslation('home');
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const verseKeys = Object.keys(bookmarkedVerses);
  return (
    <div className={styles.container}>
      {verseKeys.length > 0 ? (
        <div className={styles.bookmarksContainer}>
          <div className={styles.verseLinksContainer}>
            {verseKeys.slice(0, 10).map((verseKey) => (
              <Button
                href={getVerseNavigationUrl(verseKey)}
                type={ButtonType.Success}
                shape={ButtonShape.Pill}
              >
                {verseKey}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div>{t('no-bookmarks')}</div>
      )}
    </div>
  );
};

export default BookmarkedVersesList;
