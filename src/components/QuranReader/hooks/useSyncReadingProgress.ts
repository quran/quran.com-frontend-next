import { useCallback, useContext, useEffect, useRef, useMemo } from 'react';

import debounce from 'lodash/debounce';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from '../observer';

import DataContext from '@/contexts/DataContext';
import useGlobalIntersectionObserver from '@/hooks/useGlobalIntersectionObserver';
import { setLastReadVerse } from '@/redux/slices/QuranReader/readingTracker';
import { UpdateReadingDayBody } from '@/types/auth/ReadingDay';
import { addReadingSession, updateReadingDay } from '@/utils/auth/api';
import { makeReadingSessionsUrl, makeStreakUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getTimezone } from '@/utils/datetime';
import mergeVerseKeys from '@/utils/mergeVerseKeys';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const READING_DAY_SYNC_TIME_MS = 5000; // 5 seconds
const READING_SESSION_DEBOUNCE_WAIT_TIME = 2000; // 2 seconds

interface UseSyncReadingProgressProps {
  isReadingPreference: boolean;
}

/**
 * This hook is responsible for syncing the user's reading progress with the backend.
 *
 * @param {UseSyncReadingProgressProps} options
 */
const useSyncReadingProgress = ({ isReadingPreference }: UseSyncReadingProgressProps) => {
  const chaptersData = useContext(DataContext);

  // this is a queue of verse keys that we need to send to the backend
  // we will clear the queue every {READING_DAY_SYNC_TIME} milliseconds after sending the data to the backend
  // it is also a Set not an array to avoid duplicate verse keys
  const verseQueue = useRef<Set<string>>(new Set());
  const dispatch = useDispatch();
  const { cache, mutate } = useSWRConfig();

  const addReadingSessionAndClearCache = useCallback(
    (chapterNumber, verseNumber) => {
      addReadingSession(chapterNumber, verseNumber).then(() => {
        cache.delete(makeReadingSessionsUrl());
      });
    },
    [cache],
  );

  const debouncedAddReadingSession = useMemo(
    () => debounce(addReadingSessionAndClearCache, READING_SESSION_DEBOUNCE_WAIT_TIME),
    [addReadingSessionAndClearCache],
  );

  // send the data to the backend and clear the SWR cache
  const updateReadingDayAndClearCache = useCallback(
    (body: UpdateReadingDayBody) => {
      updateReadingDay(body).then(() => {
        mutate(makeStreakUrl());
      });
    },
    [mutate],
  );

  // this function will be called when an element is triggered by the intersection observer
  const onElementVisible = useCallback(
    (element: Element) => {
      const lastReadVerse = getObservedVersePayload(element);

      // add the verse key to the queue
      verseQueue.current.add(lastReadVerse.verseKey);

      dispatch(
        setLastReadVerse({
          lastReadVerse,
          chaptersData,
        }),
      );

      if (isLoggedIn()) {
        const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(
          lastReadVerse.verseKey,
        );
        debouncedAddReadingSession(Number(chapterNumber), Number(verseNumber));
      }
    },
    [chaptersData, debouncedAddReadingSession, dispatch],
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    // if the user is not logged in, we don't need to sync the reading day
    // TODO: maybe we can save this in the local storage and sync it when the user logs in?
    if (isLoggedIn()) {
      const interval = setInterval(() => {
        // an array of verse ranges that we will send to the backend
        // we will get them by merging the verse keys in the queue
        let verseRanges: string[] = null;

        if (verseQueue.current.size > 0) {
          // merge the verse keys and clear the queue
          verseRanges = Array.from(mergeVerseKeys(verseQueue.current));
          verseQueue.current.clear();
        }

        const body: UpdateReadingDayBody = {
          // since this function will get called every {READING_DAY_SYNC_TIME} milliseconds,
          // we can use this value as time the user spent reading
          seconds: READING_DAY_SYNC_TIME_MS / 1000,
          timezone: getTimezone(),
        };

        if (verseRanges) {
          body.ranges = verseRanges;
        }

        // TODO: only send if the user is on this tab
        updateReadingDayAndClearCache(body);
      }, READING_DAY_SYNC_TIME_MS);

      return () => {
        clearInterval(interval);
      };
    }
  }, [chaptersData, updateReadingDayAndClearCache]);

  useGlobalIntersectionObserver(
    getOptions(isReadingPreference),
    onElementVisible,
    QURAN_READER_OBSERVER_ID,
  );
};

export default useSyncReadingProgress;
