import React from 'react';

import QuranReaderView from './QuranReaderView';

import useQcfFont from 'src/hooks/useQcfFont';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import Verse from 'types/Verse';

interface Props {
  verses: Verse[];
  isReadingPreference: boolean;
  quranReaderStyles: QuranReaderStyles;
}

const QuranReaderBody: React.FC<Props> = ({ quranReaderStyles, verses, isReadingPreference }) => {
  useQcfFont(quranReaderStyles.quranFont, verses);
  return (
    <>
      <QuranReaderView
        verses={verses}
        isReadingPreference={isReadingPreference}
        quranReaderStyles={quranReaderStyles}
      />
    </>
  );
};

export default QuranReaderBody;
