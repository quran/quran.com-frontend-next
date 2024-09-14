/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';

import useSyncReadingProgress from './hooks/useSyncReadingProgress';
import ReadingPreferenceSwitcher from './ReadingPreferenceSwitcher';
import TranslationView from './TranslationView';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from '@/types/QuranReader';
import { VersesResponse } from 'types/ApiResponses';

const ReadingView = dynamic(() => import('./ReadingView'));

interface Props {
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  resourceId: number | string;
}

const QuranReaderView: React.FC<Props> = ({
  isReadingPreference,
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
}) => {
  useSyncReadingProgress({
    isReadingPreference,
  });

  if (isReadingPreference) {
    return (
      <>
        <ReadingPreferenceSwitcher />
        <ReadingView
          quranReaderStyles={quranReaderStyles}
          quranReaderDataType={quranReaderDataType}
          initialData={initialData}
          resourceId={resourceId}
        />
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
        resourceId={resourceId}
      />
    </>
  );
};

export default QuranReaderView;
