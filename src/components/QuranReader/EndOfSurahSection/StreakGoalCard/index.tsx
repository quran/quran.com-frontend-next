import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './StreakGoalCard.module.scss';

import Card from '@/components/HomePage/Card';
import GoalStatus from '@/components/HomePage/ReadingSection/StreakOrGoalCard/GoalStatus';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import useIsMobile from '@/hooks/useIsMobile';
import PlantIcon from '@/icons/plant.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import CirclesIcon from '@/public/icons/circles.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import {
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

const StreakGoalCard: React.FC = () => {
  const { t, lang } = useTranslation('quran-reader');
  const { goal, streak, currentActivityDay } = useGetStreakWithMetadata({ showDayName: true });
  const isMobile = useIsMobile();

  const displayStreak = streak > 0 ? streak : 0;
  const hasGoalOrStreak = !!goal || displayStreak > 0;

  const onGoalArrowClicked = () => {
    logButtonClick('end_of_surah_goal_card_arrow');
  };

  const onSetGoalButtonClicked = () => {
    logButtonClick('end_of_surah_goal_card_set_goal');
  };

  if (!hasGoalOrStreak) {
    return (
      <Card className={styles.endOfSurahCard} data-testid="streak-goal-card">
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
            <p className={styles.subtitle}>{t('end-of-surah.achieve-quran-goals-desktop')}</p>
          )}
          <Button
            type={ButtonType.Success}
            size={ButtonSize.Medium}
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
  }

  const streakLabel =
    displayStreak === 1 ? t('end-of-surah.day-streak') : t('end-of-surah.days-streak');

  return (
    <Card
      className={`${styles.endOfSurahCard} ${styles.withGoalBackground}`}
      data-testid="streak-goal-card"
    >
      <div className={styles.container}>
        {/* Streak Section */}
        <div className={styles.streakSection} data-testid="streak-display">
          <PlantIcon className={styles.streakIcon} />
          <div className={styles.streakDisplay}>
            <span className={styles.streakNumber} data-testid="streak-number">
              {toLocalizedNumber(displayStreak, lang)}
            </span>
            <span className={styles.streakText}>{streakLabel}</span>
          </div>
        </div>

        {/* Goal Progress Section */}
        {goal ? (
          <div className={styles.goalProgressSection}>
            <div className={styles.progressContainer}>
              <div className={styles.circularProgressbar} data-testid="goal-progress">
                <CircularProgressbar
                  text={`${toLocalizedNumber(goal.progress.percent, lang)}%`}
                  value={goal.progress.percent}
                  maxValue={100}
                  strokeWidth={12}
                  classes={{
                    path: styles.circularProgressbarPath,
                    trail: styles.circularProgressbarTrail,
                    text: styles.circularProgressbarText,
                  }}
                />
              </div>
              <div className={styles.goalStatusContainer}>
                <GoalStatus
                  goal={goal}
                  currentActivityDay={currentActivityDay}
                  percent={goal.progress.percent}
                />
              </div>
            </div>
            <Link href={getReadingGoalProgressNavigationUrl()} onClick={onGoalArrowClicked}>
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.goalArrowIcon}
              />
            </Link>
          </div>
        ) : (
          <div className={styles.noGoalSection}>
            <Button
              type={ButtonType.Success}
              size={ButtonSize.Medium}
              href={getReadingGoalNavigationUrl()}
              className={styles.button}
              onClick={onSetGoalButtonClicked}
            >
              <CirclesIcon className={styles.buttonIcon} />
              {t('end-of-surah.set-custom-goal')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StreakGoalCard;
