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
  shouldShowChapterHeaderSkeleton?: boolean;
  readingPreference?: ReadingPreference;
};

const ReadingViewSkeleton = ({
  shouldShowChapterHeaderSkeleton = false,
  readingPreference,
}: Props) => {
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
      {shouldShowChapterHeaderSkeleton && (
        <div className={styles.chapterHeaderSkeleton}>
          {/* Top controls */}
          <div className={styles.headerControls}>
            <Skeleton className={styles.playButton} />
            <div className={styles.modeButtons}>
              <Skeleton className={styles.modeButton} />
              <Skeleton className={styles.translationButton} />
            </div>
          </div>

          {/* Chapter title */}
          <div className={styles.headerTitle}>
            <div className={styles.titleText}>
              <Skeleton className={styles.chapterName} />
              <Skeleton className={styles.chapterTranslation} />
            </div>
            <Skeleton className={styles.chapterIcon} />
          </div>

          {/* Bismillah */}
          <div className={styles.bismillahContainer}>
            <Skeleton className={styles.bismillah} />
            <Skeleton className={styles.bismillahTranslation} />
          </div>
        </div>
      )}
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
