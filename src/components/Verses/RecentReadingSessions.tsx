import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import styles from './RecentReadingSessions.module.scss';

import VerseLink from 'src/components/Verse/VerseLink';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';

const RecentReadingSessions = () => {
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const verseKeys = Object.keys(recentReadingSessions);
  return (
    <>
      {verseKeys.length > 0 && (
        <div className={styles.sessionsContainer}>
          <p className={styles.sessionsHeader}>Your latest reading sessions</p>
          <div className={styles.verseLinksContainer}>
            {verseKeys.map((verseKey) => {
              return <VerseLink verseKey={verseKey} key={verseKey} isRange />;
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentReadingSessions;
