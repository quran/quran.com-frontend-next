import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { camelizeKeys } from 'humps';
import InfiniteScroll from 'react-infinite-scroller';
import { useSWRInfinite } from 'swr';
import { VersesResponse } from 'types/APIResponses';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import {
  selectTranslations,
  TranslationsSettings,
} from 'src/redux/slices/QuranReader/translations';
import classNames from 'classnames';
import { selectTafsirs, TafsirsSettings } from 'src/redux/slices/QuranReader/tafsirs';
import { getDefaultWordFields } from 'src/utils/api';
import { selectIsUsingDefaultReciter, selectReciter } from 'src/redux/slices/AudioPlayer/state';
import Verse from 'types/Verse';
import clipboardCopy from 'clipboard-copy';
import { sortVerseWordPosition } from 'src/utils/verse';
import { selectReadingPreference } from '../../redux/slices/QuranReader/readingPreferences';
import ReadingView from './ReadingView';
import TranslationView from './TranslationView';
import { QuranReaderDataType, ReadingPreference } from './types';
import { makeJuzVersesUrl, makePageVersesUrl, makeVersesUrl } from '../../utils/apiPaths';
import { QuranReaderStyles, selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { buildQCFFontFace, isQCFFont } from '../../utils/fontFaceHelper';
import Notes from './Notes/Notes';
import styles from './QuranReader.module.scss';
import TafsirView from './TafsirView';

type QuranReaderProps = {
  initialData: VersesResponse;
  id: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
  quranReaderDataType?: QuranReaderDataType;
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

const QuranReader = ({
  initialData,
  id,
  quranReaderDataType = QuranReaderDataType.Chapter,
}: QuranReaderProps) => {
  const isVerseData = quranReaderDataType === QuranReaderDataType.Verse;
  const isTafsirData = quranReaderDataType === QuranReaderDataType.Tafsir;
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { selectedTranslations, isUsingDefaultTranslations } = useSelector(
    selectTranslations,
  ) as TranslationsSettings;
  const { selectedTafsirs, isUsingDefaultTafsirs } = useSelector(selectTafsirs) as TafsirsSettings;
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
      initialData:
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
          <div className={styles.loading}>loading...</div>
        </div>
        <Notes />
      </>
    );
  }
  let view;
  const pageLimit = isVerseData || isTafsirData ? 1 : initialData.pagination.totalPages;
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
      <div
        onCopy={() => {
          const selection = window.getSelection();
          const position1 = findWordPositionInNode(selection.anchorNode);
          const position2 = findWordPositionInNode(selection.focusNode);

          // we need to sort the position, otherwise if user select from left to right
          // or bottom to top. The anchor position will > focus position. and it breaks
          // our function
          const [begin, end] = sortVerseWordPosition([position1, position2]);

          console.log(selection);
          console.log(begin, end);

          const words = getWordSelectionArray(begin, end, verses);
          const textToCopy = words.flat().join(' ');
          console.log(textToCopy);
          clipboardCopy(textToCopy);
        }}
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
                <button type="button" onClick={loadMore} disabled={isValidating}>
                  {isValidating ? 'Loading ...' : 'Load More ...'}
                </button>
              </div>
            }
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

interface RequestKeyInput {
  quranReaderDataType: QuranReaderDataType;
  index: number;
  initialData: VersesResponse;
  quranReaderStyles: QuranReaderStyles;
  selectedTranslations: number[];
  selectedTafsirs: number[];
  isVerseData: boolean;
  isTafsirData: boolean;
  id: string | number;
  reciter: number;
}
/**
 * Generate the request key (the API url based on the params)
 * which will be used by useSwr to determine whether to call BE
 * again or return the cached response.
 */
const getRequestKey = ({
  id,
  isVerseData,
  isTafsirData,
  initialData,
  index,
  quranReaderStyles,
  quranReaderDataType,
  selectedTranslations,
  selectedTafsirs,
  reciter,
}: RequestKeyInput): string => {
  // if the response has only 1 verse it means we should set the page to that verse this will be combined with perPage which will be set to only 1.
  const page = isVerseData || isTafsirData ? initialData.verses[0].verseNumber : index + 1;
  if (quranReaderDataType === QuranReaderDataType.Juz) {
    return makeJuzVersesUrl(id, {
      page,
      reciter,
      translations: selectedTranslations.join(', '),
      ...getDefaultWordFields(quranReaderStyles.quranFont),
    });
  }
  if (quranReaderDataType === QuranReaderDataType.Page) {
    return makePageVersesUrl(id, {
      page,
      reciter,
      translations: selectedTranslations.join(', '),
      ...getDefaultWordFields(quranReaderStyles.quranFont),
    });
  }

  if (isTafsirData) {
    return makeVersesUrl(id, {
      page,
      perPage: 1,
      translations: null,
      tafsirs: selectedTafsirs.join(','),
      wordFields: `location, ${quranReaderStyles.quranFont}`,
      tafsirFields: 'resource_name',
    });
  }

  return makeVersesUrl(id, {
    reciter,
    page,
    translations: selectedTranslations.join(', '),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...(isVerseData && { perPage: 1 }), // the idea is that when it's a verse view, we want to fetch only 1 verse starting from the verse's number and we can do that by passing per_page option to the API.
  });
};

export default QuranReader;

const getWordSelectionArray = (start: string, end: string, verses: Verse[]) => {
  const [startChapter, startVerseNumber, startWordPosition] = start.split(':');
  const [endChapter, endVerseNumber, endWordPosition] = end.split(':');

  return verses
    .filter((verse) => {
      const [chapter, verseNumber] = verse.verseKey.split(':');
      return (
        Number(chapter) >= Number(startChapter) &&
        Number(chapter) <= Number(endChapter) &&
        Number(verseNumber) >= Number(startVerseNumber) &&
        Number(verseNumber) <= Number(endVerseNumber)
      );
    })
    .map((verse) => verse.words)
    .map((words) =>
      words
        .filter((word) => {
          const [chapter, verseNumber] = word.verseKey.split(':');
          const { position } = word;

          // filter out unselected word in start verse
          if (
            Number(chapter) === Number(startChapter) &&
            Number(verseNumber) === Number(startVerseNumber) &&
            Number(position) < Number(startWordPosition)
          )
            return false;

          // filter out unselected word in end verse
          if (
            Number(chapter) === Number(endChapter) &&
            Number(verseNumber) === Number(endVerseNumber) &&
            Number(position) > Number(endWordPosition)
          )
            return false;

          return true;
        })
        .map((word) => word.textUthmani),
    );
};

/**
 * given a DOM node, this function will try to get the data attribute 'data-word-position'
 * if it can't find it, it will try to find it in `parentNode`. Repeat until `maxIteration`
 * and return null if it still can't find the `data-word-position'
 *
 * Why we need this function?
 * - When we select the text sometime the focusNode is a text, we need to find the data in the parentNode
 * - sometime it's the node that contains 'data-word-position'. So we don't need to find the parentNode
 * - sometime the node is wrapped with <Tooltip> so we need to find the parentNode of parentNode
 *
 * @param node the DOM Node
 * @param iteration to track how many many iteration we did, so we can when it reaches `maxIteration`
 * @param maxIteration stop the function and return null when it reaches maxIteration
 * @returns wordPosition, example: "2:255:3" -> meaning chapter 2, verse 255, position 3
 */
const findWordPositionInNode = (node, iteration = 0, maxIteration = 3) => {
  if (iteration > maxIteration) return null;

  // if this node is a text, then it doesn't have function `getAttribute`. find it in `parentNode`
  if (!node.getAttribute) {
    return findWordPositionInNode(node.parentNode, iteration + 1);
  }

  const data = node.getAttribute('data-word-position');

  // if can't find the 'data-word-position', find it in the parentNode
  if (!data) {
    return findWordPositionInNode(node.parentNode, iteration + 1);
  }
  return data;
};
