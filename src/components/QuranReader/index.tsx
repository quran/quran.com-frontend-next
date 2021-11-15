/* eslint-disable react/no-multi-comp */
/* eslint-disable max-lines */
import React, { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import InfiniteScroll from 'react-infinite-scroller';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRInfinite from 'swr/infinite';

import { getPageLimit, getRequestKey, verseFetcher } from './api';
import ContextMenu from './ContextMenu';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import Loader from './Loader';
import Loading from './Loading';
import Notes from './Notes/Notes';
import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from './observer';
import onCopyQuranWords from './onCopyQuranWords';
import styles from './QuranReader.module.scss';
import QuranReaderBody from './QuranReaderBody';

import Spinner from 'src/components/dls/Spinner/Spinner';
import useGlobalIntersectionObserver from 'src/hooks/useGlobalIntersectionObserver';
import { selectIsUsingDefaultReciter, selectReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import {
  selectIsUsingDefaultWordByWordLocale,
  selectReadingPreference,
  selectWordByWordLocale,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import {
  selectIsUsingDefaultTafsirs,
  selectSelectedTafsirs,
} from 'src/redux/slices/QuranReader/tafsirs';
import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType, ReadingPreference } from 'types/QuranReader';

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
  const isVerseData = quranReaderDataType === QuranReaderDataType.Verse;
  const isTafsirData = quranReaderDataType === QuranReaderDataType.Tafsir;
  const isSelectedTafsirData = quranReaderDataType === QuranReaderDataType.SelectedTafsir;
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultTafsirs = useSelector(selectIsUsingDefaultTafsirs);
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const wordByWordLocale = useSelector(selectWordByWordLocale);
  const reciter = useSelector(selectReciter, shallowEqual);
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      getRequestKey({
        quranReaderDataType,
        index,
        initialData,
        quranReaderStyles,
        selectedTranslations,
        selectedTafsirs,
        isVerseData,
        isTafsirData,
        isSelectedTafsirData,
        id,
        reciter: reciter.id,
        locale: lang,
        wordByWordLocale,
      }),
    verseFetcher,
    {
      fallbackData:
        isUsingDefaultTranslations &&
        isUsingDefaultTafsirs &&
        isUsingDefaultReciter &&
        isUsingDefaultWordByWordLocale
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
  const loadMore = () => {
    if (!isValidating) {
      setSize(size + 1);
    }
  };
  const hasMore =
    size < getPageLimit(isVerseData, isTafsirData || isSelectedTafsirData, initialData);
  return (
    <>
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
      <div
        onCopy={(event) => onCopyQuranWords(event, verses)}
        className={classNames(styles.container, { [styles.withVisibleSideBar]: isSideBarVisible })}
      >
        <div className={styles.infiniteScroll}>
          <InfiniteScroll
            initialLoad={false}
            threshold={INFINITE_SCROLLER_THRESHOLD}
            hasMore={hasMore}
            loadMore={loadMore}
            loader={
              <div key={0}>
                <Loader isValidating={isValidating} loadMore={loadMore} />
              </div>
            }
          >
            <QuranReaderBody
              isTafsirData={isTafsirData}
              isSelectedTafsirData={isSelectedTafsirData}
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
      <Notes />
    </>
  );
};

export default QuranReader;
