import styles from './SidebarSelectionSkeleton.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';

const ROWS_COUNT = 6;
const rowsArr = Array(ROWS_COUNT).fill(null);

const SidebarSelectionSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      {rowsArr.map((k, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={`skeleton_${i}`} isActive isSquared className={styles.row} />
      ))}
    </div>
  );
};

export default SidebarSelectionSkeleton;
