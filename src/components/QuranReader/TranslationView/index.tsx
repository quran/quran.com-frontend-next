import React from 'react';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses }: TranslationViewProps) => {
  return (
    <div className={styles.container}>
      {verses.map((verse) => (
        <TranslationViewCell verse={verse} key={verse.id} />
      ))}
    </div>
  );
};

export default TranslationView;
