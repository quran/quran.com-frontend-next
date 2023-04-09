import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import ReadingGoalAmount from '../ReadingGoal/ReadingGoalAmount';

import styles from './ReadingProgressPage.module.scss';

import Button from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import { toLocalizedNumber } from '@/utils/locale';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';

interface ProgressPageGoalWidgetProps {
  currentReadingDay: StreakWithMetadata['currentReadingDay'];
  readingGoal?: StreakWithMetadata['readingGoal'];
}

const ProgressPageGoalWidget = ({
  currentReadingDay,
  readingGoal,
}: ProgressPageGoalWidgetProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const percent = Math.min(readingGoal?.progress?.percent || 0, 100);
  const localizedPercent = toLocalizedNumber(percent, lang);

  if (!readingGoal) {
    return (
      <div className={classNames(styles.widget, styles.emptyWidget)}>
        <Button href={getReadingGoalNavigationUrl()}>
          {t('reading-goal:create-reading-goal')}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div>
        <ReadingGoalAmount readingGoal={readingGoal} currentReadingDay={currentReadingDay} />
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
