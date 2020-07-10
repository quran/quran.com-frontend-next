import React from 'react';
import VerseType from '../../../types/VerseType';
import MushafView from './MushafView';
import TranslationView from './TranslationView';

type QuranReaderProps = {
  view: 'translation' | 'reading';
  verses: VerseType[];
};

const QuranReader = ({ view, verses }: QuranReaderProps) => {
  if (view === 'reading') {
    return <MushafView verses={verses} />;
  }

  return <TranslationView verses={verses} />;
};

export default QuranReader;
