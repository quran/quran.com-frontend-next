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

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textIndopak: INDO_PAK,
});

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType }) => {
  const mappedFont = UTHMANI_HAFS_FONTS[font];
  const isIndoPakFont = mappedFont === INDO_PAK;
  return (
    <span
      className={classNames(styles.word, {
        [styles[DEFAULT_FONT_FAMILY]]:
          charType === CharType.End || !mappedFont || mappedFont === DEFAULT_FONT_FAMILY,
        [styles[INDO_PAK]]: isIndoPakFont,
      })}
    >
      {text}
    </span>
  );
};

export default TextWord;
