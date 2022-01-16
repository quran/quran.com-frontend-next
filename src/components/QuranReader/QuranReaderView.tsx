/* eslint-disable react/no-multi-comp */
import React from 'react';

import ReadingPreferenceSwitcher from './ReadingPreferenceSwitcher';
import TranslationView from './TranslationView';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

// import dynamic from 'next/dynamic';
// const ReadingView = dynamic(() => import('./ReadingView'));

interface Props {
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  id: number | string;
}

const QuranReaderView: React.FC<Props> = ({
  isReadingPreference,
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  id,
}) => {
  if (isReadingPreference) {
    return (
      <>
        <ReadingPreferenceSwitcher />
        {/* <ReadingView
          verses={verses}
          quranReaderStyles={quranReaderStyles}
          quranReaderDataType={quranReaderDataType}
          setSize={setSize}
          initialData={initialData}
        /> */}
      </>
    );
  }
  return (
    <>
      <ReadingPreferenceSwitcher />
      <TranslationView
        quranReaderStyles={quranReaderStyles}
        quranReaderDataType={quranReaderDataType}
        initialData={initialData}
        id={id}
      />
    </>
  );
};

export default QuranReaderView;
