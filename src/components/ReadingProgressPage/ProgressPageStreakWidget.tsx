import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from '../HomePage/ReadingStreak/CurrentWeekProgress';

import styles from './ReadingProgressPage.module.scss';

import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { toLocalizedNumber } from '@/utils/locale';

interface ProgressPageStreakWidgetProps {
  weekData: StreakWithMetadata['weekData'];
  readingGoal?: StreakWithMetadata['readingGoal'];
  streak: number;
}

const ProgressPageStreakWidget = ({
  weekData,
  readingGoal,
  streak,
}: ProgressPageStreakWidgetProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const localizedStreak = toLocalizedNumber(streak, lang);

  return (
    <div className={classNames(styles.widget, styles.streakWidget)}>
      <div className={styles.streakContainer}>
        <h2>{t('streak')}</h2>
        <p>{t('reading-goal:x-days', { days: localizedStreak, count: streak })}</p>
      </div>

      <CurrentWeekProgress
        weekData={weekData}
        readingGoal={readingGoal}
        shouldHideOnTablet={false}
        fixedWidth={false}
      />
    </div>
  );
};

export default ProgressPageStreakWidget;
