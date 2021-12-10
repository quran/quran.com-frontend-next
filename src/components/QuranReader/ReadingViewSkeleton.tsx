import Skeleton from '../dls/Skeleton/Skeleton';

import styles from './ReadingViewSkeleton.module.scss';

const VERSE_ROW_COUNT = 3;
const rowsArr = Array(VERSE_ROW_COUNT).fill(null);

type Props = {
  fontSize: number;
};

const ReadingViewSkeleton = ({ fontSize }: Props) => {
  const estimatedWidth = (fontSize + 1) * 140;
  return (
    <span className={styles.skeletonContainer} style={{ width: estimatedWidth }}>
      {rowsArr.map((k, i) => (
        <Skeleton
          // eslint-disable-next-line react/no-array-index-key
          key={`skeleton_${i}`}
          isActive
          isSquared
          className={styles.verseRow}
        />
      ))}
    </span>
  );
};

export default ReadingViewSkeleton;
