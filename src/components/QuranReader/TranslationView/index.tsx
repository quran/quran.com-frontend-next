import React from 'react';

import TranslationViewCell from './TranslationCell';
import styles from './TranslationView.module.scss';

import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <TranslationViewCell verse={verse} isHighlighted={false} />
    ))}
  </div>
);

export default TranslationView;
