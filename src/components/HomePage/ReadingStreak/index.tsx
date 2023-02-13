/* eslint-disable react/no-multi-comp */
import { useMemo } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from './CurrentWeekProgress';
import DeleteReadingGoalButton from './DeleteReadingGoalButton';
import ReadingGoalModal from './ReadingGoalModal';
import styles from './ReadingStreak.module.scss';

import VerseLink from '@/components/Verse/VerseLink';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useCurrentUser from '@/hooks/auth/useCurrentUser';
import useGetReadingGoalProgress from '@/hooks/auth/useGetReadingGoalProgress';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';
import { secondsFormatter } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

const ReadingStreak = () => {
  const { user, isLoading, error } = useCurrentUser();
  const { t, lang } = useTranslation();
  const { readingGoalProgress } = useGetReadingGoalProgress();

  const localizedStreak = useMemo(() => {
    return toLocalizedNumber(user?.streak || 0, lang);
  }, [user, lang]);

  const streak = (
    <p className={styles.streakNumber}>
      {localizedStreak} {t('reading-goal:days')}
    </p>
  );

  const getAmountLeftMessage = () => {
    const { progress } = readingGoalProgress.data;
    if (!progress) return null;

    const goalType = readingGoalProgress.data.type;

    if (goalType === ReadingGoalType.PAGES || goalType === ReadingGoalType.RANGE) {
      return `${progress.amountLeft.toFixed(1)} ${t('common:pages')}`;
    }

    return secondsFormatter(progress.amountLeft, lang);
  };

  const getGoalStatus = () => {
    const { progress } = readingGoalProgress.data;
    if (!progress) return null;

    if (progress.percent < 100) {
      return (
        <div className={styles.goalContainer}>
          <Trans
            i18nKey="reading-goal:progress"
            components={{
              strong: <strong />,
            }}
            values={{
              percent: progress.percent,
            }}
          />{' '}
          {t('reciter:read')} {getAmountLeftMessage()}
          {progress.plan ? ` in ${progress.plan.daysLeft} ${t('reading-goal:days')}` : null}
          {progress.nextVerseToRead ? <VerseLink verseKey={progress.nextVerseToRead} /> : null}
        </div>
      );
    }

    return <div className={styles.goalContainer}>{t('reading-goal:complete-message')}</div>;
  };

  if (error || (!isLoading && !user?.id)) return null;

  return (
    <>
      <div className={styles.container}>
        <div>
          <p className={styles.streakTitle}>{t('reading-goal:streak')}</p>
          {isLoading ? <Skeleton>{streak}</Skeleton> : streak}
        </div>
        <CurrentWeekProgress
          isTodaysGoalDone={readingGoalProgress?.data?.progress?.percent >= 100}
        />
      </div>
      <div className={styles.goalContainer}>
        {!readingGoalProgress?.data ? <ReadingGoalModal /> : getGoalStatus()}
      </div>
      <div className={styles.goalContainer}>
        {readingGoalProgress?.data && <DeleteReadingGoalButton />}
      </div>
    </>
  );
};

export default ReadingStreak;
