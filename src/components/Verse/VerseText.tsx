import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Word from 'types/Word';
import classNames from 'classnames';
import { getFirstWordOfSurah } from 'src/utils/verse';
import { selectReadingPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import clipboardCopy from 'clipboard-copy';
import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
};

const VerseText = ({ words, isReadingMode = false }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { quranTextFontScale } = quranReaderStyles;
  const { lineNumber, pageNumber, location } = words[0];
  const { showWordByWordTranslation, showWordByWordTransliteration } =
    useSelector(selectReadingPreferences);
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber),
    [pageNumber, lineNumber],
  );
  const firstWordData = getFirstWordOfSurah(location);
  const isBigTextLayout =
    isReadingMode &&
    (quranTextFontScale > 3 || showWordByWordTranslation || showWordByWordTransliteration);

  const onCopy = (e) => {
    // preventDefault behavior, so that the raw text is not copied to the clipboard
    e.preventDefault();
    // clean up the text to remove the "\n" between the word before copying
    const textToCopy = window.getSelection().toString().split('\n').join(' ');

    clipboardCopy(textToCopy);
  };

  return (
    <>
      {isReadingMode && firstWordData.isFirstWordOfSurah && (
        <ChapterHeader chapterId={firstWordData.chapterId} />
      )}
      <div
        className={classNames(
          styles.verseTextContainer,
          styles[`quran-font-size-${quranTextFontScale}`],
          { [styles.largeQuranTextLayoutContainer]: isBigTextLayout },
        )}
      >
        <div
          onCopy={onCopy}
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
