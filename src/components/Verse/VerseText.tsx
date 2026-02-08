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
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import {
  selectReadingViewSelectedVerseKey,
  selectReadingViewHoveredVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import QueryParam from '@/types/QueryParam';
import { getFontClassName } from '@/utils/fontFaceHelper';
import { FALLBACK_FONT, MushafLines, QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
  isHighlighted?: boolean;
  shouldShowH1ForSEO?: boolean;
  tooltipType?: TooltipType;
  highlightedWordPosition?: number;
  isWordInteractionDisabled?: boolean;
  shouldDisableForceTooltip?: boolean;
  quranFontOverride?: QuranFont;
  quranTextFontScaleOverride?: number;
  mushafLinesOverride?: MushafLines;
  shouldShowWordByWordTranslation?: boolean;
  shouldShowWordByWordTransliteration?: boolean;
  isStandaloneMode?: boolean;
};

const VerseText = ({
  words,
  isReadingMode = false,
  isHighlighted,
  shouldShowH1ForSEO = false,
  tooltipType,
  highlightedWordPosition,
  isWordInteractionDisabled = false,
  shouldDisableForceTooltip = false,
  // Standalone mode (widget/embed) doesn't use redux, so we can override these styles via props
  quranFontOverride,
  quranTextFontScaleOverride,
  mushafLinesOverride,
  shouldShowWordByWordTranslation,
  shouldShowWordByWordTransliteration,
  isStandaloneMode = false,
}: VerseTextProps) => {
  const router = useRouter();
  const textRef = useRef(null);
  const reduxStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const quranFont = quranFontOverride ?? reduxStyles.quranFont;
  const quranTextFontScale = quranTextFontScaleOverride ?? reduxStyles.quranTextFontScale;
  const mushafLines = mushafLinesOverride ?? reduxStyles.mushafLines;
  const [firstWord] = words;
  const { lineNumber, pageNumber } = firstWord;
  const reduxFontLoaded = useIsFontLoaded(firstWord.pageNumber, quranFont);
  const isFontLoaded = isStandaloneMode ? true : reduxFontLoaded;
  const reduxWbwPrefs = useSelector(selectInlineDisplayWordByWordPreferences, shallowEqual);
  const showWordByWordTranslation =
    shouldShowWordByWordTranslation ?? reduxWbwPrefs.showWordByWordTranslation;
  const showWordByWordTransliteration =
    shouldShowWordByWordTransliteration ?? reduxWbwPrefs.showWordByWordTransliteration;
  const selectedVerseKey = useSelector(selectReadingViewSelectedVerseKey, shallowEqual);
  const hoveredVerseKey = useSelector(selectReadingViewHoveredVerseKey, shallowEqual);
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber, quranFont),
    [pageNumber, lineNumber, quranFont],
  );
  // if it's translation mode and hideArabic query param is true, don't show the verse text
  if (
    !isStandaloneMode &&
    isReadingMode === false &&
    router?.query?.[QueryParam.HIDE_ARABIC] === 'true'
  ) {
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
        data-testid={`verse-arabic-${firstWord.verseKey}`}
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
            const isHoveredWord = word.verseKey === hoveredVerseKey;
            return (
              <QuranWord
                key={word.location}
                word={word}
                font={quranFont}
                isFontLoaded={isFontLoaded}
                isHighlighted={
                  isHighlightedWord || word.verseKey === selectedVerseKey || isHoveredWord
                }
                tooltipType={tooltipType}
                isWordInteractionDisabled={isWordInteractionDisabled}
                shouldForceShowTooltip={isHighlightedWord && !shouldDisableForceTooltip}
                quranTextFontScaleOverride={quranTextFontScaleOverride}
                mushafLinesOverride={mushafLinesOverride}
                shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
                shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
                isStandaloneMode={isStandaloneMode}
              />
            );
          })}
        </div>
      </VerseTextContainer>
    </>
  );
};

export default React.memo(VerseText);
