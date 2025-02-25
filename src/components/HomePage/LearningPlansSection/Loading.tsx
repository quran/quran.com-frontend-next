import React from 'react';

import styles from './LearningPlansSection.module.scss';

import Skeleton from '@/components/dls/Skeleton/Skeleton';
import Card from '@/components/HomePage/Card';

const Loading = () => (
  <div className={styles.cardsContainer}>
    {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className={styles.learnPlanCard}>
        <Card className={styles.card}>
          <div className={styles.cardWrapper}>
            <Skeleton className={`${styles.thumbnail} ${styles.thumbnailSkeleton}`} isSquared />

            <div className={styles.cardContent}>
              <div className={styles.learningPlanTitle}>
                <Skeleton className={styles.titleSkeleton} isSquared />
              </div>

              <div className={`${styles.learningPlanStatus} ${styles.enrolledPlanStatus}`}>
                {/* Add a small pill skeleton to match enrolled/completed state */}
                <Skeleton className={styles.pillSkeleton} isSquared />
                <Skeleton className={styles.buttonSkeleton} isSquared />
              </div>
            </div>
          </div>
        </Card>
      </div>
    ))}
  </div>
);

export default Loading;
