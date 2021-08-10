import React from 'react';
import { decamelizeKeys } from 'humps';
import { CharType } from 'types/Word';
import classNames from 'classnames';
import styles from './TextWord.module.scss';

type MadaniWordTextProps = {
  text: string;
  font: string;
  charType: string;
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
      [styles[ME_QURAN]]: UTHMANI_HAFS_FONTS[font] === ME_QURAN,
      [styles[INDO_PAK]]: UTHMANI_HAFS_FONTS[font] === INDO_PAK,
    })}
  >
    {text}
  </span>
);

export default TextWord;
