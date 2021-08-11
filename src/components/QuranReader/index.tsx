import React from 'react';
import { useSelector } from 'react-redux';
import { camelizeKeys } from 'humps';
import InfiniteScroll from 'react-infinite-scroller';
import { useSWRInfinite } from 'swr';
import { VersesResponse } from 'types/APIResponses';
import Chapter from 'types/Chapter';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import {
  selectTranslations,
  TranslationsSettings,
} from 'src/redux/slices/QuranReader/translations';
import classNames from 'classnames';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import PageView from './PageView';
import TranslationView from './TranslationView';
import { ReadingView } from './types';
import { makeVersesUrl } from '../../utils/apiPaths';
import { selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { buildQCFFontFace, isQCFFont } from '../../utils/fontFaceHelper';
import ContextMenu from './ContextMenu';
import Notes from './Notes/Notes';
import styles from './QuranReader.module.scss';
import PlayButton from './PlayButton';

type QuranReaderProps = {
  initialData: VersesResponse;
  chapter: Chapter;
};

const INFINITE_SCROLLER_THRESHOLD = 2000; // Number of pixels before the sentinel reaches the viewport to trigger loadMore()

/**
 * A custom fetcher that returns the verses array from the api result.
 * We need this workaround as useSWRInfinite requires the data from the api
 * to be an array, while the result we get is formatted as {meta: {}, verses: Verse[]}
 */
const verseFetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json().then((data) => camelizeKeys(data.verses));
};

const QuranReader = ({ initialData, chapter }: QuranReaderProps) => {
  const isVerseView = initialData.verses.length === 1;
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { selectedTranslations, isUsingDefaultTranslations } = useSelector(
    selectTranslations,
  ) as TranslationsSettings;
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      // if the response has only 1 verse it means we should set the page to that verse this will be combined with perPage which will be set to only 1.
      const page = isVerseView ? initialData.verses[0].verseNumber : index + 1;
      return makeVersesUrl(chapter.id, {
        page,
        wordFields: `verse_key, verse_id, page_number, location, ${quranReaderStyles.quranFont}`,
        translations: selectedTranslations.join(', '),
        ...(isVerseView && { perPage: 1 }), // the idea is that when it's a verse view, we want to fetch only 1 verse starting from the verse's number and we can do that by passing per_page option to the API.
      });
    },
    verseFetcher,
    {
      initialData: isUsingDefaultTranslations ? initialData.verses : null, // initialData is set to null if the user changes/has changed the default translations so that we can prevent the UI from falling back to the default translations while fetching the verses with the translations the user had selected and we will show a loading indicator instead.
      revalidateOnFocus: false, // disable auto revalidation when window gets focused
      revalidateOnMount: true, // enable automatic revalidation when component is mounted. This is needed when the translations inside initialData don't match with the user preferences and would result in inconsistency either when we first load the QuranReader with pre-saved translations from the persistent store or when we change the translations' preferences after initial load.
    },
  );
  const readingView = useSelector(selectReadingView);
  // if we are fetching the data (this will only happen when the user has changed the default translations so the initialData will be set to null).
  if (!data) {
    return (
      <>
        <ContextMenu />
        <div
          className={classNames(styles.container, {
            [styles.withVisibleSideBar]: isSideBarVisible,
          })}
        >
          <div className={styles.loading}>loading...</div>
        </div>
        <Notes />
      </>
    );
  }
  let view;
  const pageLimit = isVerseView ? 1 : initialData.pagination.totalPages;
  const verses = data.flat(1);
  if (readingView === ReadingView.QuranPage) {
    view = <PageView verses={verses} />;
  } else {
    view = <TranslationView verses={verses} quranReaderStyles={quranReaderStyles} />;
  }

  return (
    <>
      <ContextMenu />
      <div
        className={classNames(styles.container, { [styles.withVisibleSideBar]: isSideBarVisible })}
      >
        <PlayButton chapterId={chapter.chapterNumber} />
        <div className={styles.infiniteScroll}>
          <InfiniteScroll
            initialLoad={false}
            threshold={INFINITE_SCROLLER_THRESHOLD}
            hasMore={size < pageLimit}
            loadMore={() => {
              if (!isValidating) {
                setSize(size + 1);
              }
            }}
          >
            {isQCFFont(quranReaderStyles.quranFont) && (
              <style>{buildQCFFontFace(verses, quranReaderStyles.quranFont)}</style>
            )}
            {view}
          </InfiniteScroll>
        </div>
      </div>
      <Notes />
    </>
  );
};

export default QuranReader;
