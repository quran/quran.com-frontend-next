import React from 'react';
import { useSelector } from 'react-redux';
import VerseType from '../../../types/VerseType';
import QuranPageView from './QuranPageView';
import TranslationView from './TranslationView';
import { selectReadingMode } from '../../redux/slices/QuranReader/readingMode';
import ReadingView from './types';

type QuranReaderProps = {
  verses: VerseType[];
};

const QuranReader = ({ verses }: QuranReaderProps) => {
  const readingMode = useSelector(selectReadingMode);

  if (readingMode === ReadingView.QuranPage) {
    return <QuranPageView verses={verses} />;
  }

  return <TranslationView verses={verses} />;
};

export default QuranReader;
