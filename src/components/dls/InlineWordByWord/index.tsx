import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './InlineWordByWord.module.scss';

import { selectWordByWordFontScale } from '@/redux/slices/QuranReader/styles';

const FONT_SIZE_CLASS_MAP = {
  1: styles.xs,
  2: styles.sm,
  3: styles.md,
  4: styles.lg,
  5: styles.xl,
  6: styles.xxl,
};

type Props = {
  text?: string;
  className?: string;
};

const InlineWordByWord: React.FC<Props> = ({ text, className }) => {
  const wordByWordFontScale = useSelector(selectWordByWordFontScale, shallowEqual);
  return (
    <p className={classNames(styles.word, className, FONT_SIZE_CLASS_MAP[wordByWordFontScale])}>
      {text}
    </p>
  );
};

export default InlineWordByWord;
