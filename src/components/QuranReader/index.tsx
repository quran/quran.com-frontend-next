import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import ContextMenu from './ContextMenu';
import { VerseTrackerContextProvider } from './contexts/VerseTrackerContext';
import DebuggingObserverWindow from './DebuggingObserverWindow';
import useSyncChapterPage from './hooks/useSyncChapterPage';
import Notes from './Notes/Notes';
import styles from './QuranReader.module.scss';
import QuranReaderView from './QuranReaderView';
import ReaderTopActions from './ReaderTopActions';

import FontPreLoader from '@/components/Fonts/FontPreLoader';
import { selectNotes } from '@/redux/slices/QuranReader/notes';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { QuranReaderDataType, ReadingPreference } from '@/types/QuranReader';
import isInReadingMode from '@/utils/readingPreference';
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
  const isReadingPreference = isInReadingMode(readingPreference);

  useSyncChapterPage(initialData);

  return (
    <>
      <FontPreLoader isQuranReader locale={lang} />
      <ContextMenu />
      <DebuggingObserverWindow isReadingMode={isReadingPreference} />
      <div
        className={classNames(styles.container, {
          [styles.withVisibleSideBar]: isSideBarVisible,
          [styles.withSidebarNavigationOpenOrAuto]: isSidebarNavigationVisible,
          [styles.translationView]: !isReadingPreference,
        })}
      >
        <div
          className={classNames(styles.infiniteScroll, {
            [styles.readingView]: isReadingPreference,
          })}
        >
          <VerseTrackerContextProvider>
            <ReaderTopActions initialData={initialData} quranReaderDataType={quranReaderDataType} />
            <QuranReaderView
              isReadingPreference={isReadingPreference}
              readingPreference={readingPreference}
              quranReaderStyles={quranReaderStyles}
              initialData={initialData}
              quranReaderDataType={quranReaderDataType}
              resourceId={id}
            />
          </VerseTrackerContextProvider>
        </div>
      </div>
      <Notes />
    </>
  );
};

export default QuranReader;
