/* eslint-disable @next/next/no-img-element */
import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './TajweedWordImage.module.scss';

import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { makeCDNUrl } from '@/utils/cdn';

interface Props {
  path: string;
  alt: string;
}

const FONT_SIZE_CLASS_MAP = {
  1: styles.xs,
  2: styles.sm,
  3: styles.md,
  4: styles.lg,
  5: styles.xl,
  6: styles.xl2,
  7: styles.xl3,
  8: styles.xl4,
  9: styles.xl5,
  10: styles.xl6,
};

const TajweedWord: React.FC<Props> = ({ path, alt }) => {
  const { quranTextFontScale } = useSelector(selectQuranReaderStyles);
  return (
    <span className={classNames(styles.imageContainer, FONT_SIZE_CLASS_MAP[quranTextFontScale])}>
      <img src={`${makeCDNUrl(`images/${path}`)}`} alt={alt} />
    </span>
  );
};

export default TajweedWord;
