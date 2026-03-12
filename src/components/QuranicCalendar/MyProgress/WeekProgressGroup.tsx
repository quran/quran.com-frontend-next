import React, { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyProgress.module.scss';
import { getLocalizedWeekRangeLabel } from './weekProgressConstants';
import WeekProgressRow from './WeekProgressRow';
import { WeekGroupWithMonths } from './weekProgressTypes';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logButtonClick } from '@/utils/eventLogger';

type WeekProgressGroupProps = {
  group: WeekGroupWithMonths;
  isOpen: boolean;
  currentWeek: number;
  activeWeek: number;
  completedWeeksSet: Set<number>;
  isLoggedInAndReady: boolean;
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onWeekClick: (weekNumber: number) => void;
};

const WeekProgressGroup: React.FC<WeekProgressGroupProps> = ({
  group,
  isOpen,
  currentWeek,
  activeWeek,
  completedWeeksSet,
  isLoggedInAndReady,
  setOpenGroups,
  onWeekClick,
}) => {
  const { t, lang } = useTranslation('quranic-calendar');

  const onToggle = useCallback(() => {
    logButtonClick('quranic_calendar_progress_group');
    setOpenGroups((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
  }, [group.key, setOpenGroups]);

  const localizedGroupTitle = getLocalizedWeekRangeLabel(
    group.startWeek,
    group.endWeek,
    lang,
    t('week'),
  );

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: localizedGroupTitle }} />
        <ChevronDownIcon
          className={classNames(styles.groupChevron, {
            [styles.groupChevronExpanded]: isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className={styles.groupContent}>
          {group.months.map((month) => (
            <div key={`${group.key}-month-${month.monthNumber}`} className={styles.monthSection}>
              <h3 className={styles.monthTitle}>
                <span className={styles.monthName}>({month.monthName})</span>
              </h3>

              <div className={styles.weekList}>
                {month.weeks.map((week) => {
                  const isCompleted = completedWeeksSet.has(week.weekNumber);
                  const shouldShowPassedStyle =
                    week.weekNumber < currentWeek && !isCompleted && isLoggedInAndReady;

                  return (
                    <WeekProgressRow
                      key={`${group.key}-week-${week.weekNumber}`}
                      week={week}
                      activeWeek={activeWeek}
                      currentWeek={currentWeek}
                      lang={lang}
                      isCompleted={isCompleted}
                      shouldShowPassedStyle={shouldShowPassedStyle}
                      onWeekClick={onWeekClick}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeekProgressGroup;
