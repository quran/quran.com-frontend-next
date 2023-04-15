/* eslint-disable react-func/max-lines-per-function */
import { useCallback, useContext, useEffect, useRef, useMemo } from 'react';

import debounce from 'lodash/debounce';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

import { useReadingProgressContext } from '../contexts/ReadingProgressContext';
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
  const verseKeysQueue = useReadingProgressContext();
  const elapsedReadingTimeInSeconds = useRef(0);
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
      verseKeysQueue.current.add(lastReadVerse.verseKey);

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
    [chaptersData, debouncedAddReadingSession, dispatch, verseKeysQueue],
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    // if the user is not logged in, we don't need to sync the reading day
    // TODO: maybe we can save this in the local storage and sync it when the user logs in?
    if (!isLoggedIn()) {
      return () => null;
    }

    const interval = setInterval(() => {
      // nothing to send
      if (verseKeysQueue.current.size === 0 && elapsedReadingTimeInSeconds.current === 0) {
        return;
      }

      // an array of verse ranges that we will send to the backend
      // we will get them by merging the verse keys in the queue
      let verseRanges: string[] = null;
      if (verseKeysQueue.current.size > 0) {
        // merge the verse keys and clear the queue
        verseRanges = Array.from(mergeVerseKeys(verseKeysQueue.current));
        verseKeysQueue.current.clear();
      }

      let seconds: number = null;
      if (elapsedReadingTimeInSeconds.current > 0) {
        seconds = elapsedReadingTimeInSeconds.current;
        elapsedReadingTimeInSeconds.current = 0;
      }

      const body: UpdateReadingDayBody = {
        timezone: getTimezone(),
      };

      if (verseRanges) {
        body.ranges = verseRanges;
      }

      if (seconds) {
        body.seconds = seconds;
      }

      updateReadingDayAndClearCache(body);
    }, READING_DAY_SYNC_TIME_MS);

    return () => {
      clearInterval(interval);
    };
  }, [chaptersData, updateReadingDayAndClearCache, verseKeysQueue]);

  // this will track user's reading time
  // also, if the user is not on the same tab, we will pause the timer
  useEffect(() => {
    if (!isLoggedIn()) {
      return () => null;
    }

    let interval: NodeJS.Timeout = null;

    const handleFocus = () => {
      if (interval) clearInterval(interval);

      interval = setInterval(() => {
        elapsedReadingTimeInSeconds.current += 1;
      }, 1000);
    };

    const handleBlur = () => {
      clearInterval(interval);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useGlobalIntersectionObserver(
    getOptions(isReadingPreference),
    onElementVisible,
    QURAN_READER_OBSERVER_ID,
  );
};

export default useSyncReadingProgress;
