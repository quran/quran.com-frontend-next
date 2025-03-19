import React, { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyProgress.module.scss';
import { MonthData, ProcessedWeek } from './types';

import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetUserQuranProgramEnrollment from '@/hooks/auth/useGetUserQuranProgramEnrollment';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import { updateActivityDay } from '@/utils/auth/api';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';

interface MonthCardProps {
  month: MonthData;
  getWeekClass: (week: ProcessedWeek) => string;
  isProgramCompleted: boolean;
}

const MonthCard: React.FC<MonthCardProps> = ({ month, getWeekClass, isProgramCompleted }) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const toast = useToast();
  const router = useRouter();
  const [loadingWeeks, setLoadingWeeks] = useState<number[]>([]);

  const { mutate } = useGetUserQuranProgramEnrollment({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
  });

  const onMarkAsCompleted = async (week: ProcessedWeek) => {
    const weekNumber = week.globalWeekNumber;
    logButtonClick('quran_calendar_week_completed', {
      weekNumber,
    });

    // Skip if already completed or is already being loaded
    if (week.isCompleted || loadingWeeks.includes(weekNumber)) {
      return;
    }

    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getQuranicCalendarNavigationUrl()));
      return;
    }

    // Add weekNumber to loadingWeeks
    setLoadingWeeks((prev) => [...prev, weekNumber]);

    try {
      await updateActivityDay({
        type: ActivityDayType.QURAN_READING_PROGRAM,
        programId: QURANIC_CALENDAR_PROGRAM_ID,
        weekNumber,
      });
      await mutate(); // Revalidate the subscription data
      toast(t('marked-as-completed'), { status: ToastStatus.Success });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      // Remove weekNumber from loadingWeeks
      setLoadingWeeks((prev) => prev.filter((id) => id !== weekNumber));
    }
  };

  return (
    <div key={`month-${month.id}`} className={styles.monthCard}>
      <h3
        className={classNames(styles.monthTitle, {
          [styles.currentMonthTitle]: month.isCurrentMonth,
        })}
      >
        {month.name}
      </h3>
      {month.isRamadan ? (
        <>
          <div className={styles.weekLabel}>{t('end-of-calendar')}</div>
          <div
            className={classNames(styles.completeLabel, {
              [styles.completeLabelCompleted]: isProgramCompleted,
            })}
          >
            {!isProgramCompleted ? t('complete') : `🎉 ${t('complete')}`}
          </div>
        </>
      ) : (
        <>
          <div className={styles.weekLabel}>{t('week')}</div>
          <div className={styles.weeksRow}>
            {month.weeks.map((week) => {
              const isLoading = loadingWeeks.includes(week.globalWeekNumber);
              const { isCompleted } = week;
              const weekClass = getWeekClass(week);

              return (
                <div
                  key={`week-${month.id}-${week.localWeekNumber}`}
                  className={classNames(weekClass, {
                    [styles.disabled]: isCompleted,
                  })}
                  role="button"
                  tabIndex={isCompleted ? -1 : 0}
                  aria-label={`${t('week')} ${week.localWeekNumber} of ${month.name}${
                    isCompleted ? ` - ${t('completed')}` : ''
                  }`}
                  data-week-number={week.globalWeekNumber}
                  title={week.data.ranges}
                  onClick={() => !isCompleted && onMarkAsCompleted(week)}
                  onKeyDown={(e) => {
                    if (!isCompleted && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onMarkAsCompleted(week);
                    }
                  }}
                >
                  {isLoading ? (
                    <Spinner size={SpinnerSize.Small} isCentered={false} />
                  ) : (
                    toLocalizedNumber(week.localWeekNumber, lang)
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthCard;
