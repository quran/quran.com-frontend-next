import React from 'react';

import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroller';
import { shallowEqual, useSelector } from 'react-redux';
import useSWRInfinite from 'swr/infinite';

import { getPageLimit, getRequestKey, verseFetcher } from './api';
import ContextMenu from './ContextMenu';
import EndOfScrollingControls from './EndOfScrollingControls';
import Notes from './Notes/Notes';
import ObserverWindow from './ObserverWindow';
import onCopyQuranWords from './onCopyQuranWords';
import styles from './QuranReader.module.scss';
import ReadingView from './ReadingView';
import TafsirView from './TafsirView';
import TranslationView from './TranslationView';
import { QuranReaderDataType, ReadingPreference } from './types';

import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import { selectIsUsingDefaultReciter, selectReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectReadingPreference } from 'src/redux/slices/QuranReader/readingPreferences';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import {
  selectIsUsingDefaultTafsirs,
  selectSelectedTafsirs,
} from 'src/redux/slices/QuranReader/tafsirs';
import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { buildQCFFontFace, isQCFFont } from 'src/utils/fontFaceHelper';
import { VersesResponse } from 'types/ApiResponses';

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
  const isVerseData = quranReaderDataType === QuranReaderDataType.Verse;
  const isTafsirData = quranReaderDataType === QuranReaderDataType.Tafsir;
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultTafsirs = useSelector(selectIsUsingDefaultTafsirs);
  const selectedTafsirs = useSelector(selectSelectedTafsirs, areArraysEqual);
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
        id,
        reciter: reciter.id,
      }),
    verseFetcher,
    {
      fallbackData:
        isUsingDefaultTranslations && isUsingDefaultTafsirs && isUsingDefaultReciter
          ? initialData.verses
          : null, // initialData is set to null if the user changes/has changed the default translations/tafsirs so that we can prevent the UI from falling back to the default translations while fetching the verses with the translations/tafsirs the user had selected and we will show a loading indicator instead.
      revalidateOnFocus: false, // disable auto revalidation when window gets focused
      revalidateOnMount: true, // enable automatic revalidation when component is mounted. This is needed when the translations inside initialData don't match with the user preferences and would result in inconsistency either when we first load the QuranReader with pre-saved translations from the persistent store or when we change the translations' preferences after initial load.
    },
  );

  const readingPreference = useSelector(selectReadingPreference) as ReadingPreference;
  // if we are fetching the data (this will only happen when the user has changed the default translations/tafsirs so the initialData will be set to null).
  if (!data) {
    return (
      <>
        <div
          className={classNames(styles.container, {
            [styles.withVisibleSideBar]: isSideBarVisible,
          })}
        >
          <Spinner size={SpinnerSize.Large} isCentered />
        </div>
        <Notes />
      </>
    );
  }
  let view;
  const pageLimit = getPageLimit(isVerseData, isTafsirData, initialData);
  const verses = data.flat(1);
  if (quranReaderDataType === QuranReaderDataType.Tafsir) {
    view = <TafsirView verse={verses[0]} />;
  } else if (readingPreference === ReadingPreference.Reading) {
    view = <ReadingView verses={verses} />;
  } else {
    view = <TranslationView verses={verses} quranReaderStyles={quranReaderStyles} />;
  }

  const loadMore = () => {
    if (!isValidating) {
      setSize(size + 1);
    }
  };

  return (
    <>
      <ContextMenu />
      <ObserverWindow isReadingMode={readingPreference === ReadingPreference.Reading} />
      <div
        onCopy={(event) => onCopyQuranWords(event, verses)}
        className={classNames(styles.container, { [styles.withVisibleSideBar]: isSideBarVisible })}
      >
        <div className={styles.infiniteScroll}>
          <InfiniteScroll
            initialLoad={false}
            threshold={INFINITE_SCROLLER_THRESHOLD}
            hasMore={size < pageLimit}
            loadMore={loadMore}
            loader={
              <div className={styles.loadMoreContainer} key={0}>
                {isValidating ? (
                  <Spinner size={SpinnerSize.Large} />
                ) : (
                  <button type="button" onClick={loadMore} disabled={isValidating}>
                    Load More...
                  </button>
                )}
              </div>
            }
          >
            {isQCFFont(quranReaderStyles.quranFont) && (
              <style>{buildQCFFontFace(verses, quranReaderStyles.quranFont)}</style>
            )}
            {view}
          </InfiniteScroll>
          <EndOfScrollingControls
            quranReaderDataType={quranReaderDataType}
            initialData={initialData}
          />
        </div>
      </div>
      <Notes />
    </>
  );
};

export default QuranReader;
