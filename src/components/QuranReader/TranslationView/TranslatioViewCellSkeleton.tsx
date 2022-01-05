import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './TranslationViewSkeleton.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { QuranFont } from 'types/QuranReader';

const TRANSLATION_TEXT_SAMPLE =
  'He has revealed to you ˹O Prophet˺ the Book in truth, confirming what came before it, as He revealed the Torah and the Gospel';
const TRANSLATION_AUTHOR_SAMPLE = '— Dr. Mustafa Khattab, the Clear Quran';

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
        <div className={styles.actionContainerRight}>
          <Skeleton className={styles.actionItem} />
          <Skeleton className={styles.actionItem} />
          <Skeleton className={styles.actionItem} />
          <Skeleton className={styles.actionItem} />
        </div>
      </div>

      {/* We're not using VersePreview as Skeleton's children here 
      because it has layout shift problem when loading the font. Which is not ideal for skeleton */}
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
            <div>
              <Skeleton className={classNames(styles.translationText)}>
                {TRANSLATION_TEXT_SAMPLE}
              </Skeleton>
            </div>
            <div>
              <Skeleton className={classNames(styles.translationAuthor)}>
                {TRANSLATION_AUTHOR_SAMPLE}
              </Skeleton>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TranslationViewCellSkeleton;
