import React from 'react';
import { useSelector } from 'react-redux';
import VerseType from '../../../types/VerseType';
import QuranPageView from './QuranPageView';
import TranslationView from './TranslationView';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import { ReadingView } from './types';

type QuranReaderProps = {
  verses: VerseType[];
};

const QuranReader = ({ verses }: QuranReaderProps) => {
  const readingView = useSelector(selectReadingView);

  if (readingView === ReadingView.QuranPage) {
    return <QuranPageView verses={verses} />;
  }

  return <TranslationView verses={verses} />;
};

export default QuranReader;
