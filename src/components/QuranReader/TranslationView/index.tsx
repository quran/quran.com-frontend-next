import React from 'react';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => {
  return (
    <div className={styles.container}>
      {verses.map((verse) => (
        <TranslationViewCell verse={verse} key={verse.id} quranReaderStyles={quranReaderStyles} />
      ))}
    </div>
  );
};

export default TranslationView;
