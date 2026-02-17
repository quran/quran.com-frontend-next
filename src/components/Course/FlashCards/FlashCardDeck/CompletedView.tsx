import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

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
}) => {
  const { t } = useTranslation('learn');

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.completedContainer}>
        <div className={styles.completedTitle}>
          {t('flashcards.all-done', undefined, { default: 'All done!' })}
        </div>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{knownCount}</span>
            <span className={styles.statLabel}>
              {t('flashcards.known', undefined, { default: 'Known' })}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{unknownCount}</span>
            <span className={styles.statLabel}>
              {t('flashcards.review', undefined, { default: 'Review' })}
            </span>
          </div>
        </div>
        <button type="button" className={styles.restartButton} onClick={onRestart}>
          {t('flashcards.start-over', undefined, { default: 'Start Over' })}
        </button>
      </div>
    </div>
  );
};

export default CompletedView;
