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
import { VersesResponse } from 'types/ApiResponses';

/**
 * A hook that synchronizes the chapter and page in the lastReadVerse Redux state.
 * When the chapter changes, it updates the page to the first page of that chapter. This must
 * remain disabled for Page view so we do not override the user's explicit page navigation.
 *
 * @param {VersesResponse} [initialData] - Optional external chapters data to use instead of context
 * @param {boolean} [shouldSync=true] - Whether the synchronization should run.
 */
const useSyncChapterPage = (initialData?: VersesResponse, shouldSync = true): void => {
  const dispatch = useDispatch();
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const chaptersData = useContext(DataContext);

  const canLookupPages = shouldSync && !!lastReadVerseKey?.chapterId;
  const { data: pagesLookupData } = useFetchPagesLookup(
    canLookupPages ? String(lastReadVerseKey.chapterId) : null,
    QuranReaderDataType.Chapter,
    initialData,
    quranReaderStyles,
    isUsingDefaultFont,
  );

  const firstPageNumber = useGetFirstPageNumberForChapter(
    canLookupPages ? pagesLookupData : undefined,
  );

  useEffect(() => {
    if (!shouldSync || !firstPageNumber || !lastReadVerseKey?.chapterId) {
      return;
    }

    const isFirstVerseOfChapter = lastReadVerseKey?.verseKey?.endsWith(':1');
    const isPageMissing = !lastReadVerseKey?.page;

    if (!isPageMissing && !isFirstVerseOfChapter) {
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chaptersData is from context and stable; omitting to prevent unnecessary re-renders
  }, [shouldSync, firstPageNumber, lastReadVerseKey, chaptersData, dispatch]);
};

export default useSyncChapterPage;
