import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { shallowEqual, useSelector } from 'react-redux';

import DataFetcher from '@/components/DataFetcher';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { makeVerseReflectionsUrl } from '@/utils/apiPaths';

const ReflectionSurahAndAyahSelection = dynamic(() => import('./ReflectionSurahAndAyahSelection'), {
  ssr: false,
});
const ReflectionBody = dynamic(() => import('./ReflectionBody'), {
  ssr: false,
  loading: TafsirSkeleton,
});

type ReflectionBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  scrollToTop: () => void;
  render: (renderProps: { surahAndAyahSelection: JSX.Element; body: JSX.Element }) => JSX.Element;
  initialData?: any;
};

const ReflectionBodyContainer = ({
  render,
  initialChapterId,
  initialVerseNumber,
  scrollToTop,
}: ReflectionBodyProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const { translationFontScale } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { lang } = useTranslation();

  const renderBody = useCallback(
    (data) => (
      <ReflectionBody
        data={data}
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        setSelectedVerseNumber={setSelectedVerseNumber}
        scrollToTop={scrollToTop}
        translationFontScale={translationFontScale}
      />
    ),
    [scrollToTop, selectedChapterId, selectedVerseNumber, translationFontScale],
  );

  const body = (
    <DataFetcher
      loading={TafsirSkeleton}
      queryKey={makeVerseReflectionsUrl(selectedChapterId, selectedVerseNumber, lang)}
      render={renderBody}
    />
  );

  return render({
    surahAndAyahSelection: (
      <ReflectionSurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        setSelectedChapterId={setSelectedChapterId}
        setSelectedVerseNumber={setSelectedVerseNumber}
      />
    ),
    body,
  });
};

export default ReflectionBodyContainer;
