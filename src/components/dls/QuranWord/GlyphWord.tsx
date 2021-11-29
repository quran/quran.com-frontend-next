/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';

import styles from './GlyphWord.module.scss';

import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type UthmaniWordTextProps = {
  word: Word;
  font: QuranFont;
  isFontLoaded: boolean;
};

/**
 * Get the text of the verse's word. This is used to show textUthmani as a fallback
 * until V1/V2 font faces of the current word's page (e.g. p1-v1 or p50-v2) has finished downloading.
 *
 * @param {Word} word
 * @param {QuranFont} font
 * @param {boolean} isFontLoaded
 * @returns {string}
 */
const getWordText = (word: Word, font: QuranFont, isFontLoaded: boolean): string => {
  if (!isFontLoaded) {
    return word.textUthmani;
  }
  return font === QuranFont.MadaniV1 ? word.codeV1 : word.codeV2;
};

const GlyphWord = ({ word, font, isFontLoaded }: UthmaniWordTextProps) => {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: getWordText(word, font, isFontLoaded) }}
      className={classNames(styles.styledWord, { [styles.uthmanicText]: !isFontLoaded })}
      {...(isFontLoaded && {
        // eslint-disable-next-line i18next/no-literal-string
        style: { fontFamily: `p${word.pageNumber}-${font.replace('code_', '')}` },
      })}
    />
  );
};
export default GlyphWord;
