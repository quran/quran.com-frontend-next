/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';

import styles from './GlyphWord.module.scss';

import { QuranFont } from 'types/QuranReader';

type UthmaniWordTextProps = {
  textUthmani: string;
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
 * @param {string} textUthmani
 * @param {string} textCodeV1
 * @param {string} textCodeV2
 * @param {QuranFont} font
 * @param {boolean} isFontLoaded
 * @returns {string}
 */
const getWordText = (
  textUthmani: string,
  textCodeV1: string,
  textCodeV2: string,
  font: QuranFont,
  isFontLoaded: boolean,
): string => {
  if (!isFontLoaded) {
    return textUthmani;
  }
  return font === QuranFont.MadaniV1 ? textCodeV1 : textCodeV2;
};

const GlyphWord = ({
  textUthmani,
  textCodeV1,
  textCodeV2,
  pageNumber,
  font,
  isFontLoaded,
}: UthmaniWordTextProps) => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: getWordText(textUthmani, textCodeV1, textCodeV2, font, isFontLoaded),
      }}
      className={classNames(styles.styledWord, { [styles.fallbackText]: !isFontLoaded })}
      {...(isFontLoaded && {
        // eslint-disable-next-line i18next/no-literal-string
        style: { fontFamily: `p${pageNumber}-${font.replace('code_', '')}` },
      })}
    />
  );
};
export default GlyphWord;
