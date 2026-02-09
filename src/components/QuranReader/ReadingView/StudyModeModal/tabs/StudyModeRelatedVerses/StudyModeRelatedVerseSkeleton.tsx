/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/naming-convention */

import styles from './StudyModeRelatedVerses.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const StudyModeRelatedVerseSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <Skeleton className={styles.skeleton} />
    </div>
  );
};

export default StudyModeRelatedVerseSkeleton;
