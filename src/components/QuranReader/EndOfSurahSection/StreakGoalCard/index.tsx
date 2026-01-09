import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

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
  const hasGoalOrStreak = !!goal || displayStreak > 0;

  const onGoalArrowClicked = () => {
    logButtonClick('end_of_surah_goal_card_arrow');
  };

  const onSetGoalButtonClicked = () => {
    logButtonClick('end_of_surah_goal_card_set_goal');
  };

  // Helper function to split subtitle text intelligently for line break
  const getFormattedSubtitle = (text: string) => {
    // Find the last comma in the text
    const lastCommaIndex = text.lastIndexOf(',');

    if (lastCommaIndex === -1) {
      // No comma found, return text as is
      return text;
    }

    // Split at the last comma
    const firstPart = text.substring(0, lastCommaIndex + 1); // Include the comma
    const secondPart = text.substring(lastCommaIndex + 1).trim();

    return (
      <>
        {firstPart}
        <br />
        {secondPart}
      </>
    );
  };

  if (!hasGoalOrStreak) {
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
  }

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
