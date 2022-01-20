/* eslint-disable react/no-multi-comp */
/* eslint-disable max-lines */
import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import InfiniteScroll from 'react-infinite-scroller';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRInfinite from 'swr/infinite';

import { getPageLimit, getRequestKey, verseFetcher } from './api';
import ContextMenu from './ContextMenu';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import useSyncReduxAndQueryParams from './hooks/useSyncReduxAndQueryParams';
import Loader from './Loader';
import Loading from './Loading';
import Notes from './Notes/Notes';
import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from './observer';
import onCopyQuranWords from './onCopyQuranWords';
import QueryParamMessage from './QueryParamMessage';
import styles from './QuranReader.module.scss';
import QuranReaderBody from './QuranReaderBody';
import ReadingViewSkeleton from './ReadingView/ReadingViewSkeleton';
import SidebarNavigation from './SidebarNavigation/SidebarNavigation';
import TranslationViewSkeleton from './TranslationView/TranslationViewSkeleton';

import Spinner from 'src/components/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import useGlobalIntersectionObserver from 'src/hooks/useGlobalIntersectionObserver';
import Error from 'src/pages/_error';
import { selectIsUsingDefaultReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import {
  selectIsUsingDefaultWordByWordLocale,
  selectReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import { selectIsSidebarNavigationVisible } from 'src/redux/slices/QuranReader/sidebarNavigation';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectIsUsingDefaultTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { selectIsUsingDefaultTranslations } from 'src/redux/slices/QuranReader/translations';
import { VersesResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
import { QuranFont, QuranReaderDataType, ReadingPreference } from 'types/QuranReader';

const EndOfScrollingControls = dynamic(() => import('./EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

type QuranReaderProps = {
  initialData: VersesResponse;
  id: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
  quranReaderDataType?: QuranReaderDataType;
};

const INFINITE_SCROLLER_THRESHOLD = 2000; // Number of pixels before the sentinel reaches the viewport to trigger loadMore()
const QuranReader = ({
  initialData,
  id,
  quranReaderDataType = QuranReaderDataType.Chapter,
}: QuranReaderProps) => {
  const { lang } = useTranslation();
  const [shouldOverrideQueryParam, setShouldOverrideQueryParam] = useState(false);
  const [shouldPersistQueryParam, setShouldPersistQueryParam] = useState(false);
  const isVerseData = quranReaderDataType === QuranReaderDataType.Verse;
  const isSelectedTafsirData = quranReaderDataType === QuranReaderDataType.SelectedTafsir;
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const {
    value: selectedTranslations,
    queryParamUsed: translationsQueryParamUsed,
  }: { value: number[]; queryParamUsed: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.Translations,
    shouldOverrideQueryParam,
  );
  const {
    value: reciterId,
    queryParamUsed: reciterQueryParamUsed,
  }: { value: number; queryParamUsed: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.Reciter,
    shouldOverrideQueryParam,
  );
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultTafsirs = useSelector(selectIsUsingDefaultTafsirs);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const {
    value: wordByWordLocale,
    queryParamUsed: wordByWordLocaleQueryParamUsed,
  }: { value: string; queryParamUsed: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.WBW_LOCALE,
    shouldOverrideQueryParam,
  );
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  useSyncReduxAndQueryParams(shouldPersistQueryParam);
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      getRequestKey({
        quranReaderDataType,
        index,
        initialData,
        quranReaderStyles,
        selectedTranslations,
        isVerseData,
        isSelectedTafsirData,
        id,
        reciter: reciterId,
        locale: lang,
        wordByWordLocale,
      }),
    verseFetcher,
    {
      fallbackData:
        isUsingDefaultTranslations &&
        isUsingDefaultTafsirs &&
        isUsingDefaultReciter &&
        isUsingDefaultWordByWordLocale &&
        quranReaderStyles.quranFont !== QuranFont.Tajweed // this is because we render TajweedText that is not expecting text.
          ? initialData.verses
          : null, // initialData is set to null if the user changes/has changed the default translations/tafsirs so that we can prevent the UI from falling back to the default translations while fetching the verses with the translations/tafsirs the user had selected and we will show a loading indicator instead.
      revalidateOnFocus: false, // disable auto revalidation when window gets focused
      revalidateOnMount: true, // enable automatic revalidation when component is mounted. This is needed when the translations inside initialData don't match with the user preferences and would result in inconsistency either when we first load the QuranReader with pre-saved translations from the persistent store or when we change the translations' preferences after initial load.
    },
  );
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference) as ReadingPreference;
  const isReadingPreference = readingPreference === ReadingPreference.Reading;
  const onElementVisible = useCallback(
    (element: Element) => {
      dispatch({
        type: setLastReadVerse.type,
        payload: getObservedVersePayload(element),
      });
    },
    [dispatch],
  );
  useGlobalIntersectionObserver(
    getOptions(isReadingPreference),
    onElementVisible,
    QURAN_READER_OBSERVER_ID,
  );
  // if we are fetching the data (this will only happen when the user has changed the default translations/tafsirs so the initialData will be set to null).
  if (!data) {
    return (
      <Loading
        containerClassName={styles.container}
        visibleSideBarClassName={styles.withVisibleSideBar}
        isSideBarVisible={isSideBarVisible}
      />
    );
  }
  const verses = data.flat(1);
  if (!verses.length) {
    return <Error />;
  }
  const loadMore = () => {
    if (!isValidating) {
      setSize(size + 1);
    }
  };
  const hasMore = size < getPageLimit(isVerseData, initialData);

  let loader;
  if (readingPreference === ReadingPreference.Translation) {
    loader = <TranslationViewSkeleton />;
  } else if (readingPreference === ReadingPreference.Reading) {
    loader = <ReadingViewSkeleton />;
  } else {
    loader = (
      <div key={0}>
        <Loader isValidating={isValidating} loadMore={loadMore} />
      </div>
    );
  }

  const urlParamsUsed =
    translationsQueryParamUsed || reciterQueryParamUsed || wordByWordLocaleQueryParamUsed;

  return (
    <>
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
      <div
        onCopy={(event) => onCopyQuranWords(event, verses)}
        className={classNames(styles.container, {
          [styles.withVisibleSideBar]: isSideBarVisible,
          [styles.withSidebarNavigationOpen]: isSidebarNavigationVisible,
        })}
      >
        <div className={styles.infiniteScroll}>
          <InfiniteScroll
            initialLoad={false}
            threshold={INFINITE_SCROLLER_THRESHOLD}
            hasMore={hasMore}
            loadMore={loadMore}
            loader={loader}
          >
            {urlParamsUsed && (
              <QueryParamMessage
                translationsQueryParamUsed={translationsQueryParamUsed}
                reciterQueryParamUsed={reciterQueryParamUsed}
                wordByWordLocaleQueryParamUsed={wordByWordLocaleQueryParamUsed}
                setShouldOverrideQueryParam={setShouldOverrideQueryParam}
                setShouldPersistQueryParam={setShouldPersistQueryParam}
              />
            )}
            <QuranReaderBody
              isReadingPreference={isReadingPreference}
              quranReaderStyles={quranReaderStyles}
              verses={verses}
            />
          </InfiniteScroll>
          {!hasMore && !isValidating && (
            <EndOfScrollingControls
              quranReaderDataType={quranReaderDataType}
              lastVerse={verses[verses.length - 1]}
            />
          )}
        </div>
      </div>
      <SidebarNavigation />
      <Notes />
    </>
  );
};

export default QuranReader;
