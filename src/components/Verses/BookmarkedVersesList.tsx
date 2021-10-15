import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import Button, { ButtonShape, ButtonType } from '../dls/Button/Button';

import styles from './BookmarkedVersesList.module.scss';

import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';

const BookmarkedVersesList: React.FC = () => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const verseKeys = Object.keys(bookmarkedVerses);
  return (
    <>
      {verseKeys.length > 0 ? (
        <div className={styles.bookmarksContainer}>
          <div className={styles.verseLinksContainer}>
            {verseKeys.slice(0, 10).map((verseKey) => (
              <Button type={ButtonType.Success} shape={ButtonShape.Pill}>
                {verseKey}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div>You do not have any bookmark yet</div>
      )}
    </>
  );
};

export default BookmarkedVersesList;
