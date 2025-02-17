import { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionBodyContainer.module.scss';

import DataFetcher from '@/components/DataFetcher';
import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import NewLabel from '@/dls/Badge/NewLabel';
import Tabs from '@/dls/Tabs/Tabs';
import useGlobalIntersectionObserverWithDelay from '@/hooks/useGlobalIntersectionObserverWithDelay';
import { isLoggedIn } from '@/utils/auth/login';
import { postReflectionViews } from '@/utils/auth/qf/api';
import { logEvent } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import {
  makeAyahReflectionsUrl,
  postReflectionViews as postReflectionViewsToQuranReflect,
  REFLECTION_POST_TYPE_ID,
  LESSON_POST_TYPE_ID,
} from '@/utils/quranReflect/apiPaths';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';
import ContentType from 'types/QuranReflect/ContentType';

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
  initialContentType?: ContentType;
};

const ReflectionBodyContainer = ({
  render,
  initialChapterId,
  initialVerseNumber,
  scrollToTop,
  initialContentType = ContentType.REFLECTIONS,
}: ReflectionBodyProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedContentType, setSelectedContentType] = useState(initialContentType);
  const { lang, t } = useTranslation();

  const tabs = [
    { title: t('common:reflections'), value: ContentType.REFLECTIONS },
    {
      title: (
        <div className={styles.titleContainer}>
          {t('common:lessons')}
          <NewLabel />
        </div>
      ),
      value: ContentType.LESSONS,
    },
  ];

  const handleTabChange = (value: ContentType) => {
    logEvent('reflection_view_tab_change', { tab: value });
    setSelectedContentType(value);
    const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
    const newUrl =
      value === ContentType.REFLECTIONS
        ? getVerseReflectionNavigationUrl(verseKey)
        : getVerseLessonNavigationUrl(verseKey);
    fakeNavigate(newUrl, lang);
  };

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
        selectedContentType={selectedContentType}
      />
    ),
    [scrollToTop, selectedChapterId, selectedVerseNumber, selectedContentType],
  );

  const body = (
    <>
      {/* @ts-ignore */}
      <Tabs tabs={tabs} selected={selectedContentType} onSelect={handleTabChange} />
      <DataFetcher
        loading={TafsirSkeleton}
        queryKey={makeAyahReflectionsUrl({
          surahId: selectedChapterId,
          ayahNumber: selectedVerseNumber,
          locale: lang,
          reviewed: true,
          postTypeIds: [
            selectedContentType === ContentType.REFLECTIONS
              ? REFLECTION_POST_TYPE_ID
              : LESSON_POST_TYPE_ID,
          ],
        })}
        render={renderBody}
      />
    </>
  );

  return render({
    surahAndAyahSelection: (
      <ReflectionSurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        setSelectedChapterId={setSelectedChapterId}
        setSelectedVerseNumber={setSelectedVerseNumber}
        selectedContentType={selectedContentType}
      />
    ),
    body,
  });
};

export default ReflectionBodyContainer;
