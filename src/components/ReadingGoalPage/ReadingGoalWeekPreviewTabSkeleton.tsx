import styles from './ReadingGoalPage.module.scss';

import Spinner from '@/dls/Spinner/Spinner';

interface ReadingGoalWeekPreviewTabSkeleton {
  numberOfDays: number;
}

const ReadingGoalWeekPreviewTabSkeleton: React.FC<ReadingGoalWeekPreviewTabSkeleton> = ({
  numberOfDays,
}) => {
  const days = Array.from({
    length: Math.min(numberOfDays, 7),
    // eslint-disable-next-line @typescript-eslint/naming-convention
  }).map((_, idx) => (
    // eslint-disable-next-line react/no-array-index-key
    <li key={idx} className={styles.dayPreview}>
      <Spinner />
    </li>
  ));

  return <>{days}</>;
};

export default ReadingGoalWeekPreviewTabSkeleton;
