import { useRef } from 'react';

import { getVerseTimingByVerseKey } from '@/utils/audio';
import VerseTiming from 'types/VerseTiming';

/**
 * Given a verseKey and verseTimingsData, check if it's already memoized, if it is.
 * - return the memoized value
 * - otherwise scan the VerseTimingsData and get a verseTiming for the given verseKey
 *
 * @returns {VerseTiming}
 */
const useMemoizedVerseTiming = ({ verseKey, verseTimingsData }) => {
  const verseTiming = useRef<VerseTiming>(null);
  if (!verseTimingsData || !verseKey) return null;

  if (verseTiming.current && verseTiming.current.verseKey === verseKey) return verseTiming.current;
  return getVerseTimingByVerseKey(verseKey, verseTimingsData);
};

export default useMemoizedVerseTiming;
