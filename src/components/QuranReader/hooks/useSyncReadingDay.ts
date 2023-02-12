/* eslint-disable react-func/max-lines-per-function */
import { useCallback, useContext, useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

import { getObservedVersePayload, getOptions, QURAN_READER_OBSERVER_ID } from '../observer';

import DataContext from '@/contexts/DataContext';
import useGlobalIntersectionObserver from '@/hooks/useGlobalIntersectionObserver';
import { setLastReadVerse } from '@/redux/slices/QuranReader/readingTracker';
import { UpdateReadingDayBody } from '@/types/auth/ReadingDay';
import { updateReadingDay } from '@/utils/auth/api';
import { makeReadingDaysUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getTimezone } from '@/utils/time';
import { mergeVerseKeys } from '@/utils/verseRange';

const READING_DAY_SYNC_TIME = 10000; // 10 seconds

const useSyncReadingDay = ({ isReadingPreference }: { isReadingPreference: boolean }) => {
  const chaptersData = useContext(DataContext);
  // an array to keep track of the verses that we should send to the backend
  const verseQueue = useRef<Set<string>>(new Set());
  const dispatch = useDispatch();
  const { cache } = useSWRConfig();

  const updateReadingDayAndClearCache = useCallback(
    (body: UpdateReadingDayBody) => {
      updateReadingDay(body).then(() => {
        cache.delete(makeReadingDaysUrl());
      });
    },
    [cache],
  );

  const onElementVisible = useCallback(
    (element: Element) => {
      const lastReadVerse = getObservedVersePayload(element);
      verseQueue.current.add(lastReadVerse.verseKey);

      dispatch(
        setLastReadVerse({
          lastReadVerse,
          chaptersData,
        }),
      );
    },
    [chaptersData, dispatch],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoggedIn()) return;
      let ranges: string[] = null;

      if (verseQueue.current.size > 0) {
        ranges = Array.from(mergeVerseKeys(verseQueue.current));
        verseQueue.current.clear();
      }

      const body: UpdateReadingDayBody = {
        seconds: READING_DAY_SYNC_TIME / 1000,
        timezone: getTimezone(),
      };

      if (ranges) {
        body.ranges = ranges;
      }

      updateReadingDayAndClearCache(body);
    }, READING_DAY_SYNC_TIME);

    return () => {
      clearInterval(interval);
    };
  }, [chaptersData, updateReadingDayAndClearCache]);

  useGlobalIntersectionObserver(
    getOptions(isReadingPreference),
    onElementVisible,
    QURAN_READER_OBSERVER_ID,
  );
};

export default useSyncReadingDay;
