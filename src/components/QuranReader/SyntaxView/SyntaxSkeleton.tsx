import range from 'lodash/range';

import Skeleton from '@/dls/Skeleton/Skeleton';

import styles from './SyntaxSkeleton.module.scss';

/**
 * Loading placeholder for Syntax view content (Study Mode dynamic import).
 */
const SyntaxSkeleton = () => {
  return (
    <>
      <Skeleton className={styles.syntaxSkeletonItem} />
      {range(1, 12).map((i) => (
        <Skeleton key={i} className={styles.syntaxSkeletonLine} />
      ))}
    </>
  );
};

export default SyntaxSkeleton;
