import { useEffect, useRef } from 'react';

import { getVerseTimingByVerseKey } from 'src/redux/slices/AudioPlayer/state';
import VerseTiming from 'types/VerseTiming';

// given a verse key, return the timing of the verse
export const useMemoizedVerseTiming = ({ verseKey, verseTimingsData }) => {
  const verseTiming = useRef<VerseTiming>(null);
  if (!verseTimingsData || !verseKey) return null;

  if (verseTiming.current && verseTiming.current.verseKey === verseKey) return verseTiming;
  return getVerseTimingByVerseKey(verseKey, verseTimingsData);
};

// save the repeatVerse data to the `ref`
// and reset the data when new data is received from redux
export const useRepeatVerse = (repeatSettings) => {
  const repeatVerse = useRef({
    total: 1,
    progress: 1,
  });

  useEffect(() => {
    if (!repeatSettings.from || !repeatSettings.to) return null;
    repeatVerse.current.progress = 1;
    repeatVerse.current.total = repeatSettings.repeatEachVerse;
    return null;
  }, [repeatSettings.from, repeatSettings.repeatEachVerse, repeatSettings.to]);

  return repeatVerse;
};

// save the delayMultiplier data to the `ref`
// and reset the data when new data is received from redux
export const useDelayMultiplier = (repeatSettings) => {
  const delayMultiplierBetweenVerse = useRef(0);

  useEffect(() => {
    if (!repeatSettings.from || !repeatSettings.to) return null;
    delayMultiplierBetweenVerse.current = repeatSettings.delayMultiplierBetweenVerse;
    return null;
  }, [repeatSettings.delayMultiplierBetweenVerse, repeatSettings.from, repeatSettings.to]);

  return delayMultiplierBetweenVerse.current;
};

// save the repeatRange data to the `ref`
// and reset the data when new data is received from redux
export const useRepeatRange = (repeatSettings) => {
  const repeatRange = useRef({
    total: 1,
    progress: 1,
    range: {
      from: null,
      to: null,
    },
  });

  useEffect(() => {
    if (!repeatSettings.from || !repeatSettings.to) return null;

    repeatRange.current.progress = 1;

    // set the setting
    repeatRange.current.total = repeatSettings.repeatRange;
    repeatRange.current.range.from = repeatSettings.from;
    repeatRange.current.range.to = repeatSettings.to;

    return null;
  }, [repeatSettings.from, repeatSettings.repeatRange, repeatSettings.to]);

  return repeatRange;
};
