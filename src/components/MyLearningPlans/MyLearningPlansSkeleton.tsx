import styles from './MyLearningPlansSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const MyLearningPlansSkeleton = () => {
  return (
    <div className={styles.containerSkeleton}>
      <div className={styles.titleContainerSkeleton}>
        <Skeleton className={styles.titleSkeleton} />
      </div>
      <div className={styles.contentSkeleton}>
        <Skeleton className={styles.cardsSkeletonContainer} />
        <Skeleton className={styles.cardsSkeletonContainer} />
        <Skeleton className={styles.cardsSkeletonContainer} />
      </div>
    </div>
  );
};

export default MyLearningPlansSkeleton;
