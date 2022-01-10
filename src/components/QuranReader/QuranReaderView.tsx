/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';

import ReadingPreferenceSwitcher from './ReadingPreferenceSwitcher';
import TranslationView from './TranslationView';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

const ReadingView = dynamic(() => import('./ReadingView'));

interface Props {
  isReadingPreference: boolean;
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
}

const QuranReaderView: React.FC<Props> = ({
  isReadingPreference,
  verses,
  quranReaderStyles,
  quranReaderDataType,
  initialData,
}) => {
  if (isReadingPreference) {
    return (
      <>
        <ReadingPreferenceSwitcher />
        <ReadingView
          verses={verses}
          quranReaderStyles={quranReaderStyles}
          quranReaderDataType={quranReaderDataType}
        />
      </>
    );
  }
  return (
    <>
      <ReadingPreferenceSwitcher />
      <TranslationView
        verses={verses}
        quranReaderStyles={quranReaderStyles}
        quranReaderDataType={quranReaderDataType}
        initialData={initialData}
      />
    </>
  );
};

export default QuranReaderView;
