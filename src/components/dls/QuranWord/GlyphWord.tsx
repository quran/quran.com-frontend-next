/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';

import styles from './GlyphWord.module.scss';

type UthmaniWordTextProps = {
  text: string;
  pageNumber: number;
  font: string;
};

const GlyphWord = ({ text, pageNumber, font }: UthmaniWordTextProps) => (
  <span
    dangerouslySetInnerHTML={{ __html: text }}
    className={classNames(
      styles.styledWord,
      styles[`word-${pageNumber}-${font.replace('code_', '')}`],
    )}
  />
);
export default GlyphWord;
