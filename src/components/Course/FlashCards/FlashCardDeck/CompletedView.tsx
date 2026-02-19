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
        <div className={styles.completedTitle}>{t('flashcards.all-done')}</div>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{knownCount}</span>
            <span className={styles.statLabel}>{t('flashcards.known')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{unknownCount}</span>
            <span className={styles.statLabel}>{t('flashcards.review')}</span>
          </div>
        </div>
        <button type="button" className={styles.restartButton} onClick={onRestart}>
          {t('flashcards.start-over')}
        </button>
      </div>
    </div>
  );
};

export default CompletedView;
