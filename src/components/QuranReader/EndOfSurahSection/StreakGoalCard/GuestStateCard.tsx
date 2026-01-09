import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './StreakGoalCard.module.scss';
import getFormattedSubtitle from './utils';

import Card from '@/components/HomePage/Card';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import useIsMobile from '@/hooks/useIsMobile';
import CirclesIcon from '@/public/icons/circles.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';

interface GuestStateCardProps {
  cardClassName?: string;
}

const GuestStateCard: React.FC<GuestStateCardProps> = ({ cardClassName }) => {
  const { t } = useTranslation('quran-reader');
  const isMobile = useIsMobile();

  const onSetGoalButtonClicked = () => {
    logButtonClick('end_of_surah_goal_card_set_goal');
  };

  return (
    <Card
      className={classNames(styles.endOfSurahCard, styles.guestState, cardClassName)}
      data-testid="streak-goal-card"
    >
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <CirclesIcon className={styles.titleIcon} />
          <h3 className={styles.title}>
            {isMobile
              ? t('end-of-surah.track-your-journey')
              : t('end-of-surah.achieve-quran-goals-responsive')}
          </h3>
        </div>
        {!isMobile && (
          <p className={styles.subtitle}>
            {getFormattedSubtitle(t('end-of-surah.achieve-quran-goals-desktop'))}
          </p>
        )}
        <Button
          type={ButtonType.Success}
          size={isMobile ? ButtonSize.Small : ButtonSize.Medium}
          href={getReadingGoalNavigationUrl()}
          className={styles.button}
          onClick={onSetGoalButtonClicked}
        >
          <CirclesIcon className={styles.buttonIcon} />
          {isMobile ? t('end-of-surah.set-goal-mobile') : t('end-of-surah.set-custom-goal')}
        </Button>
      </div>
    </Card>
  );
};

export default GuestStateCard;
