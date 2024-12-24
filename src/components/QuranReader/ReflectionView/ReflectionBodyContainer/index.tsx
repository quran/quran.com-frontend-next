import { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import DataFetcher from '@/components/DataFetcher';
import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useGlobalIntersectionObserverWithDelay from '@/hooks/useGlobalIntersectionObserverWithDelay';
import { isLoggedIn } from '@/utils/auth/login';
import { postReflectionViews } from '@/utils/auth/qf/api';
import {
  makeAyahReflectionsUrl,
  postReflectionViews as postReflectionViewsToQuranReflect,
} from '@/utils/quranReflect/apiPaths';
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

const ReflectionBodyContainer = ({
  render,
  initialChapterId,
  initialVerseNumber,
  scrollToTop,
}: ReflectionBodyProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const { lang } = useTranslation();

  /**
   * Handle when the reflection is viewed:
   *
   * 1. If the user is logged in, we will call QDC's backend API.
   * 2. Otherwise, we will call QR's API directly.
   */
  const onReflectionViewed = useCallback((reflectionContainer: Element) => {
    const postId = reflectionContainer.getAttribute('data-post-id');
    if (isLoggedIn()) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      postReflectionViews(postId).catch(() => {});
    } else {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      postReflectionViewsToQuranReflect(postId).catch(() => {});
    }
  }, []);
  useGlobalIntersectionObserverWithDelay(
    { threshold: 1 },
    onReflectionViewed,
    REFLECTIONS_OBSERVER_ID,
    'postId',
    'countAsViewedAfter',
  );

  const renderBody = useCallback(
    (data: AyahReflectionsResponse) => (
      <ReflectionBody
        data={data}
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        setSelectedVerseNumber={setSelectedVerseNumber}
        scrollToTop={scrollToTop}
      />
    ),
    [scrollToTop, selectedChapterId, selectedVerseNumber],
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
