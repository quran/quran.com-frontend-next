import React from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import cardStyles from '../ReadingSection.module.scss';

import GoalStatus from './GoalStatus';
import styles from './StreakOrGoalCard.module.scss';

import Card from '@/components/HomePage/Card';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PlantIcon from '@/icons/plant.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import CirclesIcon from '@/public/icons/circles.svg';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { QuranGoalStatus } from '@/types/auth/Goal';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import {
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

type Props = {
  currentActivityDay: CurrentQuranActivityDay;
  goal?: QuranGoalStatus | null;
  streak: number;
};

const StreakOrGoalCard: React.FC<Props> = ({ goal, streak, currentActivityDay }) => {
  const { t, lang } = useTranslation('home');

  const onStreakCardClicked = () => {
    logButtonClick('homepage_reading_streak_card');
  };

  const onGoalArrowClicked = () => {
    logButtonClick('homepage_reading_goal_card_arrow');
  };

  const onSetGoalButtonClicked = () => {
    logButtonClick('homepage_reading_goal_card_set_goal');
  };

  return (
    <Card
      className={cardStyles.streakCard}
      link={goal ? getReadingGoalProgressNavigationUrl() : getReadingGoalNavigationUrl()}
      onClick={goal ? onGoalArrowClicked : onStreakCardClicked}
      shouldPrefetch={false}
    >
      <div className={cardStyles.cardOuterContainer}>
        <div className={classNames(cardStyles.streakCardLeft, cardStyles.cardWithIcon)}>
          <div className={styles.outerStreakCard}>
            <div className={styles.streakCard}>
              <div className={styles.streakCardLeft}>
                <PlantIcon />
                <Trans
                  components={{
                    p: <span className={styles.streak} />,
                    span: <span className={styles.streakDay} />,
                  }}
                  values={{
                    days: toLocalizedNumber(streak, lang),
                  }}
                  i18nKey="reading-goal:x-days-streak"
                />
              </div>

              <div className={styles.container}>
                {goal ? (
                  <div className={styles.circularProgressbarContainer}>
                    <div className={styles.circularProgressbar}>
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
                    <GoalStatus
                      goal={goal}
                      currentActivityDay={currentActivityDay}
                      percent={goal.progress.percent}
                    />
                    <IconContainer
                      size={IconSize.Xsmall}
                      icon={<ArrowIcon />}
                      shouldForceSetColors={false}
                      className={styles.goalArrowIcon}
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <Button
                    size={ButtonSize.Small}
                    className={styles.customGoalButton}
                    variant={ButtonVariant.Simplified}
                    prefix={<CirclesIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetGoalButtonClicked();
                    }}
                  >
                    {t('set-custom-goal')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StreakOrGoalCard;
