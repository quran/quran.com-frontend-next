/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './GlyphWord.module.scss';

import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFontClassName } from 'src/utils/fontFaceHelper';
import { FALLBACK_FONT, QuranFont } from 'types/QuranReader';

type UthmaniWordTextProps = {
  qpcUthmaniHafs: string;
  textCodeV1?: string;
  textCodeV2?: string;
  pageNumber: number;
  font: QuranFont;
  isFontLoaded: boolean;
};

/**
 * Get the text of the verse's word. This is used to show textUthmani as a fallback
 * until V1/V2 font faces of the current word's page (e.g. p1-v1 or p50-v2) has finished downloading.
 *
 * @param {string} qpcUthmaniHafs
 * @param {string} textCodeV1
 * @param {string} textCodeV2
 * @param {QuranFont} font
 * @param {boolean} isFontLoaded
 * @returns {string}
 */
const getWordText = (
  qpcUthmaniHafs: string,
  textCodeV1: string,
  textCodeV2: string,
  font: QuranFont,
  isFontLoaded: boolean,
): string => {
  if (!isFontLoaded) {
    return qpcUthmaniHafs;
  }
  return font === QuranFont.MadaniV1 ? textCodeV1 : textCodeV2;
};

const GlyphWord = ({
  qpcUthmaniHafs,
  textCodeV1,
  textCodeV2,
  pageNumber,
  font,
  isFontLoaded,
}: UthmaniWordTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranTextFontScale, mushafLines } = quranReaderStyles;
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: getWordText(qpcUthmaniHafs, textCodeV1, textCodeV2, font, isFontLoaded),
      }}
      data-font-scale={quranTextFontScale}
      data-font={font}
      className={classNames(styles.styledWord, {
        [styles.fallbackText]: !isFontLoaded,
        [styles[getFontClassName(FALLBACK_FONT, quranTextFontScale, mushafLines, true)]]:
          !isFontLoaded,
      })}
      {...(isFontLoaded && {
        // eslint-disable-next-line i18next/no-literal-string
        style: { fontFamily: `p${pageNumber}-${font.replace('code_', '')}` },
      })}
    />
  );
};
export default GlyphWord;
