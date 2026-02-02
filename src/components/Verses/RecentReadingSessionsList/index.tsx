import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import ReadingSessionPill from './ReadingSessionPill';
import styles from './RecentReadingSessionsList.module.scss';
import RecentReadingSessionsListSkeleton from './Skeleton';

import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';

const RecentReadingSessionsList = () => {
  const { t } = useTranslation('home');

  const { recentlyReadVerseKeys, isLoading } = useGetRecentlyReadVerseKeys();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.bookmarksContainer}>
          <div className={styles.verseLinksContainer}>
            <RecentReadingSessionsListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (recentlyReadVerseKeys.length === 0) {
    return <>{t('no-recently-read')}</>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.verseLinksContainer}>
        {recentlyReadVerseKeys?.map((verseKey) => (
          <ReadingSessionPill key={verseKey} verseKey={verseKey} />
        ))}
      </div>
    </div>
  );
};

export default RecentReadingSessionsList;
