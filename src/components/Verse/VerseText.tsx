import React, { useMemo, useRef } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import isCenterAlignedPage from './pageUtils';
import SEOTextForVerse from './SeoTextForVerse';
import TajweedFontPalettes from './TajweedFontPalettes';
import styles from './VerseText.module.scss';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import QuranWord from '@/dls/QuranWord/QuranWord';
import { TooltipType } from '@/dls/Tooltip';
import useIntersectionObserver from '@/hooks/useObserveElement';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import {
  selectReadingViewSelectedVerseKey,
  selectReadingViewHoveredVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import QueryParam from '@/types/QueryParam';
import { getFontClassName } from '@/utils/fontFaceHelper';
import { FALLBACK_FONT } from 'types/QuranReader';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
  isHighlighted?: boolean;
  shouldShowH1ForSEO?: boolean;
  bookmarksRangeUrl?: string | null;
  tooltipType?: TooltipType;
  highlightedWordPosition?: number;
  isWordInteractionDisabled?: boolean;
};

const VerseText = ({
  words,
  isReadingMode = false,
  isHighlighted,
  shouldShowH1ForSEO = false,
  bookmarksRangeUrl,
  tooltipType,
  highlightedWordPosition,
  isWordInteractionDisabled = false,
}: VerseTextProps) => {
  const router = useRouter();
  const textRef = useRef(null);
  const { quranFont, quranTextFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );
  const [firstWord] = words;
  const { lineNumber, pageNumber } = firstWord;
  const isFontLoaded = useIsFontLoaded(firstWord.pageNumber, quranFont);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const selectedVerseKey = useSelector(selectReadingViewSelectedVerseKey, shallowEqual);
  const hoveredVerseKey = useSelector(selectReadingViewHoveredVerseKey, shallowEqual);
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber, quranFont),
    [pageNumber, lineNumber, quranFont],
  );
  // if it's translation mode and hideArabic query param is true, don't show the verse text
  if (isReadingMode === false && router?.query?.[QueryParam.HIDE_ARABIC] === 'true') {
    return null;
  }
  const isBigTextLayout =
    isReadingMode &&
    (quranTextFontScale > 3 || showWordByWordTranslation || showWordByWordTransliteration);

  const VerseTextContainer = shouldShowH1ForSEO ? 'h1' : 'div';
  const fontClassName = isFontLoaded
    ? getFontClassName(quranFont, quranTextFontScale, mushafLines)
    : getFontClassName(FALLBACK_FONT, quranTextFontScale, mushafLines, true);
  return (
    <>
      <SEOTextForVerse words={words} />
      <TajweedFontPalettes pageNumber={pageNumber} quranFont={quranFont} />
      <VerseTextContainer
        ref={textRef}
        className={classNames(styles.verseTextContainer, styles[fontClassName], {
          [styles.largeQuranTextLayoutContainer]: isBigTextLayout,
          [styles.highlighted]: isHighlighted,
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
          })}
        >
          {words?.map((word) => {
            const isHighlightedWord =
              highlightedWordPosition !== undefined && word.position === highlightedWordPosition;
            return (
              <QuranWord
                key={word.location}
                word={word}
                font={quranFont}
                isFontLoaded={isFontLoaded}
                isHighlighted={isHighlightedWord || word.verseKey === selectedVerseKey}
                shouldShowSecondaryHighlight={word.verseKey === hoveredVerseKey}
                bookmarksRangeUrl={bookmarksRangeUrl}
                tooltipType={tooltipType}
                isWordInteractionDisabled={isWordInteractionDisabled}
                shouldForceShowTooltip={isHighlightedWord}
              />
            );
          })}
        </div>
      </VerseTextContainer>
    </>
  );
};

export default React.memo(VerseText);
