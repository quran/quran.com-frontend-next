import classNames from 'classnames';
import Trans from 'next-translate/Trans';
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
  const { lang } = useTranslation('reading-goal');
  const localizedStreak = toLocalizedNumber(streak, lang);

  const widget = (
    <>
      <div className={styles.streakContainer}>
        <BookIcon />
        <h2>
          <Trans
            i18nKey="reading-goal:x-days-streak"
            values={{ days: localizedStreak, count: streak }}
            components={{
              p: <p />,
              span: <span />,
            }}
          />
        </h2>
      </div>

      <CurrentWeekProgress weekData={weekData} goal={goal} fixedWidth={false} />
    </>
  );

  const Wrapper = isLoading ? Skeleton : 'div';
  return <Wrapper className={classNames(styles.widget, styles.streakWidget)}>{widget}</Wrapper>;
};

export default ProgressPageStreakWidget;
