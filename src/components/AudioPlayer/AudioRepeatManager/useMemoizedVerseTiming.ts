import { useRef } from 'react';

import { getVerseTimingByVerseKey } from 'src/utils/verse';
import VerseTiming from 'types/VerseTiming';

// given a verse key, return the timing of the verse
const useMemoizedVerseTiming = ({ verseKey, verseTimingsData }) => {
  const verseTiming = useRef<VerseTiming>(null);
  if (!verseTimingsData || !verseKey) return null;

  if (verseTiming.current && verseTiming.current.verseKey === verseKey) return verseTiming.current;
  return getVerseTimingByVerseKey(verseKey, verseTimingsData);
};

export default useMemoizedVerseTiming;
