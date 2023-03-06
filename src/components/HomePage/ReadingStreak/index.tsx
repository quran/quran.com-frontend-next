/* eslint-disable max-lines */
import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../../public/images/moon-illustration.svg';

import CurrentWeekProgress from './CurrentWeekProgress';
import useGetWeekDays from './hooks/useGetWeekDays';
import LoggedOutReadingStreak from './LoggedOutReadingStreak';
import styles from './ReadingStreak.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import Progress from '@/dls/Progress';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useCurrentUser from '@/hooks/auth/useCurrentUser';
import useGetReadingGoalProgress from '@/hooks/auth/useGetReadingGoalProgress';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';
import { secondsFormatter } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface ReadingStreakProps {
  layout?: 'home' | 'quran-reader';
}

const ReadingStreak: React.FC<ReadingStreakProps> = ({ layout = 'home' }) => {
  const { t, lang } = useTranslation('reading-goal');
  const { user, isLoading, error } = useCurrentUser();
  const { readingGoalProgress } = useGetReadingGoalProgress();
  const isQuranReader = layout === 'quran-reader';

  const percent = readingGoalProgress?.data?.progress?.percent;
  const isGoalDone = percent >= 100;

  // disable this request for quran-reader
  const weekData = useGetWeekDays(!isQuranReader || isGoalDone);

  const localizedStreak = useMemo(() => {
    return toLocalizedNumber(user?.streak || 0, lang);
  }, [user, lang]);

  const hasUserReadToday = useMemo(() => {
    if (isQuranReader && !isGoalDone) return true;
    return weekData.readingDaysMap[weekData.weekDays.find((d) => d.current)?.date]?.hasRead;
  }, [weekData, isQuranReader, isGoalDone]);

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
    if (!readingGoalProgress?.data || !readingGoalProgress.data.progress) return null;

    const { progress, type: goalType } = readingGoalProgress.data;

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

  const getContent = () => {
    const streakContainer = (
      <div>
        <span className={styles.streakSubtitle}>{t('reading-goal-label')}</span>
        {isLoading ? <Skeleton>{streak}</Skeleton> : streak}
      </div>
    );

    if (!isQuranReader) {
      return (
        <>
          {streakContainer}
          <CurrentWeekProgress isTodaysGoalDone={isGoalDone} weekData={weekData} />
        </>
      );
    }

    if (!isGoalDone) {
      return (
        <div className={styles.dailyProgressContainer}>
          <p className={styles.streakTitle}>{t('daily-progress')}</p>
          <p className={styles.dailyGoal}>{getAmountLeftMessage()}</p>
          <div className={styles.progressContainer}>
            <Progress value={percent} />
            <div className={styles.progressTextContainer}>
              <p>{Math.min(percent, 100)}%</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.dailyProgressContainer}>
          <p className={styles.streakTitle}>{t('goal-done.title')}</p>
          <p className={styles.dailyGoal}>{t('goal-done.description')}</p>
          {/* <div className={styles.progressContainer}>
            <Progress value={percent} />
            <div className={styles.progressTextContainer}>
              <p>{percent}%</p>
            </div>
          </div> */}
        </div>
        <CurrentWeekProgress isTodaysGoalDone={isGoalDone} weekData={weekData} />
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* {!isQuranReader && ( */}
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>
      {/* )} */}

      <div className={styles.container}>{getContent()}</div>

      {!isQuranReader && (
        <div className={styles.goalContainer}>
          {!readingGoalProgress?.data ? (
            <Button href="/reading-goal">{t('set-reading-goal')}</Button>
          ) : (
            getGoalStatus()
          )}
        </div>
      )}

      {/* {readingGoalProgress?.data && <DeleteReadingGoalButton />} */}
      {!isQuranReader && (
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
      )}
    </div>
  );
};

export default ReadingStreak;
