import React, { useCallback } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import CarouselView from './CarouselView';
import MonthCard from './MonthCard';
import styles from './MyProgress.module.scss';
import { ProcessedWeek } from './types';
import useMonthsData from './useMonthsData';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import useGetUserQuranProgramEnrollment from '@/hooks/auth/useGetUserQuranProgramEnrollment';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

interface MyProgressProps {
  onWeekSelect: (weekNumber: number) => void;
}

const MyProgress: React.FC<MyProgressProps> = ({ onWeekSelect }) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const router = useRouter();

  // Get month data for the carousel
  const { monthRows, monthSlides } = useMonthsData();

  // Get user enrollment data to check completed weeks
  const { subscriptionData, isLoading: isSubscriptionLoading } = useGetUserQuranProgramEnrollment({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
  });

  // Function to determine the CSS class for a week
  const getWeekClass = useCallback(
    (week: ProcessedWeek) => {
      const isLoggedInAndSubscribed = isLoggedIn() && !isSubscriptionLoading;
      return classNames(styles.weekItem, {
        [styles.weekItemPassed]: isLoggedInAndSubscribed && week.hasPassed && !week.isCompleted,
        [styles.weekItemActive]: isLoggedInAndSubscribed && week.isActive,
        [styles.weekItemCompleted]: isLoggedInAndSubscribed && week.isCompleted,
      });
    },
    [isSubscriptionLoading],
  );

  const onTrackingButtonClick = useCallback(() => {
    logButtonClick('quranic_calendar_start_tracking');
    router.replace(getLoginNavigationUrl(getQuranicCalendarNavigationUrl()));
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{t('my-progress')}</h2>

        {isLoggedIn() ? (
          <p className={styles.completedWeeks}>
            {t('completed-weeks', {
              completedWeeks: toLocalizedNumber(
                subscriptionData?.completedWeeks?.length || 0,
                lang,
              ),
              totalWeeks: toLocalizedNumber(subscriptionData?.totalWeeks || 46, lang),
            })}
          </p>
        ) : (
          <Button
            onClick={onTrackingButtonClick}
            variant={ButtonVariant.Compact}
            className={styles.trackingButton}
          >
            {t('start-tracking')}
          </Button>
        )}
      </div>

      <p className={styles.subtitle}>{t('progress-subtitle')}</p>

      <div className={styles.progressCard}>
        {isMobile() ? (
          <CarouselView
            monthSlides={monthSlides}
            getWeekClass={getWeekClass}
            isProgramCompleted={subscriptionData?.isCompleted}
            onWeekSelect={onWeekSelect}
          />
        ) : (
          <>
            {monthRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex + 1}`} className={styles.monthsRow}>
                {row.map((month) => (
                  <MonthCard
                    key={`month-${month.id}`}
                    month={month}
                    getWeekClass={getWeekClass}
                    isProgramCompleted={subscriptionData?.isCompleted}
                    onWeekSelect={onWeekSelect}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MyProgress;
