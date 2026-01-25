import styles from './StudyModeModal.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const StudyModeSkeleton = () => (
  <div className={styles.skeletonContainer}>
    {/* Top Actions row: left side (verse key + play + bookmark), right side (copy + share + notes + more) */}
    <div className={styles.skeletonTopActions}>
      <div className={styles.skeletonLeftActions}>
        <Skeleton className={styles.skeletonVerseKey} />
        <Skeleton className={styles.skeletonActionIcon} />
        <Skeleton className={styles.skeletonActionIcon} />
      </div>
      <div className={styles.skeletonRightActions}>
        <Skeleton className={styles.skeletonActionIcon} />
        <Skeleton className={styles.skeletonActionIcon} />
        <Skeleton className={styles.skeletonActionIcon} />
        <Skeleton className={styles.skeletonActionIcon} />
      </div>
    </div>

    {/* Arabic text area - end aligned for RTL text */}
    <div className={styles.skeletonArabicArea}>
      <Skeleton className={styles.skeletonArabicLine} />
    </div>

    {/* Translation text area */}
    <div className={styles.skeletonTranslationArea}>
      <Skeleton className={styles.skeletonTranslationLine} />
      <Skeleton className={styles.skeletonTranslationLineShort} />
    </div>

    {/* Bottom tabs */}
    <div className={styles.skeletonBottomTabs}>
      <Skeleton className={styles.skeletonTab} />
      <Skeleton className={styles.skeletonTab} />
      <Skeleton className={styles.skeletonTab} />
    </div>
  </div>
);

export default StudyModeSkeleton;
