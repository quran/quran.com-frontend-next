import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../../public/images/moon-illustration.svg';

import CurrentWeekProgress from './CurrentWeekProgress';
import useGetWeekDays from './hooks/useGetWeekDays';
import LoggedOutReadingStreak from './LoggedOutReadingStreak';
import styles from './ReadingStreak.module.scss';

import CreateReadingGoalModal from '@/components/ReadingGoal/CreateReadingGoalModal';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useCurrentUser from '@/hooks/auth/useCurrentUser';
import useGetReadingGoalProgress from '@/hooks/auth/useGetReadingGoalProgress';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';
import { secondsFormatter } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

const ReadingStreak = () => {
  const { user, isLoading, error } = useCurrentUser();
  const { t, lang } = useTranslation('reading-goal');
  const { readingGoalProgress } = useGetReadingGoalProgress();
  const weekData = useGetWeekDays();

  const localizedStreak = useMemo(() => {
    return toLocalizedNumber(user?.streak || 0, lang);
  }, [user, lang]);

  const hasUserReadToday = useMemo(() => {
    return weekData.readingDaysMap[weekData.weekDays.find((d) => d.current)?.date]?.hasRead;
  }, [weekData]);

  const streak = (
    <p
      className={classNames(
        styles.streakTitle,
        !hasUserReadToday && user?.streak > 0 && styles.streakTitleWarning,
      )}
    >
      {t('streak', { days: localizedStreak })}
      <HelperTooltip>{t('streak-definition')}</HelperTooltip>
    </p>
  );

  const getAmountLeftMessage = () => {
    const { progress } = readingGoalProgress.data;
    const goalType = readingGoalProgress.data.type;

    const prefix = progress.percent === 0 ? t('todays-goal') : t('remaining');

    let action = '';
    if (goalType === ReadingGoalType.TIME) {
      action = t('progress.time-goal', {
        time: secondsFormatter(progress.amountLeft, lang),
      });
    }
    if (goalType === ReadingGoalType.PAGES) {
      action = t('progress.pages-goal', { pages: progress.amountLeft.toFixed(1) });
    }
    if (goalType === ReadingGoalType.RANGE) {
      action = t('progress.range-goal', {
        from: progress.nextVerseToRead,
        to: readingGoalProgress.data.amount.split('-')[1],
      });
    }

    return `${prefix}: ${action}`;
  };

  const getGoalStatus = () => {
    const { progress } = readingGoalProgress.data;
    if (!progress) return null;

    if (progress.percent < 100) {
      return getAmountLeftMessage();
    }

    return t('progress.complete');
  };

  if (error || (!isLoading && !user?.id)) {
    return <LoggedOutReadingStreak />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>
        <div>
          <span className={styles.streakSubtitle}>{t('reading-goal-label')}</span>
          {isLoading ? <Skeleton>{streak}</Skeleton> : streak}
        </div>

        <CurrentWeekProgress
          isTodaysGoalDone={readingGoalProgress?.data?.progress?.percent >= 100}
          weekData={weekData}
        />
      </div>

      <div className={styles.goalContainer}>
        {!readingGoalProgress?.data ? <CreateReadingGoalModal /> : getGoalStatus()}
      </div>

      {/* {readingGoalProgress?.data && <DeleteReadingGoalButton />} */}
      <div className={styles.actionsContainer}>
        <Button
          href={
            readingGoalProgress?.data?.progress?.nextVerseToRead
              ? getChapterWithStartingVerseUrl(readingGoalProgress.data.progress.nextVerseToRead)
              : undefined
          }
        >
          {t('continue-reading')}
        </Button>
        <Button variant={ButtonVariant.Ghost}>{t('view-progress')}</Button>
      </div>
    </div>
  );
};

export default ReadingStreak;
