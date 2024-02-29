import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from '../HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals/CurrentWeekProgress';

import styles from './ReadingProgressPage.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { toLocalizedNumber } from '@/utils/locale';

interface ProgressPageStreakWidgetProps {
  weekData: StreakWithMetadata['weekData'];
  goal?: StreakWithMetadata['goal'];
  streak: number;
  isLoading: boolean;
}

const ProgressPageStreakWidget = ({
  weekData,
  goal,
  streak,
  isLoading,
}: ProgressPageStreakWidgetProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const localizedStreak = toLocalizedNumber(streak, lang);

  const widget = (
    <>
      <div className={styles.streakContainer}>
        <h2>{t('reading-goal:streak')}</h2>
        <p>{t('reading-goal:x-days', { days: localizedStreak, count: streak })}</p>
      </div>

      <CurrentWeekProgress weekData={weekData} goal={goal} fixedWidth={false} />
    </>
  );

  const Wrapper = isLoading ? Skeleton : 'div';
  return <Wrapper className={classNames(styles.widget, styles.streakWidget)}>{widget}</Wrapper>;
};

export default ProgressPageStreakWidget;
