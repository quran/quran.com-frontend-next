/* eslint-disable @next/next/no-img-element */
import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './TajweedWord.module.scss';

import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';

interface Props {
  path: string;
  location: string;
}

const FONT_SIZE_CLASS_MAP = {
  1: styles.xs,
  2: styles.sm,
  3: styles.md,
  4: styles.lg,
  5: styles.xl,
};

const STATIC_QURAN_PATH = 'https://static.quran.com';

const TajweedWord: React.FC<Props> = ({ path, location }) => {
  const { quranTextFontScale } = useSelector(selectQuranReaderStyles);
  return (
    <span className={classNames(styles.imageContainer, FONT_SIZE_CLASS_MAP[quranTextFontScale])}>
      <img src={`${STATIC_QURAN_PATH}/${path}`} alt={location} />
    </span>
  );
};

export default TajweedWord;
