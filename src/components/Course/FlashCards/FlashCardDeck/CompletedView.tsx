/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import styles from './FlashCardDeck.module.scss';

type CompletedViewProps = {
  knownCount: number;
  unknownCount: number;
  onRestart: () => void;
  className?: string;
};

const CompletedView: React.FC<CompletedViewProps> = ({
  knownCount,
  unknownCount,
  onRestart,
  className,
}) => (
  <div className={classNames(styles.container, className)}>
    <div className={styles.completedContainer}>
      <div className={styles.completedTitle}>All done!</div>
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{knownCount}</span>
          <span className={styles.statLabel}>Known</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{unknownCount}</span>
          <span className={styles.statLabel}>Review</span>
        </div>
      </div>
      <button type="button" className={styles.restartButton} onClick={onRestart}>
        Start Over
      </button>
    </div>
  </div>
);

export default CompletedView;
