import Skeleton from '../dls/Skeleton/Skeleton';

import styles from './ChapterAndJuzListSkeleton.module.scss';

const CHAPTERS_COUNT = 114;
const chaptersArr = Array(CHAPTERS_COUNT).fill(null);

const ChapterAndJuzListSkeleton = () => {
  return (
    <span className={styles.skeletonContainer}>
      <div className={styles.tabSkeleton}>
        <Skeleton isActive isSquared className={styles.firstTabSkeleton} />
        <Skeleton isActive isSquared className={styles.secondTabSkeleton} />
      </div>
      {chaptersArr.map((k, i) => (
        <Skeleton
          // eslint-disable-next-line react/no-array-index-key
          key={`skeleton_${i}`}
          isActive
          isSquared
          className={styles.skeletonItem}
        />
      ))}
    </span>
  );
};

export default ChapterAndJuzListSkeleton;
