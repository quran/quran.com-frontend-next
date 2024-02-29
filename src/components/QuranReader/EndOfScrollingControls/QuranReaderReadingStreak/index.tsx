import styles from './QuranReaderReadingStreak.module.scss';
import QuranReaderStreak from './QuranReaderStreak';

import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { convertFractionToPercent } from '@/utils/number';

export enum ReadingStreakLayout {
  Home = 'home',
  QuranReader = 'quran-reader',
}

const QuranReaderReadingStreak = () => {
  const { isLoading, goal, weekData, currentActivityDay } = useGetStreakWithMetadata({
    disableIfNoGoalExists: true,
  });
  const percent = convertFractionToPercent(currentActivityDay?.progress || 0);
  const isGoalDone = percent >= 100;

  // don't render anything if there is no reading goal
  if (isLoading || !goal) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>
        <QuranReaderStreak
          percent={percent}
          goal={goal}
          isGoalDone={isGoalDone}
          currentActivityDay={currentActivityDay}
          weekData={weekData}
        />
      </div>
    </div>
  );
};

export default QuranReaderReadingStreak;
