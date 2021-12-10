import Skeleton from '../dls/Skeleton/Skeleton';

import styles from './TranslationViewSkeleton.module.scss';

type Props = {
  translationsCount?: number;
};

const TranslationViewSkeleton = ({ translationsCount = 2 }: Props) => {
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
        {Array(translationsCount)
          .fill(null)
          .map((k, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`skeleton_${i}`}>
              <Skeleton isActive isSquared className={styles.translationItem} />
              <Skeleton isActive isSquared className={styles.subTranslationItem} />
            </span>
          ))}
      </div>
    </span>
  );
};

export default TranslationViewSkeleton;
