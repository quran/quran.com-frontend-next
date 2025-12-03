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
          <div className={styles.thumbnailWrapper}>
            <Skeleton className={styles.thumbnailSkeleton} isSquared />
          </div>
        </Card>
      </div>
    ))}
  </div>
);

export default Loading;
