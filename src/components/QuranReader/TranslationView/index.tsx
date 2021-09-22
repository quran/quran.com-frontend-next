import React from 'react';

import { useSelector, shallowEqual } from 'react-redux';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import { selectHighlightedLocation } from 'src/redux/slices/QuranReader/highlightedLocation';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { makeVerseKey } from 'src/utils/verse';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses }: TranslationViewProps) => {
  const { highlightedChapter, highlightedVerse } = useSelector(
    selectHighlightedLocation,
    shallowEqual,
  );
  return (
    <div className={styles.container}>
      {verses.map((verse) => (
        <TranslationViewCell
          verse={verse}
          isHighlighted={verse.verseKey === makeVerseKey(highlightedChapter, highlightedVerse)}
          key={verse.id}
        />
      ))}
    </div>
  );
};

export default TranslationView;
