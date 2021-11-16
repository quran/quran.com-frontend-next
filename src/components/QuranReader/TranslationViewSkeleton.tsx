import Skeleton from '../dls/Skeleton/Skeleton';

import styles from './TranslationViewSkeleton.module.scss';

type Props = {
  verseCount?: number;
};

const TranslationViewSkeleton = ({ verseCount = 2 }: Props) => {
  return (
    <span className={styles.skeletonContainer}>
      <div className={styles.actionsRow}>
        <Skeleton isActive isSquared className={styles.countActionItem} />
        <Skeleton isActive isSquared className={styles.anotherActionItem} />
        <Skeleton isActive isSquared className={styles.anotherActionItem} />
      </div>
      <div className={styles.verseRow}>
        <Skeleton isActive isSquared className={styles.verseItem} />
      </div>
      <div className={styles.translationRows}>
        {Array(verseCount)
          .fill(null)
          .map((k, i) => (
            <>
              <Skeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`skeleton_${i}`}
                isActive
                isSquared
                className={styles.translationItem}
              />
              <Skeleton isActive isSquared className={styles.subTranslationItem} />
            </>
          ))}
      </div>
    </span>
  );
};

export default TranslationViewSkeleton;
