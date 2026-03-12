import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import umalqura from '@umalqura/core';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyProgress.module.scss';
import ProgressHeader from './ProgressHeader';
import useGroupedWeeks from './useGroupedWeeks';
import { WEEK_GROUPS } from './weekProgressConstants';
import WeekProgressGroup from './WeekProgressGroup';

import useGetUserQuranProgramEnrollment from '@/hooks/auth/useGetUserQuranProgramEnrollment';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getCurrentQuranicCalendarWeek } from '@/utils/hijri-date';
import { toLocalizedNumber } from '@/utils/locale';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import DataContext from 'src/contexts/DataContext';

interface MyProgressProps {
  selectedWeek: number;
  onWeekSelect: (weekNumber: number) => void;
}

const getInitialOpenGroups = (selectedWeek: number): Record<string, boolean> => {
  const initialOpenGroups: Record<string, boolean> = {};
  WEEK_GROUPS.forEach((group) => {
    initialOpenGroups[group.key] = selectedWeek >= group.startWeek && selectedWeek <= group.endWeek;
  });
  return initialOpenGroups;
};

const MyProgress: React.FC<MyProgressProps> = ({ selectedWeek, onWeekSelect }) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const currentWeek = getCurrentQuranicCalendarWeek(umalqura());

  const { subscriptionData, isLoading } = useGetUserQuranProgramEnrollment({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
  });

  const groupedWeeks = useGroupedWeeks({
    chaptersData,
    getIslamicMonthName: (month) => t(`islamic-months.${month}`),
  });

  const completedWeeksSet = useMemo(
    () => new Set(subscriptionData?.completedWeeks || []),
    [subscriptionData?.completedWeeks],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    getInitialOpenGroups(selectedWeek),
  );

  useEffect(() => {
    const selectedGroup = WEEK_GROUPS.find(
      (group) => selectedWeek >= group.startWeek && selectedWeek <= group.endWeek,
    );
    if (!selectedGroup) return;

    setOpenGroups((prev) =>
      prev[selectedGroup.key] ? prev : { ...prev, [selectedGroup.key]: true },
    );
  }, [selectedWeek]);

  const isLoggedInAndReady = isLoggedIn() && !isLoading;

  const onWeekClick = useCallback(
    (weekNumber: number) => {
      logButtonClick('quran_calendar_week_selected', { weekNumber });
      onWeekSelect(weekNumber);
      const weeklyVerse = document.getElementById('weekly-verses-section');
      if (weeklyVerse) weeklyVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [onWeekSelect],
  );

  const onTrackingButtonClick = useCallback(() => {
    logButtonClick('quranic_calendar_start_tracking');
    router.replace(getLoginNavigationUrl(getQuranicCalendarNavigationUrl()));
  }, [router]);

  const completedWeeksText = t('completed-weeks', {
    completedWeeks: toLocalizedNumber(subscriptionData?.completedWeeks?.length || 0, lang),
    totalWeeks: toLocalizedNumber(subscriptionData?.totalWeeks || 46, lang),
  });

  return (
    <div className={styles.container}>
      <ProgressHeader
        title={t('my-progress')}
        isLoggedIn={isLoggedIn()}
        completedWeeksText={completedWeeksText}
        startTrackingLabel={t('start-tracking')}
        onStartTrackingClick={onTrackingButtonClick}
      />

      <p className={styles.subtitle}>{t('progress-subtitle')}</p>

      <div className={styles.progressCard}>
        {groupedWeeks.map((group) => (
          <WeekProgressGroup
            key={group.key}
            group={group}
            isOpen={openGroups[group.key]}
            currentWeek={currentWeek}
            activeWeek={selectedWeek}
            completedWeeksSet={completedWeeksSet}
            isLoggedInAndReady={isLoggedInAndReady}
            setOpenGroups={setOpenGroups}
            onWeekClick={onWeekClick}
          />
        ))}
      </div>
    </div>
  );
};

export default MyProgress;
