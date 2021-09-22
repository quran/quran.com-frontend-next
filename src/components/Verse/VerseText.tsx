import React, { useMemo, useRef, useEffect } from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import useIntersectionObserver from 'src/hooks/useIntersectionObserver';
import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFirstWordOfSurah } from 'src/utils/verse';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
  isHighlighted?: boolean;
};

const READING_MODE_ROOT_MARGIN = '-10% 0px -85% 0px';
const DEFAULT_ROOT_MARGIN = '-23% 0px -72% 0px';
const OBSERVER_THRESHOLD = 0.01;

const VerseText = ({ words, isReadingMode = false, isHighlighted }: VerseTextProps) => {
  const textRef = useRef(null);
  const dispatch = useDispatch();
  const intersectionObserverEntry = useIntersectionObserver(textRef, {
    rootMargin: isReadingMode ? READING_MODE_ROOT_MARGIN : DEFAULT_ROOT_MARGIN,
    threshold: OBSERVER_THRESHOLD,
  });
  useEffect(() => {
    if (intersectionObserverEntry && intersectionObserverEntry.isIntersecting) {
      const verseTextNode = intersectionObserverEntry.target;
      dispatch({
        type: setLastReadVerse.type,
        payload: {
          verseKey: verseTextNode.getAttribute('data-verse-key'),
          chapterId: verseTextNode.getAttribute('data-chapter-id'),
          page: verseTextNode.getAttribute('data-page'),
          hizb: verseTextNode.getAttribute('data-hizb'),
        },
      });
    }
  }, [dispatch, intersectionObserverEntry]);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { quranTextFontScale } = quranReaderStyles;
  const [firstWord] = words;
  const { lineNumber, pageNumber, location, verseKey, hizbNumber } = firstWord;
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
            <QuranWord key={word.location} word={word} font={quranReaderStyles.quranFont} />
          ))}
        </div>
      </div>
    </>
  );
};

export default React.memo(VerseText);
