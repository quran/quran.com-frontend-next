import React from 'react';

import QuranReaderView from './QuranReaderView';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { buildQCFFontFace, isQCFFont } from 'src/utils/fontFaceHelper';
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
  return (
    <>
      {isQCFFont(quranReaderStyles.quranFont) && (
        <style>{buildQCFFontFace(verses, quranReaderStyles.quranFont)}</style>
      )}
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
