import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import ReadingGoalAmount from '../ReadingGoal/ReadingGoalAmount';

import styles from './ReadingProgressPage.module.scss';

import Button from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';

interface ProgressPageGoalWidgetProps {
  currentReadingDay: StreakWithMetadata['currentReadingDay'];
  readingGoal?: StreakWithMetadata['readingGoal'];
  isLoading: boolean;
}

const ProgressPageGoalWidget = ({
  currentReadingDay,
  readingGoal,
  isLoading,
}: ProgressPageGoalWidgetProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const percent = Math.min(readingGoal?.progress?.percent || 0, 100);
  const isGoalDone = percent >= 100;
  const localizedPercent = toLocalizedNumber(percent, lang);

  if (isLoading) {
    return (
      <Skeleton className={classNames(styles.widget, styles.emptyWidget)}>
        <Button href={getReadingGoalNavigationUrl()}>
          {t('reading-goal:create-reading-goal')}
        </Button>
      </Skeleton>
    );
  }

  if (!readingGoal) {
    const onCreateReadingGoalClick = () => {
      logButtonClick('progress_page_create_goal');
    };

    return (
      <div className={classNames(styles.widget, styles.emptyWidget)}>
        <Button href={getReadingGoalNavigationUrl()} onClick={onCreateReadingGoalClick}>
          {t('reading-goal:create-reading-goal')}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div>
        {isGoalDone ? (
          <p>{t('reading-goal:goal-done.title')}</p>
        ) : (
          <ReadingGoalAmount
            readingGoal={readingGoal}
            currentReadingDay={currentReadingDay}
            context="progress_page"
          />
        )}
      </div>

      <div className={styles.circularProgressbar}>
        <CircularProgressbar
          text={`${localizedPercent}%`}
          value={percent}
          maxValue={100}
          strokeWidth={12}
        />
      </div>
    </div>
  );
};

export default ProgressPageGoalWidget;
