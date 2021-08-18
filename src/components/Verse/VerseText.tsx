import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Word from 'types/Word';
import { selectReadingPreference } from 'src/redux/slices/QuranReader/readingPreference';
import classNames from 'classnames';
import QuranWord from '../dls/QuranWord/QuranWord';
import { QuranReaderStyles, selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { ReadingPreference } from '../QuranReader/types';
import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';
import selectHighlightIndex from './VerseTextHighlight';

type VerseTextProps = {
  words: Word[];
  timestampSegments?: [number[]];
};

const VerseText = ({ words, timestampSegments }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { quranTextFontScale } = quranReaderStyles;
  const readingPreference = useSelector(selectReadingPreference);
  const isReadingMode = readingPreference === ReadingPreference.Reading;
  const { lineNumber, pageNumber } = words[0];
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber),
    [pageNumber, lineNumber],
  );
  const highlightIndex = useSelector((state) =>
    selectHighlightIndex(state, timestampSegments, words),
  );

  return (
    <div
      className={classNames(
        styles.verseTextContainer,
        styles[`quran-font-size-${quranTextFontScale}`],
      )}
    >
      <div
        className={classNames(styles.verseText, {
          [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
          [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
        })}
      >
        {words?.map((word, index) => (
          <QuranWord
            key={word.location}
            word={word}
            font={quranReaderStyles.quranFont}
            highlight={index === highlightIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(VerseText);
