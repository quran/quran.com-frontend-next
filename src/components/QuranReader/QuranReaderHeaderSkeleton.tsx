import classNames from 'classnames';

import Skeleton from '../dls/Skeleton/Skeleton';

import styles from './QuranReaderHeaderSkeleton.module.scss';

export enum SkeletonMode {
  Minimal = 'minimal',
  Full = 'full',
}

type Props = { isFirstVerse: boolean; mode: SkeletonMode; isReadingPreference: boolean };

const QuranReaderHeaderSkeleton = ({
  isFirstVerse,
  mode = SkeletonMode.Full,
  isReadingPreference,
}: Props) => {
  return (
    <span className={styles.skeletonContainer}>
      <Skeleton isActive isSquared className={styles.contextMenu} />
      {mode === SkeletonMode.Full && (
        <Skeleton isActive isSquared className={styles.readingSwitch} />
      )}
      {isFirstVerse && mode === SkeletonMode.Full && (
        <>
          <div
            className={classNames(styles.chapterHeaderContainer, {
              [styles.miniChapterHeaderContainer]: isReadingPreference,
            })}
          >
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
        </>
      )}
    </span>
  );
};

export default QuranReaderHeaderSkeleton;
