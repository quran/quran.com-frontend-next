/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';

import ReadingPreferenceSwitcher from './ReadingPreferenceSwitcher';
import TafsirView from './TafsirView';
import TranslationView from './TranslationView';

import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

const ReadingView = dynamic(() => import('./ReadingView'));

interface Props {
  isTafsirData: boolean;
  isSelectedTafsirData: boolean;
  isReadingPreference: boolean;
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
}

const QuranReaderView: React.FC<Props> = ({
  isTafsirData,
  isSelectedTafsirData,
  isReadingPreference,
  verses,
  quranReaderStyles,
}) => {
  if (isTafsirData || isSelectedTafsirData) {
    return <TafsirView verse={verses[0]} />;
  }
  if (isReadingPreference) {
    return (
      <>
        <ReadingPreferenceSwitcher />
        <ReadingView verses={verses} quranReaderStyles={quranReaderStyles} />
      </>
    );
  }
  return (
    <>
      <ReadingPreferenceSwitcher />
      <TranslationView verses={verses} quranReaderStyles={quranReaderStyles} />
    </>
  );
};

export default QuranReaderView;
