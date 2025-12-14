import { FC } from 'react';

import styles from './EmailNotificationSettingsSkeleton.module.scss';
import Section from './Section';

import Skeleton from '@/dls/Skeleton/Skeleton';

const EmailNotificationSettingsSkeleton: FC = () => {
  return (
    <Section title="">
      <div className={styles.skeletonContainer}>
        {[1, 2].map((index) => (
          <div key={index} className={styles.notificationRow}>
            <Skeleton isActive isSquared className={styles.checkbox} />
            <div className={styles.textContainer}>
              <Skeleton isActive isSquared className={styles.title} />
              <Skeleton isActive isSquared className={styles.description} />
            </div>
          </div>
        ))}
        <div className={styles.buttonContainer}>
          <Skeleton isActive isSquared className={styles.button} />
        </div>
      </div>
    </Section>
  );
};

export default EmailNotificationSettingsSkeleton;
