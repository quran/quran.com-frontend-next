import React from 'react';
import Verse from '../../../../types/Verse';
import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

type TranslationViewProps = {
  verses: Verse[];
};

const TranslationView = ({ verses }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <TranslationViewCell verse={verse} key={verse.id} />
    ))}
  </div>
);

export default TranslationView;
