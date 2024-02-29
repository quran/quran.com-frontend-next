import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingProgressPage.module.scss';

import ReadingGoalAmount, {
  ReadingGoalAmountContext,
} from '@/components/ReadingGoal/ReadingGoalAmount';
import Button from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';

interface ProgressPageGoalWidgetProps {
  currentActivityDay: CurrentQuranActivityDay;
  goal?: StreakWithMetadata['goal'];
  isLoading: boolean;
}

const ProgressPageGoalWidget = ({
  currentActivityDay,
  goal,
  isLoading,
}: ProgressPageGoalWidgetProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const percent = goal?.isCompleted ? 100 : Math.min(goal?.progress?.percent || 0, 100);
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

  if (!goal) {
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

  const getContent = () => {
    if (goal.isCompleted) {
      return <p>{t('reading-goal:progress.goal-complete')}</p>;
    }

    if (isGoalDone) {
      return <p>{t('reading-goal:progress.complete')}</p>;
    }

    return (
      <ReadingGoalAmount
        goal={goal}
        currentActivityDay={currentActivityDay}
        context={ReadingGoalAmountContext.ProgressPage}
      />
    );
  };

  return (
    <div className={styles.widget}>
      <div>{getContent()}</div>

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
