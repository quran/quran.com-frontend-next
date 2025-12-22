import { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { selectRecentReadingSessions } from '@/redux/slices/QuranReader/readingTracker';
import { privateFetcher } from '@/utils/auth/api';
import { makeReadingSessionsUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { makeVerseKey, getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import ReadingSession from 'types/ReadingSession';

type RecentlyReadVerseData = {
  surah: string;
  ayah: string;
};

/**
 * This hook is used to get the recently read verse keys.
 * It will return the verse keys of the recently read verses.
 * If the user is not logged in, it will return the verse keys from local storage.
 * If the user is logged in, it will return the verse keys from the server.
 *
 * @param {boolean} shouldReturnVerseKeysArray - If true, returns verse keys as strings. If false, returns objects with surah and ayah properties.
 * @returns {object} The recently read verse keys and the loading state.
 */
function useGetRecentlyReadVerseKeys<T extends boolean = true>(
  shouldReturnVerseKeysArray: T = true as T,
  shouldAlsoReturnTimestamps: boolean = false,
): {
  recentlyReadVerseKeys: T extends true ? string[] : RecentlyReadVerseData[];
  isLoading: boolean;
  timestamps?: (Date | undefined)[];
} {
  // Get sessions from Redux store (for non-logged in users)
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);

  // Fetch sessions from server (for logged in users)
  const isUserLoggedIn = isLoggedIn();
  const { data, isValidating } = useSWRImmutable<ReadingSession[]>(
    isUserLoggedIn ? makeReadingSessionsUrl() : null,
    privateFetcher,
  );

  // Memoize computation of verse keys
  const recentlyReadVerseKeys = useMemo(() => {
    // Handle logged-in users (data from server)
    if (isUserLoggedIn) {
      if (!data) return [];

      if (shouldReturnVerseKeysArray) {
        return data.map((item) => makeVerseKey(item.chapterNumber, item.verseNumber));
      }

      return data.map((item) => ({
        surah: item.chapterNumber.toString(),
        ayah: item.verseNumber.toString(),
      }));
    }

    // Handle non-logged in users (data from Redux)
    const verseKeys = Object.keys(recentReadingSessions);

    if (shouldReturnVerseKeysArray) {
      return verseKeys;
    }

    return verseKeys.map((verseKey) => {
      const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
      return { surah: chapterNumber, ayah: verseNumber };
    });
  }, [data, recentReadingSessions, shouldReturnVerseKeysArray, isUserLoggedIn]);

  // Memoize computation of timestamps
  const timestamps = useMemo<(Date | undefined)[] | undefined>(() => {
    if (!shouldAlsoReturnTimestamps) return undefined;

    // Handle logged-in users (data from server)
    if (isUserLoggedIn) {
      if (!data) return [];
      return data.map((item) => {
        try {
          const date = new Date(item.updatedAt);
          // Check if date is valid
          return Number.isNaN(date.getTime()) ? undefined : date;
        } catch {
          return undefined;
        }
      });
    }

    // Handle non-logged in users (data from Redux)
    return Object.values(recentReadingSessions).map((timestamp: number) => {
      try {
        const date = new Date(timestamp);
        // Check if date is valid
        return Number.isNaN(date.getTime()) ? undefined : date;
      } catch {
        return undefined;
      }
    });
  }, [data, recentReadingSessions, shouldAlsoReturnTimestamps, isUserLoggedIn]);

  return {
    recentlyReadVerseKeys: recentlyReadVerseKeys as T extends true
      ? string[]
      : RecentlyReadVerseData[],
    isLoading: isValidating && !data,
    ...(shouldAlsoReturnTimestamps && { timestamps }),
  };
}

export default useGetRecentlyReadVerseKeys;
