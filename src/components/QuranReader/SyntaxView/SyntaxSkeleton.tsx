import range from 'lodash/range';

import styles from './SyntaxSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

/**
 * Loading placeholder for Syntax view content (Study Mode dynamic import).
 * @returns {React.ReactElement} Skeleton lines for Syntax tab loading state.
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
