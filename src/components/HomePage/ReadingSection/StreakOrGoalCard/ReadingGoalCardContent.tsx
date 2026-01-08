import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import GoalStatus from './GoalStatus';
import styles from './ReadingGoalCardContent.module.scss';

import CircularProgressbar from '@/dls/CircularProgress';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
import ArrowIcon from '@/public/icons/arrow.svg';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { QuranGoalStatus } from '@/types/auth/Goal';
import { toLocalizedNumber } from '@/utils/locale';
import { getReadingGoalProgressNavigationUrl } from '@/utils/navigation';

export type ReadingGoalCardContentProps = {
  goal?: QuranGoalStatus | null;
  currentActivityDay?: CurrentQuranActivityDay;
  goalCta?: React.ReactNode;
  shouldShowArrow?: boolean;
  className?: string;
  classes?: {
    progressbar?: string;
    progressbarText?: string;
    statusContainer?: string;
  };
  onArrowClick?: () => void;
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
  shouldShowArrow,
  className,
  classes,
  onArrowClick,
}) => {
  const { lang } = useTranslation();

  return (
    <>
      {/* Goal Progress Section */}
      {goal ? (
        <div className={classNames(styles.goalProgressSection, className)}>
          <div
            className={classNames(styles.circularProgressbar, classes?.progressbar)}
            data-testid="goal-progress"
          >
            <CircularProgressbar
              text={`${toLocalizedNumber(goal.progress.percent, lang)}%`}
              value={goal.progress.percent}
              maxValue={100}
              strokeWidth={12}
              classes={{
                path: styles.circularProgressbarPath,
                trail: styles.circularProgressbarTrail,
                text: classNames(styles.circularProgressbarText, classes?.progressbarText),
              }}
            />
          </div>
          <div className={classNames(styles.goalStatusContainer, classes?.statusContainer)}>
            <GoalStatus
              goal={goal}
              currentActivityDay={currentActivityDay}
              percent={goal.progress.percent}
            />
          </div>
          {shouldShowArrow &&
            (onArrowClick ? (
              <Link href={getReadingGoalProgressNavigationUrl()} onClick={onArrowClick}>
                <IconContainer
                  size={IconSize.Xsmall}
                  icon={<ArrowIcon />}
                  shouldForceSetColors={false}
                  className={styles.goalArrowIcon}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.goalArrowIcon}
                aria-hidden="true"
              />
            ))}
        </div>
      ) : (
        goalCta && <div className={styles.goalCtaSection}>{goalCta}</div>
      )}
    </>
  );
};

export default ReadingGoalCardContent;
