/* eslint-disable react/no-danger */
import React from 'react';

import styles from './GlyphWord.module.scss';

type UthmaniWordTextProps = {
  text: string;
  pageNumber: number;
  font: string;
};

const GlyphWord = ({ text, pageNumber, font }: UthmaniWordTextProps) => (
  <span
    dangerouslySetInnerHTML={{ __html: text }}
    className={styles.styledWord}
    style={{ fontFamily: `p${pageNumber}-${font.replace('code_', '')}` }}
  />
);
export default GlyphWord;
