/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/naming-convention */

import styles from './StudyModeRelatedVerses.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const StudyModeRelatedVersesSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i.toString()} className={styles.skeleton} />
      ))}
    </div>
  );
};

export default StudyModeRelatedVersesSkeleton;
