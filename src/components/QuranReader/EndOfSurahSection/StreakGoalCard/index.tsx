import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import GuestStateCard from './GuestStateCard';
import styles from './StreakGoalCard.module.scss';

import Card from '@/components/HomePage/Card';
import ReadingGoalCardContent from '@/components/HomePage/ReadingSection/StreakOrGoalCard/ReadingGoalCardContent';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
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

interface StreakGoalCardProps {
  cardClassName?: string;
}

const StreakGoalCard: React.FC<StreakGoalCardProps> = ({ cardClassName }) => {
  const { t, lang } = useTranslation('quran-reader');
  const { goal, streak, currentActivityDay } = useGetStreakWithMetadata({ showDayName: true });
  const isMobile = useIsMobile();
  const displayStreak = streak > 0 ? streak : 0;

  if (!goal && displayStreak === 0) {
    return <GuestStateCard cardClassName={cardClassName} />;
  }

  const onGoalArrowClicked = () => logButtonClick('end_of_surah_goal_card_arrow');
  const onSetGoalButtonClicked = () => logButtonClick('end_of_surah_goal_card_set_goal');
  const streakLabel =
    displayStreak === 1 ? t('end-of-surah.day-streak') : t('end-of-surah.days-streak');

  const goalCta = (
    <Button
      type={ButtonType.Success}
      size={ButtonSize.Medium}
      href={getReadingGoalNavigationUrl()}
      className={styles.button}
      onClick={onSetGoalButtonClicked}
    >
      <CirclesIcon className={styles.buttonIcon} />
      {isMobile ? t('end-of-surah.set-goal') : t('end-of-surah.set-custom-goal')}
    </Button>
  );

  return (
    <Card
      className={classNames(styles.endOfSurahCard, styles.withGoalBackground, cardClassName)}
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
          {!goal && (
            <Link
              href={getReadingGoalNavigationUrl()}
              onClick={onSetGoalButtonClicked}
              className={styles.streakArrowLink}
            >
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.streakArrowIcon}
                aria-hidden="true"
              />
            </Link>
          )}
        </div>

        {/* Goal Progress Section */}
        {goal ? (
          <Link
            href={getReadingGoalProgressNavigationUrl()}
            onClick={onGoalArrowClicked}
            className={styles.goalLink}
          >
            <ReadingGoalCardContent
              goal={goal}
              currentActivityDay={currentActivityDay}
              goalCta={goalCta}
              shouldShowArrow
              className={styles.endOfSurahGoalContent}
              classes={{
                progressbar: styles.customProgressbar,
                progressbarText: styles.customProgressbarText,
                statusContainer: styles.customStatusContainer,
              }}
              shouldShowOnlyLargestTimeUnit={isMobile}
            />
          </Link>
        ) : (
          <ReadingGoalCardContent
            goal={goal}
            currentActivityDay={currentActivityDay}
            goalCta={goalCta}
            className={styles.endOfSurahGoalContent}
            classes={{
              progressbar: styles.customProgressbar,
              progressbarText: styles.customProgressbarText,
              statusContainer: styles.customStatusContainer,
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default StreakGoalCard;
