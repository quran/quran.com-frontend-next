import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

/**
 * A hook that gets the continue reading URL for the user.
 * It tries multiple sources in order of priority:
 * 1. Most recent reading session
 * 2. Redux lastReadVerse
 * 3. Default to first surah
 *
 * @returns {string} The continue reading URL
 */
const useGetContinueReadingUrl = (): string => {
  const lastReadVerseFromRedux = useSelector(selectLastReadVerseKey);
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys(false);

  const continueReadingUrl = useMemo(() => {
    // First, try to use the most recent reading session
    const lastReadSession = recentlyReadVerseKeys?.[0];
    if (lastReadSession) {
      return getChapterWithStartingVerseUrl(`${lastReadSession.surah}:${lastReadSession.ayah}`);
    }

    // Fallback to Redux lastReadVerse
    if (lastReadVerseFromRedux?.verseKey) {
      return getChapterWithStartingVerseUrl(lastReadVerseFromRedux.verseKey);
    }

    // Default to first surah
    return getChapterWithStartingVerseUrl('1:1');
  }, [recentlyReadVerseKeys, lastReadVerseFromRedux]);

  return continueReadingUrl;
};

export default useGetContinueReadingUrl;
