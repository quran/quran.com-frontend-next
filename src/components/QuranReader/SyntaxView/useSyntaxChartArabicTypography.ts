import { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './SyntaxView.module.scss';

import textWordStyles from '@/components/dls/QuranWord/TextWord.module.scss';
import verseTextStyles from '@/components/Verse/VerseText.module.scss';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getFontClassName, getFontFaceNameForPage } from '@/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';

/** Madani V1 / page 1 QCF face — matches `p1-v1` glyph fonts used in the reader. */
const SYNTAX_CHART_ARABIC_FONT = QuranFont.MadaniV1;
const SYNTAX_CHART_ARABIC_PAGE = 1;

/**
 * Shared Arabic typography for Syntax charts and inline Arabic in SyntaxBody:
 * same scale as Quran text (user setting) + `tafsirOrTranslationMode`, with QCF font `p1-v1`.
 *
 * @returns {{
 *   arabicFontFamily: string;
 *   arabicTypographyStyle: import('react').CSSProperties;
 *   verbTypographyClassName: string;
 *   meaningTypographyClassName: string;
 * }} Typography classes and inline `fontFamily` for Syntax Arabic (`p1-v1`).
 */
export default function useSyntaxChartArabicTypography() {
  const { quranTextFontScale, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);

  const arabicFontFamily = useMemo(
    () => getFontFaceNameForPage(SYNTAX_CHART_ARABIC_FONT, SYNTAX_CHART_ARABIC_PAGE),
    [],
  );

  const arabicTypographyStyle = useMemo(
    () => ({ fontFamily: arabicFontFamily }),
    [arabicFontFamily],
  );

  const verbTypographyClassName = useMemo(
    () =>
      classNames(
        textWordStyles.word,
        verseTextStyles.tafsirOrTranslationMode,
        verseTextStyles[
          getFontClassName(SYNTAX_CHART_ARABIC_FONT, quranTextFontScale, mushafLines)
        ],
      ),
    [mushafLines, quranTextFontScale],
  );

  const meaningTypographyClassName = useMemo(
    () => classNames(verbTypographyClassName, styles.syntaxVerbChartMeaningArabic),
    [verbTypographyClassName],
  );

  return {
    arabicFontFamily,
    arabicTypographyStyle,
    verbTypographyClassName,
    meaningTypographyClassName,
  };
}
