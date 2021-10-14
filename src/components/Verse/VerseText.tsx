import React, { useMemo, useRef } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import useIntersectionObserver from 'src/hooks/useObserveElement';
import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFirstWordOfSurah } from 'src/utils/verse';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
  isHighlighted?: boolean;
};

const OBSERVER_NAME = 'quranReaderObserver';
const VerseText = ({ words, isReadingMode = false, isHighlighted }: VerseTextProps) => {
  const textRef = useRef(null);
  useIntersectionObserver(textRef, OBSERVER_NAME);
  const { quranFont, quranTextFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  ) as QuranReaderStyles;
  const [firstWord] = words;
  const { lineNumber, pageNumber, location, verseKey, hizbNumber } = firstWord;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber, quranFont),
    [pageNumber, lineNumber, quranFont],
  );
  const firstWordData = getFirstWordOfSurah(location);
  const isBigTextLayout =
    isReadingMode &&
    (quranTextFontScale > 3 || showWordByWordTranslation || showWordByWordTransliteration);

  const { chapterId, isFirstWordOfSurah } = firstWordData;

  return (
    <>
      {isReadingMode && isFirstWordOfSurah && (
        <div className={styles.chapterHeaderContainer}>
          <ChapterHeader chapterId={chapterId} pageNumber={pageNumber} hizbNumber={hizbNumber} />
        </div>
      )}
      <div
        ref={textRef}
        data-verse-key={verseKey}
        data-page={pageNumber}
        data-chapter-id={chapterId}
        data-hizb={hizbNumber}
        className={classNames(
          styles.verseTextContainer,
          styles[`quran-font-size-${quranTextFontScale}`],
          {
            [styles.largeQuranTextLayoutContainer]: isBigTextLayout,
            [styles.highlighted]: isHighlighted,
          },
        )}
      >
        <div
          className={classNames(styles.verseText, {
            [styles.verseTextWrap]: !isReadingMode,
            [styles.largeQuranTextLayout]: isBigTextLayout,
            [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
            [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
          })}
        >
          {words?.map((word) => (
            <QuranWord key={word.location} word={word} font={quranFont} />
          ))}
        </div>
      </div>
    </>
  );
};

export default React.memo(VerseText);
