import React from 'react';

import ReadingSessionPill from '../ReadingSessionPill';

import styles from './RecentReadingSessionsListSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const SESSIONS_COUNT = 10;
const sessionsArr = Array(SESSIONS_COUNT).fill(null);

const RecentReadingSessionsListSkeleton = () => {
  return (
    <span className={styles.skeletonContainer}>
      {sessionsArr.map((k, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={`skeleton_${i}`} isActive className={styles.skeletonItem}>
          <ReadingSessionPill verseKey="1:1" />
        </Skeleton>
      ))}
    </span>
  );
};

export default RecentReadingSessionsListSkeleton;
