import classNames from 'classnames';
import range from 'lodash/range';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './ReadingViewSkeleton.module.scss';

import verseTextStyles from '@/components/Verse/VerseText.module.scss';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { ReadingPreference } from '@/types/QuranReader';
import { getFontClassName } from '@/utils/fontFaceHelper';
import { getMushafLinesNumber } from '@/utils/page';

type Props = {
  readingPreference?: ReadingPreference;
};

const ReadingViewSkeleton = ({ readingPreference }: Props) => {
  const { quranFont, quranTextFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const numberOfLines = getMushafLinesNumber(quranFont, mushafLines);
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isTranslationMode = readingPreference === ReadingPreference.ReadingTranslation;

  return (
    <div className={styles.skeletonContainer}>
      {range(numberOfLines).map((i) => (
        <Skeleton
          key={i}
          className={classNames(
            styles.skeleton,
            // Apply font class for skeleton height (--skeleton-height variable)
            verseTextStyles[getFontClassName(quranFont, quranTextFontScale, mushafLines)],
            {
              [styles.fixedWidth]: !isWordByWordLayout && !isTranslationMode,
              [styles.translationWidth]: isTranslationMode,
            },
          )}
        />
      ))}
    </div>
  );
};

export default ReadingViewSkeleton;
