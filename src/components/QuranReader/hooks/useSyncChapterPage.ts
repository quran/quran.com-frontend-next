import { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { useGetFirstPageNumberForChapter } from '@/utils/chapter-pages';

/**
 * A hook that synchronizes the chapter and page in the lastReadVerse Redux state.
 * When the chapter changes, it updates the page to the first page of that chapter.
 *
 * @param {any} [externalChaptersData] - Optional external chapters data to use instead of context
 */
const useSyncChapterPage = (externalChaptersData?: any): void => {
  const dispatch = useDispatch();
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const chaptersData = useContext(DataContext);

  // Create the getFirstPage function using the hook - always call hooks unconditionally
  const getFirstPage = useGetFirstPageNumberForChapter(
    lastReadVerseKey?.chapterId || '',
    quranReaderStyles.quranFont,
    quranReaderStyles.mushafLines,
    externalChaptersData || chaptersData,
  );

  // Update lastReadVerse page when chapter changes
  useEffect(() => {
    // Only proceed if we have a chapter ID and the getFirstPage function
    if (lastReadVerseKey?.chapterId && getFirstPage) {
      // Call the function to get the first page number
      getFirstPage().then((firstPageNumber) => {
        if (firstPageNumber && firstPageNumber !== lastReadVerseKey.page) {
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
      });
    }
  }, [chaptersData, dispatch, getFirstPage, lastReadVerseKey]);
};

export default useSyncChapterPage;
