import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import styles from './RecentReadingSessions.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData } from 'src/utils/chapter';
import { getFromVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

const RecentReadingSessions = () => {
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const verseKeys = Object.keys(recentReadingSessions);
  return (
    <>
      {verseKeys.length > 0 && (
        <div className={styles.sessionsContainer}>
          <p className={styles.sessionsHeader}>Continue Reading</p>
          <div className={styles.verseLinksContainer}>
            {verseKeys.map((verseKey, index) => {
              const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
              const surahName = getChapterData(chapterId).nameSimple;
              return (
                <Button
                  href={getFromVerseToEndOfChapterNavigationUrl(verseKey)}
                  type={index === 0 ? ButtonType.Primary : ButtonType.Secondary}
                  key={verseKey}
                  className={styles.button}
                >
                  {`Surah ${surahName} - ${verseNumber}`}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentReadingSessions;
