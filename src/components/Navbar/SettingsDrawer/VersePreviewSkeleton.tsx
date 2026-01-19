import styles from './VersePreview.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

/**
 * Loading skeleton for the verse preview component
 *
 * @returns {JSX.Element} The skeleton loading UI
 */
const VersePreviewSkeleton = () => (
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
