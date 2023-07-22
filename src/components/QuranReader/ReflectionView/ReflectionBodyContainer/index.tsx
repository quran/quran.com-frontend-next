import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { shallowEqual, useSelector } from 'react-redux';

import DataFetcher from '@/components/DataFetcher';
import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useIntersectionObserver from '@/hooks/useGlobalIntersectionObserverWithDelay';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { makeAyahReflectionsUrl, postReflectionViews } from '@/utils/quranReflect/apiPaths';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';

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
};

const OBSERVER_DELAY_FOR_MS = 3000; // 3 seconds

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

  const onReflectionViewed = useCallback((reflectionContainer: Element) => {
    const postId = reflectionContainer.getAttribute('data-post-id');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    postReflectionViews(postId).catch(() => {});
  }, []);
  useIntersectionObserver(
    { threshold: 1 },
    onReflectionViewed,
    REFLECTIONS_OBSERVER_ID,
    'postId',
    OBSERVER_DELAY_FOR_MS,
  );

  const renderBody = useCallback(
    (data: AyahReflectionsResponse) => (
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
      queryKey={makeAyahReflectionsUrl({
        surahId: selectedChapterId,
        ayahNumber: selectedVerseNumber,
        locale: lang,
      })}
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
