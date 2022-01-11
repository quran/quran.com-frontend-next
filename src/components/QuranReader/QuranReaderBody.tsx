import React from 'react';

import QuranReaderView from './QuranReaderView';

import useQcfFont from 'src/hooks/useQcfFont';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

interface Props {
  verses: Verse[];
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  size: number;
  setSize: (size: number | ((_size: number) => number)) => Promise<Verse[]>;
}

const QuranReaderBody: React.FC<Props> = ({
  quranReaderStyles,
  verses,
  isReadingPreference,
  quranReaderDataType,
  initialData,
  size,
  setSize,
}) => {
  useQcfFont(quranReaderStyles.quranFont, verses);
  return (
    <>
      <QuranReaderView
        initialData={initialData}
        verses={verses}
        isReadingPreference={isReadingPreference}
        quranReaderStyles={quranReaderStyles}
        quranReaderDataType={quranReaderDataType}
        size={size}
        setSize={setSize}
      />
    </>
  );
};

export default QuranReaderBody;
