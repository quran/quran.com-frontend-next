import { useRef } from 'react';

import isCurrentTimeInRange from './isCurrentTimeInRange';

import AudioFile from 'types/AudioFile';
import VerseTiming from 'types/VerseTiming';

/**
 * Given the current audio time and audioFileDAta
 * - Find the verseTiming that the timing matches the current audio time, from audioFileData
 * - if a memoized verseTiming is found, return it if the timing matches current audio time. So we don't need to re scan the audioFileData
 * - special case: if the currentTime is 0, return null
 *
 * @returns {VerseTiming} active verse timing
 */
const useActiveVerseTiming = (currentTime: number, audioFileData: AudioFile): VerseTiming => {
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
