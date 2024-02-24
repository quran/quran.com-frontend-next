import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from './CurrentWeekProgress';
import DaysCounter from './DaysCounter';
import GoalButtons from './GoalButtons';
import GoalStatus from './GoalStatus';
import styles from './ReadingStreak.module.scss';
import StreakIntroductionWidget from './StreakIntroductionWidget';

import Button from '@/dls/Button/Button';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';
import { convertFractionToPercent } from '@/utils/number';

const HomePageReadingStreak = () => {
  const { t } = useTranslation('reading-goal');

  const { isLoading, error, streak, goal, weekData, currentActivityDay } = useGetStreakWithMetadata(
    {
      disableIfNoGoalExists: false,
    },
  );
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys();

  const nextVerseToRead = goal?.progress?.nextVerseToRead ?? recentlyReadVerseKeys[0];

  const percent = convertFractionToPercent(currentActivityDay?.progress || 0);

  if (error || (!isLoading && streak === 0 && !goal)) {
    return <StreakIntroductionWidget />;
  }

  return (
    <div>
      <div className={styles.container}>
        <>
          <div>
            <span className={styles.streakSubtitle}>{t('reading-goal-label')}</span>
            {isLoading ? (
              <Skeleton>
                <DaysCounter currentActivityDay={currentActivityDay} streak={streak} />
              </Skeleton>
            ) : (
              <DaysCounter currentActivityDay={currentActivityDay} streak={streak} />
            )}
          </div>
          <CurrentWeekProgress goal={goal} weekData={weekData} />
        </>
      </div>

      <div className={styles.goalContainer}>
        {goal ? (
          <>
            <GoalStatus
              isQuranReader={false}
              goal={goal}
              currentActivityDay={currentActivityDay}
              percent={percent}
            />
            <GoalButtons
              nextVerseToRead={nextVerseToRead}
              currentActivityDay={currentActivityDay}
            />
          </>
        ) : (
          <Button href={getReadingGoalNavigationUrl()}>{t('create-reading-goal')}</Button>
        )}
      </div>
    </div>
  );
};

export default HomePageReadingStreak;
