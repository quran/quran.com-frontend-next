import { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { selectRecentReadingSessions } from '@/redux/slices/QuranReader/readingTracker';
import { privateFetcher } from '@/utils/auth/api';
import { makeReadingSessionsUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { makeVerseKey } from '@/utils/verse';
import ReadingSession from 'types/ReadingSession';

const useGetRecentlyReadVerseKeys = () => {
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);

  const { data, isValidating } = useSWRImmutable<ReadingSession[]>(
    isLoggedIn() ? makeReadingSessionsUrl() : null,
    privateFetcher,
  );

  const recentlyReadVerseKeys = useMemo(() => {
    if (!isLoggedIn()) {
      return Object.keys(recentReadingSessions);
    }

    if (isLoggedIn() && data?.length > 0) {
      return data.map((item) => makeVerseKey(item.chapterNumber, item.verseNumber));
    }

    return [];
  }, [data, recentReadingSessions]);

  // we don't need to pass the error because it'll fallback to an empty array
  return {
    recentlyReadVerseKeys,
    isLoading: isValidating && !data,
  };
};

export default useGetRecentlyReadVerseKeys;
