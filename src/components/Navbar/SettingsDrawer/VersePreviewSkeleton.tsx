import React from 'react';

import styles from './VersePreview.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const VersePreviewSkeleton: React.FC = () => (
  <>
    <div className={styles.skeletonContainer}>
      <Skeleton>
        <div className={styles.skeletonPlaceholder} />
      </Skeleton>
    </div>
    <div className={styles.skeletonContainer}>
      <Skeleton>
        <div className={styles.skeletonPlaceholder} />
      </Skeleton>
    </div>
  </>
);

export default VersePreviewSkeleton;
