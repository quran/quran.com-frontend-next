import { useRef } from 'react';

import isCurrentTimeInRange from './isCurrentTimeInRange';

import Segment from 'types/Segment';
import VerseTiming from 'types/VerseTiming';

/**
 * given currentTime and currentHighlightedVerseTiming, return the word location that the timestamp matches currentTime
 * it will also optimize for performance, only scan the whole segment when necessary
 *
 * @returns {Segment} currentHighlightedWordLocation
 */
const useMemoizedHighlightedWordLocation = (
  currentTime: number,
  currentHighlightedVerseTiming: VerseTiming,
) => {
  const lastHighlightedWordLocation = useRef<Segment>(null);
  if (!currentHighlightedVerseTiming) return null;

  // Do not highlight the verse when the audio hasn't started playing
  if (currentTime === 0) return null;

  if (lastHighlightedWordLocation.current) {
    const [, timestampFrom, timestampTo] = lastHighlightedWordLocation.current;
    if (isCurrentTimeInRange(currentTime, timestampFrom, timestampTo)) {
      return lastHighlightedWordLocation.current;
    }
  }

  const highlightedWordLocation = currentHighlightedVerseTiming.segments.find((segment) => {
    const [, timestampFrom, timestampTo] = segment; // the structure of the segment is: [wordLocation, timestampFrom, timestampTo]
    return isCurrentTimeInRange(currentTime, timestampFrom, timestampTo);
  });
  lastHighlightedWordLocation.current = highlightedWordLocation;

  return highlightedWordLocation;
};

export default useMemoizedHighlightedWordLocation;
