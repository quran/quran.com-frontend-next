import { useSelector } from 'react-redux';

import styles from './TranslationViewSkeleton.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';

const TranslationViewCellSkeleton = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  return (
    <div className={styles.cellContainer}>
      <div className={styles.actionsContainers}>
        <Skeleton className={styles.actionContainerLeft} />
        <Skeleton className={styles.actionContainerRight} />
      </div>
      <Skeleton className={styles.verseContainer} />
      <div className={styles.translationContainer}>
        {selectedTranslations.map((translation) => (
          <span key={translation}>
            <Skeleton className={styles.translationText} />
            <Skeleton className={styles.translationText} />
          </span>
        ))}
      </div>
    </div>
  );
};

export default TranslationViewCellSkeleton;
