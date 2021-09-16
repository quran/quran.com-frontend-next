import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFirstWordOfSurah } from 'src/utils/verse';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
};

const VerseText = ({ words, isReadingMode = false }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { quranTextFontScale } = quranReaderStyles;
  const [firstWord] = words;
  const { lineNumber, pageNumber, location } = firstWord;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber),
    [pageNumber, lineNumber],
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
          <ChapterHeader chapterId={chapterId} />
        </div>
      )}
      <div
        className={classNames(
          styles.verseTextContainer,
          styles[`quran-font-size-${quranTextFontScale}`],
          { [styles.largeQuranTextLayoutContainer]: isBigTextLayout },
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
            <QuranWord key={word.location} word={word} font={quranReaderStyles.quranFont} />
          ))}
        </div>
      </div>
    </>
  );
};

export default React.memo(VerseText);
