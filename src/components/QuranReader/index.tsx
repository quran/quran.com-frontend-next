/* eslint-disable react/no-multi-comp */
import React, { useCallback } from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import ContextMenu from './ContextMenu';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import Notes from './Notes/Notes';
import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from './observer';
import styles from './QuranReader.module.scss';
import QuranReaderView from './QuranReaderView';
import SidebarNavigation from './SidebarNavigation/SidebarNavigation';

import useGlobalIntersectionObserver from 'src/hooks/useGlobalIntersectionObserver';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectReadingPreference } from 'src/redux/slices/QuranReader/readingPreferences';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import { selectIsSidebarNavigationVisible } from 'src/redux/slices/QuranReader/sidebarNavigation';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType, ReadingPreference } from 'types/QuranReader';

type QuranReaderProps = {
  initialData: VersesResponse;
  id: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
  quranReaderDataType?: QuranReaderDataType;
};

const QuranReader = ({
  initialData,
  id,
  quranReaderDataType = QuranReaderDataType.Chapter,
}: QuranReaderProps) => {
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
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

  return (
    <>
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
      <div
        className={classNames(styles.container, {
          [styles.withVisibleSideBar]: isSideBarVisible,
          [styles.withSidebarNavigationOpen]: isSidebarNavigationVisible,
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
