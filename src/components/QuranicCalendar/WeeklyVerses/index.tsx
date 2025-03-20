import React, { useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ActionButtons from './ActionButtons';
import HelpModal from './HelpModal';
import ReflectionPrompts from './ReflectionPrompts';
import VerseRangeDisplay from './VerseRangeDisplay';
import styles from './WeeklyVerses.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetUserQuranProgramEnrollment from '@/hooks/auth/useGetUserQuranProgramEnrollment';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import QuranProgramWeekResponse from '@/types/auth/QuranProgramWeekResponse';
import { updateActivityDay } from '@/utils/auth/api';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { isLoggedIn } from '@/utils/auth/login';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import { parseVerseRange } from '@/utils/verseKeys';
import DataContext from 'src/contexts/DataContext';

type Props = {
  weekNumber: number;
  weekRanges: string;
  isLoading?: boolean;
  weekData?: QuranProgramWeekResponse;
};

const WeeklyVerses: React.FC<Props> = ({ weekNumber, weekRanges, isLoading, weekData }) => {
  const { t } = useTranslation('quranic-calendar');
  const chaptersData = useContext(DataContext);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isMarkingAsCompleted, setIsMarkingAsCompleted] = useState(false);

  const {
    subscriptionData,
    isLoading: isSubscriptionLoading,
    mutate,
  } = useGetUserQuranProgramEnrollment({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
  });

  const toast = useToast();
  const router = useRouter();

  const [
    { chapter: fromChapter, verse: fromVerse, verseKey: rangeFrom },
    { chapter: toChapter, verse: toVerse, verseKey: rangeTo },
  ] = parseVerseRange(weekRanges, true);

  // Get chapter names
  const fromChapterName =
    getChapterData(chaptersData, fromChapter.toString())?.transliteratedName || '';
  const toChapterName =
    getChapterData(chaptersData, toChapter.toString())?.transliteratedName || '';

  const isCompleted = subscriptionData?.completedWeeks?.includes(weekNumber);

  const onMarkAsCompletedClick = async () => {
    logButtonClick('quran_calendar_pdf_completed', { weekNumber, weekRanges });
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getQuranicCalendarNavigationUrl()));
    } else if (!isCompleted) {
      setIsMarkingAsCompleted(true);
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
        setIsMarkingAsCompleted(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('read-this-weeks-verses')}</h2>
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    );
  }

  const handleHelpClick = (e: React.MouseEvent) => {
    logButtonClick('open_help_modal', { weekNumber, weekRanges });
    e.preventDefault();
    e.stopPropagation();
    setIsHelpModalOpen(true);
  };

  return (
    <div>
      <h2 className={styles.title}>{t('read-this-weeks-verses')}</h2>
      <p className={styles.subtitle}>{t('verses-subtitle')}</p>

      <div className={styles.content}>
        <div className={styles.verseItem}>
          <div className={styles.verseHeader}>
            <div className={styles.verseRange}>
              <span className={styles.verseRangeText}>
                <VerseRangeDisplay
                  fromChapter={fromChapter}
                  fromChapterName={fromChapterName}
                  fromVerse={fromVerse}
                  rangeFrom={rangeFrom}
                  toChapter={toChapter}
                  toChapterName={toChapterName}
                  toVerse={toVerse}
                  rangeTo={rangeTo}
                />
              </span>
            </div>
          </div>
        </div>
        <ReflectionPrompts description={weekData?.description} />
        <ActionButtons
          onMarkAsCompletedClick={onMarkAsCompletedClick}
          isCompleted={isCompleted}
          shouldShowLoading={isSubscriptionLoading || isMarkingAsCompleted}
          pdfUrl={weekData?.pdfUrl}
          onHelpClick={handleHelpClick}
          ranges={weekRanges}
        />
      </div>
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};

export default WeeklyVerses;
