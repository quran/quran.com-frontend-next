import { useContext, useEffect, useRef } from 'react';

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
 * When navigation changes (chapter, juz, page), it updates the page to match the first page.
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

  // Track the previous chapterId to detect navigation between chapters
  const prevChapterIdRef = useRef<string | undefined>(lastReadVerseKey?.chapterId);

  useEffect(() => {
    // Detect if we navigated to a different chapter
    const hasNavigatedToNewChapter = prevChapterIdRef.current !== lastReadVerseKey?.chapterId;
    if (hasNavigatedToNewChapter) {
      prevChapterIdRef.current = lastReadVerseKey?.chapterId;
    }

    if (lastReadVerseKey?.chapterId && firstPageNumber) {
      // Update page if it doesn't match OR if we just navigated to a new chapter
      if (lastReadVerseKey.page !== firstPageNumber || hasNavigatedToNewChapter) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Trigger on firstPageNumber or chapterId changes
  }, [firstPageNumber, lastReadVerseKey?.chapterId, dispatch]);
};

export default useSyncChapterPage;
