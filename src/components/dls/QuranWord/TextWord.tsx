import React, { useMemo } from 'react';

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
  '\u06D6', // Arabic small high meem (ۖ)
  '\u06D7', // Arabic small high qaf (ۗ)
  '\u06D8', // Arabic small high noon (ۘ)
  '\u06D9', // Arabic small high meem (ۙ)
  '\u06DA', // Arabic small high lam alef (ۚ)
  '\u06DB', // Arabic small high jeem (ۛ)
  '\u06DC', // Arabic small high seen (ۜ)
  '\u06E2', // Arabic small high madda (ۢ)
  '\u0615', // Arabic small high tah (ؕ)
]);

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textIndopak: INDO_PAK,
});

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType }) => {
  const mappedFont = UTHMANI_HAFS_FONTS[font];
  const isIndoPakFont = mappedFont === INDO_PAK;
  const hasIndoPakStopSign = useMemo(
    () => isIndoPakFont && Array.from(text).some((char) => INDO_PAK_STOP_SIGN_CHARS.has(char)),
    [isIndoPakFont, text],
  );
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
