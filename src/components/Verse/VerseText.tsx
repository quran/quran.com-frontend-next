import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Word from 'types/Word';
import { selectReadingView } from 'src/redux/slices/QuranReader/readingView';
import classNames from 'classnames';
import QuranWord from '../dls/QuranWord/QuranWord';
import { QuranReaderStyles, selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { ReadingView } from '../QuranReader/types';
import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

type VerseTextProps = {
  words: Word[];
};

const VerseText = ({ words }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const readingView = useSelector(selectReadingView);
  const isQuranPage = readingView === ReadingView.QuranPage;
  const { lineNumber, pageNumber } = words[0];
  const centerAlignPage = useMemo(() => isCenterAlignedPage(pageNumber, lineNumber), [
    pageNumber,
    lineNumber,
  ]);

  return (
    <div
      className={classNames(styles.verseTextContainer)}
      style={{
        fontSize: `${quranReaderStyles.quranTextFontSize}rem`,
        minWidth:
          isQuranPage && !centerAlignPage
            ? `min(95%, calc(${quranReaderStyles.letterSpacingMultiplier} * ${quranReaderStyles.quranTextFontSize}rem))`
            : null,
      }}
    >
      <div
        className={classNames(styles.verseText, {
          [styles.verseTextCenterAlign]: isQuranPage && centerAlignPage,
          [styles.verseTextSpaceBetween]: isQuranPage && !centerAlignPage,
        })}
      >
        {words?.map((word) => (
          <QuranWord key={word.location} word={word} font={quranReaderStyles.quranFont} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(VerseText);
