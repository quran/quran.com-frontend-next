import { useContext } from 'react';

import { useDispatch } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';
import { setLastReadVerse } from '@/redux/slices/QuranReader/readingTracker';
import { VersesResponse } from 'types/ApiResponses';

/**
 * A hook that sets the initial page state when navigating to any content type
 * (Surah, Verse, Juz, Page, Hizb, Rub, Range).
 *
 * Uses initialData.verses[0] directly which contains all needed data:
 * - verseKey, chapterId, pageNumber, hizbNumber
 *
 * This works for ALL navigation scenarios (49 combinations × 2 modes = 98 total)
 * and updates IMMEDIATELY on navigation (no scrolling required).
 *
 * Uses useBrowserLayoutEffect to ensure state is set synchronously before paint,
 * so the correct page number is displayed immediately.
 *
 * @param {VersesResponse} initialData - The initial verses data from the page
 */
const useSyncChapterPage = (initialData: VersesResponse): void => {
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  // const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  // const canLookupPages = shouldSync && !!lastReadVerseKey?.chapterId;

  const firstVerse = initialData?.verses?.[0];
  // Use verseKey as the dependency to detect navigation changes
  const firstVerseKey = firstVerse?.verseKey;

  useBrowserLayoutEffect(() => {
    if (!firstVerse) return;

    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          verseKey: firstVerse.verseKey,
          chapterId: String(firstVerse.chapterId),
          page: String(firstVerse.pageNumber),
          hizb: String(firstVerse.hizbNumber),
        },
        chaptersData,
      }),
    );
  }, [firstVerseKey, chaptersData, dispatch, firstVerse]);
};

export default useSyncChapterPage;
