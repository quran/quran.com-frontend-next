/* eslint-disable @typescript-eslint/naming-convention */
import useTranslation from 'next-translate/useTranslation';

import HeaderNavigation from '../HeaderNavigation';
import PageContainer from '../PageContainer';

import styles from './ReadingGoalPageSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const ReadingGoalPageSkeleton = () => {
  const { t } = useTranslation('reading-progress');
  return (
    <>
      <HeaderNavigation title={t('reading-progress-header')} />
      <PageContainer isSheetsLike className={styles.pageContainerSkeleton}>
        <div className={styles.cardsSkeletonContainer}>
          <Skeleton className={styles.cardSkeleton} />
          <Skeleton className={styles.cardSkeleton} />
        </div>
        <div className={styles.calendarSkeleton}>
          {Array.from({ length: 12 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} className={styles.calendarSkeletonItem} />
          ))}
        </div>
      </PageContainer>
    </>
  );
};

export default ReadingGoalPageSkeleton;
