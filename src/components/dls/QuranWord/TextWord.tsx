import React from 'react';

import classNames from 'classnames';
import { decamelizeKeys } from 'humps';

import styles from './TextWord.module.scss';

import { CharType } from 'types/Word';

type MadaniWordTextProps = {
  text: string;
  font: string;
  charType: CharType;
};

const DEFAULT_FONT_FAMILY = 'UthmanicHafs';
const INDO_PAK = 'IndoPak';
// Includes the Arabic small high marks and waqf symbols that appear in IndoPak script
const INDO_PAK_STOP_SIGN_CHARS = new Set([
  '\u06D6',
  '\u06D7',
  '\u06D8',
  '\u06D9',
  '\u06DA',
  '\u06DB',
  '\u06DC',
  '\u06E2',
  '\u0615',
]);

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textIndopak: INDO_PAK,
});

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType }) => {
  const mappedFont = UTHMANI_HAFS_FONTS[font];
  const isIndoPakFont = mappedFont === INDO_PAK;
  const hasIndoPakStopSign =
    isIndoPakFont && Array.from(text).some((char) => INDO_PAK_STOP_SIGN_CHARS.has(char));

  return (
    <span
      className={classNames(styles.word, {
        [styles[DEFAULT_FONT_FAMILY]]:
          charType === CharType.End || !mappedFont || mappedFont === DEFAULT_FONT_FAMILY,
        [styles[INDO_PAK]]: isIndoPakFont,
        [styles.hasIndoPakStopSign]: hasIndoPakStopSign,
      })}
    >
      {text}
    </span>
  );
};

export default TextWord;
