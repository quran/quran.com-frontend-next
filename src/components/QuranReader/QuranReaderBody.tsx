import React from 'react';

import QuranReaderView from './QuranReaderView';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

interface Props {
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  id: number | string;
}

const QuranReaderBody: React.FC<Props> = ({
  quranReaderStyles,
  isReadingPreference,
  quranReaderDataType,
  initialData,
  id,
}) => (
  <QuranReaderView
    initialData={initialData}
    isReadingPreference={isReadingPreference}
    quranReaderStyles={quranReaderStyles}
    quranReaderDataType={quranReaderDataType}
    id={id}
  />
);

export default QuranReaderBody;
