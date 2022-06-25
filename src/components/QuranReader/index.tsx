/* eslint-disable react/no-multi-comp */
import React, { useCallback, useContext, useMemo } from 'react';

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import ContextMenu from './ContextMenu';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import Notes from './Notes/Notes';
import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from './observer';
import styles from './QuranReader.module.scss';
import QuranReaderView from './QuranReaderView';
import SidebarNavigation from './SidebarNavigation/SidebarNavigation';

import FontPreLoader from 'src/components/Fonts/FontPreLoader';
import DataContext from 'src/contexts/DataContext';
import useGlobalIntersectionObserver from 'src/hooks/useGlobalIntersectionObserver';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectReadingPreference } from 'src/redux/slices/QuranReader/readingPreferences';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import { selectIsSidebarNavigationVisible } from 'src/redux/slices/QuranReader/sidebarNavigation';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { addReadingSession } from 'src/utils/auth/api';
import { makeReadingSessionsUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType, ReadingPreference } from 'types/QuranReader';

type QuranReaderProps = {
  initialData: VersesResponse;
  id: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
  quranReaderDataType?: QuranReaderDataType;
};

const READING_SESSION_DEBOUNCE_WAIT_TIME = 2000; // 2 seconds

const QuranReader = ({
  initialData,
  id,
  quranReaderDataType = QuranReaderDataType.Chapter,
}: QuranReaderProps) => {
  const { lang } = useTranslation();
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const readingPreference = useSelector(selectReadingPreference) as ReadingPreference;
  const isReadingPreference = readingPreference === ReadingPreference.Reading;
  const chaptersData = useContext(DataContext);
  const dispatch = useDispatch();
  const { cache } = useSWRConfig();

  const addReadingSessionAndClearCache = useCallback(
    (chapterNumber, verseNumber) => {
      addReadingSession(chapterNumber, verseNumber).then(() => {
        cache.delete(makeReadingSessionsUrl());
      });
    },
    [cache],
  );

  const debouncedAddReadingSession = useMemo(
    () => debounce(addReadingSessionAndClearCache, READING_SESSION_DEBOUNCE_WAIT_TIME),
    [addReadingSessionAndClearCache],
  );

  const onElementVisible = useCallback(
    (element: Element) => {
      const lastReadVerse = getObservedVersePayload(element);
      const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(lastReadVerse.verseKey);
      dispatch(
        setLastReadVerse({
          lastReadVerse,
          chaptersData,
        }),
      );

      if (isLoggedIn()) {
        debouncedAddReadingSession(Number(chapterNumber), Number(verseNumber));
      }
    },
    [chaptersData, debouncedAddReadingSession, dispatch],
  );

  useGlobalIntersectionObserver(
    getOptions(isReadingPreference),
    onElementVisible,
    QURAN_READER_OBSERVER_ID,
  );

  return (
    <>
      <FontPreLoader isQuranReader locale={lang} />
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
      {/* <RecentReadingSessions /> */}
      <div
        className={classNames(styles.container, {
          [styles.withVisibleSideBar]: isSideBarVisible,
          [styles.withSidebarNavigationOpenOrAuto]: isSidebarNavigationVisible,
        })}
      >
        <div
          className={classNames(styles.infiniteScroll, {
            [styles.readingView]: isReadingPreference,
          })}
        >
          <QuranReaderView
            isReadingPreference={isReadingPreference}
            quranReaderStyles={quranReaderStyles}
            initialData={initialData}
            quranReaderDataType={quranReaderDataType}
            resourceId={id}
          />
        </div>
      </div>
      <SidebarNavigation />
      <Notes />
    </>
  );
};

export default QuranReader;
