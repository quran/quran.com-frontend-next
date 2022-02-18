import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import PlainVerseText from 'src/components/Verse/PlainVerseText';
import useQcfFont from 'src/hooks/useQcfFont';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getVerseWords } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verses: Record<string, Verse>;
}

const TafsirVerseText: React.FC<Props> = ({ verses }) => {
  const { quranFont } = useSelector(selectQuranReaderStyles, shallowEqual);
  useQcfFont(
    quranFont,
    Object.values(verses).map((verse) => ({
      ...verse,
      pageNumber: verse.words[0].pageNumber,
    })),
  );
  const words = Object.values(verses)
    .map((verse) => getVerseWords(verse))
    .flat();
  return <PlainVerseText words={words} />;
};

export default TafsirVerseText;
