/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';

import useSyncReadingProgress from './hooks/useSyncReadingProgress';
import StudyModeContainer from './StudyModeContainer';
import TranslationView from './TranslationView';
import VerseActionModalContainer from './VerseActionModalContainer';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType, ReadingPreference } from '@/types/QuranReader';
import { VersesResponse } from 'types/ApiResponses';

const ReadingView = dynamic(() => import('./ReadingView'));

interface Props {
  isReadingPreference: boolean;
  readingPreference: ReadingPreference;
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  resourceId: number | string;
  isReadingModeQueryParamDifferent: boolean;
}

const QuranReaderView: React.FC<Props> = ({
  isReadingPreference,
  readingPreference,
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
  isReadingModeQueryParamDifferent,
}) => {
  useSyncReadingProgress({
    isReadingPreference,
  });

  if (isReadingPreference) {
    return (
      <>
        <ReadingView
          quranReaderStyles={quranReaderStyles}
          quranReaderDataType={quranReaderDataType}
          initialData={initialData}
          resourceId={resourceId}
          readingPreference={readingPreference}
          isReadingModeQueryParamDifferent={isReadingModeQueryParamDifferent}
        />
        <StudyModeContainer />
        <VerseActionModalContainer />
      </>
    );
  }

  return (
    <>
      <TranslationView
        quranReaderStyles={quranReaderStyles}
        quranReaderDataType={quranReaderDataType}
        initialData={initialData}
        resourceId={resourceId}
        isReadingModeQueryParamDifferent={isReadingModeQueryParamDifferent}
      />
      <StudyModeContainer />
      <VerseActionModalContainer />
    </>
  );
};

export default QuranReaderView;
