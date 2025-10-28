import { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import { getReflectionTabs, handleReflectionViewed } from './helpers';
import styles from './ReflectionBodyContainer.module.scss';

import DataFetcher from '@/components/DataFetcher';
import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import Tabs from '@/dls/Tabs/Tabs';
import useGlobalIntersectionObserverWithDelay from '@/hooks/useGlobalIntersectionObserverWithDelay';
import { logEvent } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import {
  LESSON_POST_TYPE_ID,
  REFLECTION_POST_TYPE_ID,
  makeAyahReflectionsUrl,
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

  const onReflectionViewed = useCallback(handleReflectionViewed, []);

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
      <Tabs
        tabs={getReflectionTabs(t)}
        selected={selectedContentType}
        onSelect={handleTabChange}
        className={styles.tab}
        activeClassName={styles.tabActive}
      />
      <DataFetcher
        loading={TafsirSkeleton}
        queryKey={makeAyahReflectionsUrl({
          surahId: selectedChapterId,
          ayahNumber: selectedVerseNumber,
          locale: lang,
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
