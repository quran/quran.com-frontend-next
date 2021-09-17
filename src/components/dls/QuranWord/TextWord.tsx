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

const DEFAULT_FONT_FAMILY = 'UthmanicHafs1Ver17';
const ME_QURAN = 'meQuran';
const INDO_PAK = 'IndoPak';

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textUthmani: ME_QURAN,
  textIndopak: INDO_PAK,
});

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType }) => (
  <span
    className={classNames(styles.word, {
      [styles[DEFAULT_FONT_FAMILY]]:
        charType === CharType.End ||
        !UTHMANI_HAFS_FONTS[font] ||
        UTHMANI_HAFS_FONTS[font] === DEFAULT_FONT_FAMILY,
      [styles[ME_QURAN]]: charType !== CharType.End && UTHMANI_HAFS_FONTS[font] === ME_QURAN,
      [styles[INDO_PAK]]: charType !== CharType.End && UTHMANI_HAFS_FONTS[font] === INDO_PAK,
    })}
  >
    {text}
  </span>
);

export default TextWord;
