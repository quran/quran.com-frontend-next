import styles from './skeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const CardsSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={`skeleton-${index}`} className={styles.skeleton} />
      ))}
    </div>
  );
};

export default CardsSkeleton;
