import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import ReadingGoalCardContent from './ReadingGoalCardContent';
import styles from './StreakOrGoalCard.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
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

  const streakLink = goal ? getReadingGoalProgressNavigationUrl() : getReadingGoalNavigationUrl();

  return (
    <div className={styles.streakCard}>
      <Link href={streakLink} onClick={onStreakCardClicked}>
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
          {!goal && (
            <IconContainer
              size={IconSize.Xsmall}
              icon={<ArrowIcon />}
              shouldForceSetColors={false}
            />
          )}
        </div>
      </Link>
      <div className={styles.container}>
        <ReadingGoalCardContent
          goal={goal}
          currentActivityDay={currentActivityDay}
          goalCta={
            <Button
              href={getReadingGoalNavigationUrl()}
              size={ButtonSize.Small}
              className={styles.customGoalButton}
              variant={ButtonVariant.Simplified}
              prefix={<CirclesIcon />}
              onClick={onSetGoalButtonClicked}
            >
              {t('set-custom-goal')}
            </Button>
          }
          shouldShowArrow={!!goal}
          className={styles.circularProgressbarContainer}
          classes={{
            progressbar: styles.circularProgressbar,
            progressbarText: styles.circularProgressbarText,
          }}
          onArrowClick={onGoalArrowClicked}
        />
      </div>
    </div>
  );
};

export default StreakOrGoalCard;
