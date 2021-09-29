import { useRef } from 'react';

import isCurrentTimeInRange from './isCurrentTimeInRange';

import AudioFile from 'types/AudioFile';
import VerseTiming from 'types/VerseTiming';

/**
 * given the current audio time, return the verse that the timestamp matches current audio time
 * it will also optimize for performance, only scan the whole verses when necessary
 *
 * @returns {VerseTiming} active verse timing
 */
const useActiveVerseTiming = (currentTime: number, audioFileData: AudioFile) => {
  const lastActiveVerse = useRef<VerseTiming>(null);
  if (!audioFileData) return null;

  // Mark verse as not active when the audio hasn't started playing
  if (currentTime === 0) return null;

  if (
    lastActiveVerse.current &&
    isCurrentTimeInRange(
      currentTime,
      lastActiveVerse.current.timestampFrom,
      lastActiveVerse.current.timestampTo,
    )
  )
    return lastActiveVerse.current;

  const activeVerseTiming = audioFileData.verseTimings.find((verse) =>
    isCurrentTimeInRange(currentTime, verse.timestampFrom, verse.timestampTo),
  );
  lastActiveVerse.current = activeVerseTiming;
  return activeVerseTiming;
};

export default useActiveVerseTiming;
