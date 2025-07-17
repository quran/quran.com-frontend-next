import { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import useFetchPagesLookup from './useFetchPagesLookup';

import DataContext from '@/contexts/DataContext';
import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';
import {
  selectIsUsingDefaultFont,
  selectQuranReaderStyles,
} from '@/redux/slices/QuranReader/styles';
import { QuranReaderDataType } from '@/types/QuranReader';
import { useGetFirstPageNumberForChapter } from '@/utils/chapter-pages';

/**
 * A hook that synchronizes the chapter and page in the lastReadVerse Redux state.
 * When the chapter changes, it updates the page to the first page of that chapter.
 *
 * @param {any} [initialData] - Optional external chapters data to use instead of context
 */
const useSyncChapterPage = (initialData?: any): void => {
  const dispatch = useDispatch();
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const chaptersData = useContext(DataContext);

  const { data: pagesLookupData } = useFetchPagesLookup(
    String(lastReadVerseKey?.chapterId),
    QuranReaderDataType.Chapter,
    initialData,
    quranReaderStyles,
    isUsingDefaultFont,
  );

  const firstPageNumber = useGetFirstPageNumberForChapter(pagesLookupData);

  useEffect(() => {
    if (lastReadVerseKey?.chapterId && firstPageNumber) {
      if (lastReadVerseKey.page !== firstPageNumber) {
        dispatch(
          setLastReadVerse({
            lastReadVerse: {
              ...lastReadVerseKey,
              page: firstPageNumber,
            },
            chaptersData,
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chaptersData is from context and stable; omitting to prevent unnecessary re-renders
  }, [firstPageNumber, lastReadVerseKey, dispatch]);
};

export default useSyncChapterPage;
