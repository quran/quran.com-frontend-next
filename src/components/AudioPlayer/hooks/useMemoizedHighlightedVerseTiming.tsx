import { useRef } from 'react';

import isCurrentTimeInRange from './isCurrentTimeInRange';

import AudioFile from 'types/AudioFile';
import VerseTiming from 'types/VerseTiming';

/**
 * given a current time, return the verse that the timestamp matches currentTime
 * it will also optimize for performance, only scan the whole verses when necessary
 *
 * @returns {VerseTiming} currentHighlightedVerseTiming
 */
const useMemoizedHighlightedVerseTiming = (currentTime: number, audioFileData: AudioFile) => {
  const lastHighlightedVerse = useRef<VerseTiming>(null);
  if (!audioFileData) return null;

  if (
    lastHighlightedVerse.current &&
    isCurrentTimeInRange(
      currentTime,
      lastHighlightedVerse.current.timestampFrom,
      lastHighlightedVerse.current.timestampTo,
    )
  )
    return lastHighlightedVerse.current;

  const highlightedVerseTiming = audioFileData.verseTimings.find((verse) =>
    isCurrentTimeInRange(currentTime, verse.timestampFrom, verse.timestampTo),
  );
  lastHighlightedVerse.current = highlightedVerseTiming;
  return highlightedVerseTiming;
};

export default useMemoizedHighlightedVerseTiming;
