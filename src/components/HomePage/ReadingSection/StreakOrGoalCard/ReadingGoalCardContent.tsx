import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import GoalStatus from './GoalStatus';
import styles from './ReadingGoalCardContent.module.scss';

import CircularProgressbar from '@/dls/CircularProgress';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/public/icons/arrow.svg';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { QuranGoalStatus } from '@/types/auth/Goal';
import { toLocalizedNumber } from '@/utils/locale';

export type ReadingGoalCardContentProps = {
  goal?: QuranGoalStatus | null;
  currentActivityDay?: CurrentQuranActivityDay;
  goalCta?: React.ReactNode;
  onGoalArrowClick?: () => void;
  className?: string;
};

/**
 * Shared component for displaying goal progress and CTA.
 * This component is context-agnostic and only handles the goal section,
 * allowing parent components to handle streak display in their own way.
 * @returns {React.ReactElement} Goal progress section or CTA button
 */
const ReadingGoalCardContent: React.FC<ReadingGoalCardContentProps> = ({
  goal,
  currentActivityDay,
  goalCta,
  onGoalArrowClick,
  className,
}) => {
  const { lang } = useTranslation();

  return (
    <>
      {/* Goal Progress Section */}
      {goal ? (
        <div className={classNames(styles.goalProgressSection, className)}>
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
          {onGoalArrowClick && (
            <IconContainer
              size={IconSize.Xsmall}
              icon={<ArrowIcon />}
              shouldForceSetColors={false}
              className={styles.goalArrowIcon}
              aria-hidden="true"
            />
          )}
        </div>
      ) : (
        goalCta && <div className={styles.goalCtaSection}>{goalCta}</div>
      )}
    </>
  );
};

export default ReadingGoalCardContent;
