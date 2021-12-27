/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';

import ReadingPreferenceSwitcher from './ReadingPreferenceSwitcher';
import TranslationView from './TranslationView';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import Verse from 'types/Verse';

const ReadingView = dynamic(() => import('./ReadingView'));

interface Props {
  isTafsirData: boolean;
  isSelectedTafsirData: boolean;
  isReadingPreference: boolean;
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
}

const QuranReaderView: React.FC<Props> = ({ isReadingPreference, verses, quranReaderStyles }) => {
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
