import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './TranslationViewSkeleton.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { QuranFont } from 'types/QuranReader';

const TranslationViewCellSkeleton = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { quranFont, quranTextFontScale, translationFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const isTajweedFont = quranFont === QuranFont.Tajweed;

  return (
    <div className={styles.cellContainer}>
      <div className={styles.actionsContainers}>
        <Skeleton className={styles.actionContainerLeft} />
        <Skeleton className={styles.actionContainerRight} />
      </div>
      <Skeleton
        className={classNames(styles.verseContainer, {
          [styles[`${quranFont}-font-size-${quranTextFontScale}`]]: !isTajweedFont,
        })}
      />
      <div
        className={classNames(
          styles.translationContainer,
          styles[`translation-font-size-${translationFontScale}`],
        )}
      >
        {selectedTranslations.map((translation) => (
          <span key={translation}>
            <Skeleton className={classNames(styles.translationText)} />
            <Skeleton className={classNames(styles.translationText)} />
          </span>
        ))}
      </div>
    </div>
  );
};

export default TranslationViewCellSkeleton;
