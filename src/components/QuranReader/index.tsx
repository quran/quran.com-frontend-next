/* eslint-disable react/no-multi-comp */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import ContextMenu from './ContextMenu';
import { VerseTrackerContextProvider } from './contexts/VerseTrackerContext';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import Notes from './Notes/Notes';
import styles from './QuranReader.module.scss';
import QuranReaderView from './QuranReaderView';
import groupLinesByVerses from './ReadingView/groupLinesByVerses';
import SidebarNavigation from './SidebarNavigation/SidebarNavigation';

import FontPreLoader from '@/components/Fonts/FontPreLoader';
import { selectNotes } from '@/redux/slices/QuranReader/notes';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { QuranReaderDataType, ReadingPreference } from '@/types/QuranReader';
import { VersesResponse } from 'types/ApiResponses';

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
  const { lang } = useTranslation();
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const readingPreference = useSelector(selectReadingPreference) as ReadingPreference;
  const isReadingPreference = readingPreference === ReadingPreference.Reading;

  const lines = useMemo(
    () =>
      Object.values(
        initialData.verses && initialData.verses.length
          ? groupLinesByVerses(initialData.verses)
          : {},
      ),
    [initialData.verses],
  );

  return (
    <>
      <FontPreLoader isQuranReader locale={lang} />
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
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
          style={{
            minHeight: isReadingPreference ? `${Math.min(lines.length * 20, 100)}vh` : undefined,
          }}
        >
          <VerseTrackerContextProvider>
            <QuranReaderView
              isReadingPreference={isReadingPreference}
              quranReaderStyles={quranReaderStyles}
              initialData={initialData}
              quranReaderDataType={quranReaderDataType}
              resourceId={id}
            />
          </VerseTrackerContextProvider>
        </div>
      </div>
      <SidebarNavigation />
      <Notes />
    </>
  );
};

export default QuranReader;
