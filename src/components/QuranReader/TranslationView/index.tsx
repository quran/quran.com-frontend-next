import React from 'react';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse, index) => (
      <TranslationViewCell verse={verse} isHighlighted={index === 2} />
    ))}
  </div>
);

export default TranslationView;
