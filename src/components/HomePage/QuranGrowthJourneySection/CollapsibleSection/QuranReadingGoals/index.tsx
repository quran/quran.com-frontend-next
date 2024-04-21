import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from './CurrentWeekProgress';
import DaysCounter from './DaysCounter';
import GoalStatus from './GoalStatus';
import styles from './ReadingStreak.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { convertFractionToPercent } from '@/utils/number';

const HomePageReadingStreak = () => {
  const { t } = useTranslation('reading-goal');

  const { isLoading, error, streak, goal, weekData, currentActivityDay } = useGetStreakWithMetadata(
    {
      disableIfNoGoalExists: false,
    },
  );

  const percent = convertFractionToPercent(currentActivityDay?.progress || 0);

  if (error || (!isLoading && streak === 0 && !goal)) {
    return <p>{t('home:qgj.quran-reading-goals.desc.logged-out')}</p>;
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

      {goal && (
        <div className={styles.goalContainer}>
          <GoalStatus
            isQuranReader={false}
            goal={goal}
            currentActivityDay={currentActivityDay}
            percent={percent}
          />
        </div>
      )}
    </div>
  );
};

export default HomePageReadingStreak;
