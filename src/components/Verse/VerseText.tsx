/* eslint-disable react/no-multi-comp */
/* eslint-disable max-lines */
import React, { useCallback, useMemo, useRef } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { QURAN_READER_OBSERVER_ID } from '../QuranReader/observer';

import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import QuranWord from '@/dls/QuranWord/QuranWord';
import useIntersectionObserver from '@/hooks/useObserveElement';
import { selectWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import {
  selectReadingViewSelectedVerseKey,
  selectReadingViewHoveredVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getFontClassName } from '@/utils/fontFaceHelper';
import { getFirstWordOfSurah } from '@/utils/verse';
import { FALLBACK_FONT, QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
  isHighlighted?: boolean;
  shouldShowH1ForSEO?: boolean;
};

enum VerseTextHighlightStatus {
  HIGHLIGHTED = 'highlighted',
  UNHIGHLIGHTED = 'unhighlighted',
  MIXED = 'mixed',
}

const VerseText = ({
  words,
  isReadingMode = false,
  isHighlighted,
  shouldShowH1ForSEO = false,
}: VerseTextProps) => {
  const textRef = useRef(null);
  useIntersectionObserver(textRef, QURAN_READER_OBSERVER_ID);
  const { quranFont, quranTextFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );
  const [firstWord] = words;
  const { lineNumber, pageNumber, location, verseKey, hizbNumber } = firstWord;
  const isFontLoaded = useIsFontLoaded(firstWord.pageNumber, quranFont);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordPreferences,
    shallowEqual,
  );
  const selectedVerseKey = useSelector(selectReadingViewSelectedVerseKey, shallowEqual);
  const hoveredVerseKey = useSelector(selectReadingViewHoveredVerseKey, shallowEqual);

  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber, quranFont),
    [pageNumber, lineNumber, quranFont],
  );
  const firstWordData = getFirstWordOfSurah(location);
  const isTajweedFont = quranFont === QuranFont.Tajweed;
  const isBigTextLayout =
    (isReadingMode &&
      (quranTextFontScale > 3 || showWordByWordTranslation || showWordByWordTransliteration)) ||
    isTajweedFont;

  const { chapterId } = firstWordData;

  const VerseTextContainer = shouldShowH1ForSEO ? 'h1' : 'div';
  const fontClassName = isFontLoaded
    ? getFontClassName(quranFont, quranTextFontScale, mushafLines)
    : getFontClassName(FALLBACK_FONT, quranTextFontScale, mushafLines, true);

  const renderWord = useCallback(
    (word: Word) => (
      <QuranWord
        key={word.location}
        word={word}
        font={quranFont}
        isFontLoaded={isFontLoaded}
        isHighlighted={word.verseKey === selectedVerseKey}
      />
    ),
    [quranFont, isFontLoaded, selectedVerseKey],
  );

  const isSecondaryHighlighted = useCallback(
    (word: Word) => word.verseKey === hoveredVerseKey,
    [hoveredVerseKey],
  );

  const wordsSecondaryHighlightStatus = useMemo(() => {
    let hasHighlightedWords = false;
    let hasUnhighlightedWords = false;

    for (let i = 0; i < words.length; i += 1) {
      const word = words[i];

      if (hasHighlightedWords && hasUnhighlightedWords) break;

      if (isSecondaryHighlighted(word)) hasHighlightedWords = true;
      else hasUnhighlightedWords = true;
    }

    if (hasHighlightedWords && hasUnhighlightedWords) {
      return VerseTextHighlightStatus.MIXED;
    }

    if (hasHighlightedWords) {
      return VerseTextHighlightStatus.HIGHLIGHTED;
    }

    return VerseTextHighlightStatus.UNHIGHLIGHTED;
  }, [words, isSecondaryHighlighted]);

  const highlighter = useMemo(() => {
    /* if a part of the line is highlighted, we need to render the highlighted part in a separate div in the background so that we can change the background color of the div with the same width as the highlighted part without affecting the background color of the words */
    if (wordsSecondaryHighlightStatus !== VerseTextHighlightStatus.MIXED) return null;

    const secondaryHighlightedIndexStart = words.findIndex(isSecondaryHighlighted);
    const wordsBeforeSecondaryHighlighted = words.slice(0, secondaryHighlightedIndexStart);

    const secondaryHighlightedIndexEnd = words.findIndex(
      (word, index) => index > secondaryHighlightedIndexStart && !isSecondaryHighlighted(word),
    );

    const alignClassname = {
      [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
      [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
    };
    const wrapperClassname = classNames(styles.highlighterWrapper, alignClassname, {
      [styles.centerHightlight]: isReadingMode && centerAlignPage,
    });

    const calculateFlex = (before: Word[]) => {
      return `${Math.max(before.length - 1, 1)} 1 content`;
    };

    // there is no end because it's the last word in the line and the next line is still the same verse
    if (secondaryHighlightedIndexEnd === -1) {
      const wordsBetweenSecondaryHighlighted = words.slice(
        Math.max(secondaryHighlightedIndexStart, 0),
      );

      return (
        <div className={wrapperClassname}>
          {wordsBeforeSecondaryHighlighted.length > 0
            ? wordsBeforeSecondaryHighlighted.map(renderWord)
            : null}

          <div
            className={classNames(styles.highlighted, styles.highlighterItem, alignClassname)}
            style={{
              flex: calculateFlex(wordsBeforeSecondaryHighlighted),
            }}
          >
            {wordsBetweenSecondaryHighlighted?.map(renderWord)}
          </div>
        </div>
      );
    }

    // there will be 3 arrays
    // 1. words before secondaryHighlightedIndexStart
    // 2. words between secondaryHighlightedIndexStart and secondaryHighlightedIndexEnd
    // 3. words after secondaryHighlightedIndexEnd
    const wordsBetweenSecondaryHighlighted = words.slice(
      secondaryHighlightedIndexStart,
      secondaryHighlightedIndexEnd,
    );
    const wordsAfterSecondaryHighlighted = words.slice(secondaryHighlightedIndexEnd);
    // console.log('wordsAfterSecondaryHighlighted', wordsAfterSecondaryHighlighted);

    return (
      <div className={wrapperClassname}>
        {wordsBeforeSecondaryHighlighted.length > 0
          ? wordsBeforeSecondaryHighlighted.map(renderWord)
          : null}

        <div
          className={classNames(styles.highlighterItem, styles.highlighted, alignClassname)}
          style={{
            flex: calculateFlex(wordsBeforeSecondaryHighlighted),
          }}
        >
          {wordsBetweenSecondaryHighlighted.map(renderWord)}
        </div>

        {wordsAfterSecondaryHighlighted.length > 0
          ? wordsAfterSecondaryHighlighted.map(renderWord)
          : null}
      </div>
    );
  }, [
    words,
    wordsSecondaryHighlightStatus,
    isSecondaryHighlighted,
    renderWord,
    isReadingMode,
    centerAlignPage,
  ]);

  return (
    <>
      <VerseTextContainer
        ref={textRef}
        data-verse-key={verseKey}
        data-page={pageNumber}
        data-chapter-id={chapterId}
        data-hizb={hizbNumber}
        className={classNames(styles.verseTextContainer, {
          [styles.largeQuranTextLayoutContainer]: isBigTextLayout,
          [styles.highlighted]: isHighlighted,
          [styles[fontClassName]]: !isTajweedFont,
          [styles.tafsirOrTranslationMode]: !isReadingMode,
        })}
      >
        <div
          translate="no"
          className={classNames(styles.verseText, {
            [styles.verseTextWrap]: !isReadingMode,
            [styles.largeQuranTextLayout]: isBigTextLayout,
            [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
            [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
            [styles.highlighted]:
              wordsSecondaryHighlightStatus === VerseTextHighlightStatus.HIGHLIGHTED,
          })}
        >
          {highlighter}
          {words?.map(renderWord)}
        </div>
      </VerseTextContainer>
    </>
  );
};

export default React.memo(VerseText);
