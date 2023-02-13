import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../../public/images/moon-illustration.svg';

import CurrentWeekProgress from './CurrentWeekProgress';
import ReadingGoalModal from './ReadingGoalModal';
import styles from './ReadingStreak.module.scss';

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
  const { t, lang } = useTranslation();
  const { readingGoalProgress } = useGetReadingGoalProgress();

  const localizedStreak = useMemo(() => {
    return toLocalizedNumber(user?.streak || 0, lang);
  }, [user, lang]);

  const streak = (
    <p className={styles.streakTitle}>
      {t('reading-goal:streak', { days: localizedStreak })}
      <HelperTooltip>{t('reading-goal:streak-definition')}</HelperTooltip>
    </p>
  );

  const getAmountLeftMessage = () => {
    const { progress } = readingGoalProgress.data;
    const goalType = readingGoalProgress.data.type;

    const prefix =
      progress.percent === 0 ? t('reading-goal:todays-goal') : t('reading-goal:remaining');

    let action = '';
    if (goalType === ReadingGoalType.TIME) {
      action = t('reading-goal:progress.time-goal', {
        time: secondsFormatter(progress.amountLeft, lang),
      });
    }
    if (goalType === ReadingGoalType.PAGES) {
      action = t('reading-goal:progress.pages-goal', { pages: progress.amountLeft.toFixed(1) });
    }
    if (goalType === ReadingGoalType.RANGE) {
      action = t('reading-goal:progress.range-goal', {
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
      return <div className={styles.goalContainer}>{getAmountLeftMessage()}</div>;
    }

    return <div className={styles.goalContainer}>{t('reading-goal:progress.complete')}</div>;
  };

  if (error || (!isLoading && !user?.id)) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>
        <div>
          <p className={styles.streakLabel}>{t('reading-goal:reading-goal-label')}</p>
          {isLoading ? <Skeleton>{streak}</Skeleton> : streak}
        </div>
        <CurrentWeekProgress
          isTodaysGoalDone={readingGoalProgress?.data?.progress?.percent >= 100}
        />
      </div>
      <div className={styles.goalContainer}>
        {!readingGoalProgress?.data ? <ReadingGoalModal /> : getGoalStatus()}
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
          {t('reading-goal:continue-reading')}
        </Button>
        <Button variant={ButtonVariant.Ghost}>{t('reading-goal:view-progress')}</Button>
      </div>
    </div>
  );
};

export default ReadingStreak;
