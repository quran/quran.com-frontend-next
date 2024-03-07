import React, { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import PlainVerseText from '@/components/Verse/PlainVerseText';
import useQcfFont from '@/hooks/useQcfFont';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getVerseWords } from '@/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verses: Verse[];
  fontScale?: number;
}

const VerseTextPreview: React.FC<Props> = ({ verses, fontScale }) => {
  const { quranFont } = useSelector(selectQuranReaderStyles, shallowEqual);
  const tafsirVerses = useMemo(
    () =>
      Object.values(verses).map((verse) => ({
        ...verse,
        pageNumber: verse.words[0].pageNumber,
      })),
    [verses],
  );
  useQcfFont(quranFont, tafsirVerses);
  const words = useMemo(() => verses.map((verse) => getVerseWords(verse)).flat(), [verses]);
  return <PlainVerseText fontScale={fontScale} words={words} />;
};

export default VerseTextPreview;
