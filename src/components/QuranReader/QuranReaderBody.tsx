import React from 'react';

import QuranReaderView from './QuranReaderView';

import useQcfFont from 'src/hooks/useQcfFont';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

interface Props {
  verses: Verse[];
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
}

const QuranReaderBody: React.FC<Props> = ({
  quranReaderStyles,
  verses,
  isReadingPreference,
  quranReaderDataType,
}) => {
  useQcfFont(quranReaderStyles.quranFont, verses);
  return (
    <>
      <QuranReaderView
        verses={verses}
        isReadingPreference={isReadingPreference}
        quranReaderStyles={quranReaderStyles}
        quranReaderDataType={quranReaderDataType}
      />
    </>
  );
};

export default QuranReaderBody;
