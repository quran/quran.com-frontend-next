import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from '../HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals/CurrentWeekProgress';

import styles from './ReadingProgressPage.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import BookIcon from '@/icons/book.svg';
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
        <BookIcon />
        <h2
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: t('x-days-streak', { days: localizedStreak, count: streak }),
          }}
        />
      </div>

      <CurrentWeekProgress weekData={weekData} goal={goal} fixedWidth={false} />
    </>
  );

  const Wrapper = isLoading ? Skeleton : 'div';
  return <Wrapper className={classNames(styles.widget, styles.streakWidget)}>{widget}</Wrapper>;
};

export default ProgressPageStreakWidget;
