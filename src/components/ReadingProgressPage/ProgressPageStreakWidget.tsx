import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from '../HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals/CurrentWeekProgress';

import styles from './ReadingProgressPage.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import MushafIcon from '@/icons/mushaf.svg';
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
  const { t, lang } = useTranslation('reading-goal');
  const localizedStreak = toLocalizedNumber(streak, lang);

  const widget = (
    <>
      <div className={styles.streakContainer}>
        <MushafIcon className={styles.mushaf} aria-hidden="true" focusable="false" />
        <div className={styles.streakText}>
          <span className={styles.streakNumber}>{localizedStreak}</span>
          <span>{t('day-streak')}</span>
        </div>
      </div>

      <CurrentWeekProgress weekData={weekData} goal={goal} />
    </>
  );

  const Wrapper = isLoading ? Skeleton : 'div';
  return <Wrapper className={classNames(styles.widget, styles.streakWidget)}>{widget}</Wrapper>;
};

export default ProgressPageStreakWidget;
