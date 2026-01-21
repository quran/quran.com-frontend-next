/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import { getReflectionTabs, handleReflectionViewed } from './helpers';
import styles from './ReflectionBodyContainer.module.scss';

import DataFetcher from '@/components/DataFetcher';
import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import SelectionList from '@/dls/SelectionList';
import Tabs from '@/dls/Tabs/Tabs';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useGlobalIntersectionObserverWithDelay from '@/hooks/useGlobalIntersectionObserverWithDelay';
import {
  selectReflectionLanguages,
  setReflectionLanguages,
} from '@/redux/slices/QuranReader/readingPreferences';
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
import { getReflectionLanguageItems } from '@/utils/quranReflect/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';
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
  render: (renderProps: {
    surahAndAyahSelection: JSX.Element;
    languageSelection: JSX.Element;
    body: JSX.Element;
  }) => JSX.Element;
  initialContentType?: ContentType;
  isModal?: boolean;
  showEndActions?: boolean;
  showTabs?: boolean;
};

const ReflectionBodyContainer = ({
  render,
  initialChapterId,
  initialVerseNumber,
  scrollToTop,
  initialContentType = ContentType.REFLECTIONS,
  isModal = false,
  showEndActions = true,
  showTabs = true,
}: ReflectionBodyProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedContentType, setSelectedContentType] = useState(initialContentType);

  // Sync local state when initial props change (e.g., when navigating verses in Study Mode)
  useEffect(() => {
    setSelectedChapterId(initialChapterId);
    setSelectedVerseNumber(initialVerseNumber);
  }, [initialChapterId, initialVerseNumber]);

  // Sync content type when initial prop changes
  useEffect(() => {
    setSelectedContentType(initialContentType);
  }, [initialContentType]);

  const { lang, t } = useTranslation();
  const dispatch = useDispatch();
  const storedLanguages = useSelector(selectReflectionLanguages);
  const selectedLanguages = useMemo(
    () => storedLanguages || [lang] || ['en'],
    [storedLanguages, lang],
  );
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  const handleLanguageChange = useCallback(
    (newLanguages: string[]) => {
      onSettingsChange(
        'selectedReflectionLanguages',
        newLanguages,
        setReflectionLanguages(newLanguages),
        setReflectionLanguages(selectedLanguages),
        PreferenceGroup.READING,
      );
      dispatch(setReflectionLanguages(newLanguages));
    },
    [dispatch, onSettingsChange, selectedLanguages],
  );

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

  useGlobalIntersectionObserverWithDelay(
    { threshold: 1 },
    handleReflectionViewed,
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
        isModal={isModal}
        hideEndActions={!showEndActions}
      />
    ),
    [
      scrollToTop,
      selectedChapterId,
      selectedVerseNumber,
      selectedContentType,
      isModal,
      showEndActions,
    ],
  );

  const dataFetcher = (
    <DataFetcher
      loading={TafsirSkeleton}
      queryKey={makeAyahReflectionsUrl({
        surahId: selectedChapterId,
        ayahNumber: selectedVerseNumber,
        locales: selectedLanguages,
        postTypeIds: [
          selectedContentType === ContentType.REFLECTIONS
            ? REFLECTION_POST_TYPE_ID
            : LESSON_POST_TYPE_ID,
        ],
      })}
      render={renderBody}
    />
  );

  const body = (
    <div className={styles.tabsContainerWrapper}>
      {showTabs && (
        <Tabs
          tabs={getReflectionTabs(t, isModal)}
          selected={selectedContentType}
          onSelect={handleTabChange}
          className={styles.tab}
          containerClassName={styles.tabsContainer}
          activeClassName={styles.tabActive}
        />
      )}
      {isModal && showTabs ? (
        <div className={styles.reflectionDataContainer}>{dataFetcher}</div>
      ) : (
        dataFetcher
      )}
    </div>
  );

  const languageSelection = (
    <SelectionList
      id="reflection-languages"
      title={t('common:languages')}
      items={getReflectionLanguageItems()}
      selectedValues={selectedLanguages}
      onChange={handleLanguageChange}
      minimumRequired={1}
      isPortalled={false}
    />
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
    languageSelection,
    body,
  });
};

export default ReflectionBodyContainer;
