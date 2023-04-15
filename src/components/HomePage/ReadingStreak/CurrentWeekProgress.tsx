import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingStreak.module.scss';

import { ContentSide } from '@/dls/Popover';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import CheckIcon from '@/icons/check.svg';
import { toLocalizedNumber } from '@/utils/locale';
import { convertFractionToPercent } from '@/utils/number';

enum DayState {
  None = 'none',
  Stroked = 'stroked',
  Filled = 'filled',
  Checked = 'checked',
}

interface Props {
  weekData: ReturnType<typeof useGetStreakWithMetadata>['weekData'];
  readingGoal?: ReturnType<typeof useGetStreakWithMetadata>['readingGoal'];
  fixedWidth?: boolean;
}

const CurrentWeekProgress: React.FC<Props> = ({ weekData, readingGoal, fixedWidth = true }) => {
  const { lang } = useTranslation();
  const { days, readingDaysMap } = weekData;

  const getDayState = (day: typeof days[number]): DayState => {
    const readingDay = readingDaysMap[day.date];
    const hasRead = readingDay?.hasRead;

    // if the user has a goal, we want to show a checked circle if the user has completed his goal for the day
    // otherwise, we want to show a filled circle if the user has read at all for the day
    const isGoalDone = readingGoal
      ? convertFractionToPercent(readingDay?.progress || 0) >= 100
      : hasRead;

    if (isGoalDone) return DayState.Checked;
    if (hasRead) return DayState.Filled;

    return day.current ? DayState.Stroked : DayState.None;
  };

  return (
    <div
      className={classNames(styles.week, {
        [styles.fixedWidth]: fixedWidth,
      })}
    >
      {days.map((day, idx) => {
        const dayState = getDayState(day);
        const localizedDayNumber = toLocalizedNumber(idx + 1, lang);

        return (
          <div key={day.name} className={styles.day}>
            <HoverablePopover
              content={new Date(day.date).toLocaleDateString(lang, {
                day: 'numeric',
                month: 'long',
                weekday: 'long',
              })}
              contentSide={ContentSide.TOP}
            >
              <span className={styles.fullName}>{day.name}</span>
              <span className={styles.shortName}>{localizedDayNumber}</span>
            </HoverablePopover>

            <div className={styles.circleContainer}>
              <div
                className={classNames(styles.dayCircle, {
                  [styles.filled]: dayState === DayState.Filled || dayState === DayState.Checked,
                  [styles.stroked]: dayState === DayState.Stroked,
                })}
              >
                {dayState === DayState.Checked ? <CheckIcon /> : null}
              </div>
              <div className={styles.dayDivider} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CurrentWeekProgress;
