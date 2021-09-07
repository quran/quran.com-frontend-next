import React from 'react';
import { decamelizeKeys } from 'humps';
import { CharType } from 'types/Word';
import classNames from 'classnames';
import styles from './TextWord.module.scss';

type MadaniWordTextProps = {
  text: string;
  font: string;
  charType: CharType;
};

const DEFAULT_FONT_FAMILY = 'UthmanicHafs1Ver17';
const INDO_PAK = 'IndoPak';

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textIndopak: INDO_PAK,
});

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType }) => (
  <span
    className={classNames(styles.word, {
      [styles[DEFAULT_FONT_FAMILY]]:
        charType === CharType.End ||
        !UTHMANI_HAFS_FONTS[font] ||
        UTHMANI_HAFS_FONTS[font] === DEFAULT_FONT_FAMILY,
      [styles[INDO_PAK]]: charType !== CharType.End && UTHMANI_HAFS_FONTS[font] === INDO_PAK,
    })}
  >
    {text}
  </span>
);

export default TextWord;
