/* eslint-disable i18next/no-literal-string */
import React from 'react';

import QuranReaderView from './QuranReaderView';

import useQcfFont from 'src/hooks/useQcfFont';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import Verse from 'types/Verse';

interface Props {
  verses: Verse[];
  isTafsirData: boolean;
  isSelectedTafsirData: boolean;
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
}

const QuranReaderBody: React.FC<Props> = ({
  quranReaderStyles,
  verses,
  isTafsirData,
  isSelectedTafsirData,
  isReadingPreference,
}) => {
  useQcfFont(quranReaderStyles.quranFont, verses);
  return (
    <>
      <QuranReaderView
        verses={verses}
        isTafsirData={isTafsirData}
        isSelectedTafsirData={isSelectedTafsirData}
        isReadingPreference={isReadingPreference}
        quranReaderStyles={quranReaderStyles}
      />
    </>
  );
};

export default QuranReaderBody;
