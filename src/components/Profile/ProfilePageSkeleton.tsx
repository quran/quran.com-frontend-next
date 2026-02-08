import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import HeaderNavigation from '../HeaderNavigation';
import PageContainer from '../PageContainer';

import styles from './ProfilePageSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const ProfilePageSkeleton = () => {
  const { t } = useTranslation('profile');
  return (
    <>
      <HeaderNavigation title={t('my-profile')} />
      <PageContainer isSheetsLike className={styles.pageContainerSkeleton}>
        <div className={styles.skeletonSection}>
          <Skeleton className={styles.headerSkeleton} />
          <div className={styles.profileSkeletonContainer}>
            <Skeleton className={styles.profilePictureSkeleton} isRounded />
            <Skeleton className={styles.ctaSkeleton} />
          </div>
        </div>
        <div className={styles.skeletonSection}>
          <Skeleton className={styles.headerSkeleton} />
          <div className={styles.editDetailsSkeleton}>
            <Skeleton className={styles.inputSkeleton} />
            <Skeleton className={styles.inputSkeleton} />
            <Skeleton className={styles.inputSkeleton} />
            <Skeleton className={styles.inputSkeleton} />
          </div>
          <Skeleton className={styles.ctaSkeleton} />
        </div>
        <div className={classNames(styles.skeletonSection, styles.changePasswordSkeleton)}>
          <Skeleton className={styles.headerSkeleton} />
          <Skeleton className={styles.inputSkeleton} />
          <Skeleton className={styles.inputSkeleton} />
          <Skeleton className={styles.inputSkeleton} />
          <Skeleton className={styles.ctaSkeleton} />
        </div>
        <div className={styles.skeletonSection}>
          <Skeleton className={styles.headerSkeleton} />
          <Skeleton className={styles.checkboxSkeleton} />
          <Skeleton className={styles.checkboxSkeleton} />
          <Skeleton className={styles.checkboxSkeleton} />
          <Skeleton className={styles.checkboxSkeleton} />
          <Skeleton className={styles.ctaSkeleton} />
        </div>
        <div className={styles.skeletonSection}>
          <Skeleton className={styles.disclaimerSkeleton} />
          <Skeleton className={styles.ctaSkeleton} />
        </div>
      </PageContainer>
    </>
  );
};

export default ProfilePageSkeleton;
