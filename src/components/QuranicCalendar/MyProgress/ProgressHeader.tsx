import React from 'react';

import styles from './MyProgress.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';

type ProgressHeaderProps = {
  title: string;
  isLoggedIn: boolean;
  completedWeeksText: string;
  startTrackingLabel: string;
  onStartTrackingClick: () => void;
};

const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  title,
  isLoggedIn,
  completedWeeksText,
  startTrackingLabel,
  onStartTrackingClick,
}) => {
  return (
    <div className={styles.headerRow}>
      <h2 className={styles.title}>{title}</h2>

      {isLoggedIn ? (
        <p className={styles.completedWeeks}>{completedWeeksText}</p>
      ) : (
        <Button
          onClick={onStartTrackingClick}
          variant={ButtonVariant.Compact}
          className={styles.trackingButton}
        >
          {startTrackingLabel}
        </Button>
      )}
    </div>
  );
};

export default ProgressHeader;
