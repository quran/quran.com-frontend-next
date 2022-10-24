import classNames from 'classnames';
import range from 'lodash/range';

import styles from './TafsirView.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const TafsirSkeleton = () => {
  return (
    <>
      <Skeleton className={(styles.tafsirSkeletonItem, styles.ayahSekletonItem)} />
      {range(1, 15).map((i) => (
        <Skeleton
          key={i}
          className={classNames(styles.tafsirSkeletonItem, {
            [styles.tafsirSkeletonItem1]: i % 1 === 0,
            [styles.tafsirSkeletonItem2]: i % 2 === 0,
            [styles.tafsirSkeletonItem3]: i % 3 === 0,
          })}
        />
      ))}
    </>
  );
};

export default TafsirSkeleton;
