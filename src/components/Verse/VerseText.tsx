import React, { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import Word from 'types/Word';
import classNames from 'classnames';
import { getFirstWordOfSurah } from 'src/utils/verse';
import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
};

const VerseText = ({ words, isReadingMode = false }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { quranTextFontScale } = quranReaderStyles;
  const { lineNumber, pageNumber, location } = words[0];
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
      {isReadingMode && isFirstWordOfSurah && <ChapterHeader chapterId={chapterId} />}
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
