import Skeleton from '../dls/Skeleton/Skeleton';

import styles from './QuranReaderHeaderSkeleton.module.scss';

const QuranReaderHeaderSkeleton = () => {
  return (
    <span className={styles.skeletonContainer}>
      <Skeleton isActive isSquared className={styles.contextMenu} />
      <Skeleton isActive isSquared className={styles.readingSwitch} />
      <div className={styles.chapterHeaderContainer}>
        <div className={styles.surahNameEnContainer}>
          <Skeleton isActive isSquared className={styles.surahNameEnSmall} />
          <Skeleton isActive isSquared className={styles.surahNameEn} />
          <Skeleton isActive isSquared className={styles.surahInfo} />
        </div>
        <div className={styles.surahNameArContainer}>
          <Skeleton isActive isSquared className={styles.surahNnumber} />
          <Skeleton isActive isSquared className={styles.surahNameAr} />
          <Skeleton isActive isSquared className={styles.surahAction} />
        </div>
      </div>
      <Skeleton isActive isSquared className={styles.bismillah} />
    </span>
  );
};

export default QuranReaderHeaderSkeleton;
