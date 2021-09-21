import { useRef, useEffect } from 'react';

import { shallowEqual, useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getChapterAudioFile } from 'src/api';
import {
  HighlightedLocationState,
  initialState as defaultHighlightedLocation,
  setHighlightedLocation,
} from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeChapterAudioFiles } from 'src/utils/apiPaths';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import AudioFile from 'types/AudioFile';
import Segment from 'types/Segment';
import VerseTiming from 'types/VerseTiming';

type AudioTimestampsHighlightListenerProps = {
  reciterId: number;
  chapterId: number;
  currentTime: number;
};

/**
 * Listen to audio player's currentTime and update highlightedLocation state
 *
 * @returns {void}
 */
const HighlightedLocationUpdater = ({
  reciterId,
  chapterId,
  currentTime,
}: AudioTimestampsHighlightListenerProps) => {
  const dispatch = useDispatch();
  const { data: audioFileData } = useSWRImmutable(
    makeChapterAudioFiles(reciterId, chapterId, true),
    () => getChapterAudioFile(reciterId, chapterId, true),
  );
  const currentTimeInMs = currentTime * 1000;

  const lastHighlightedLocation = useRef(defaultHighlightedLocation);

  const currentHighlightedVerseTiming = useMemoizedHighlightedVerseTiming(
    currentTimeInMs,
    audioFileData,
  );
  const currentHighlightedWordLocation = useMemoizedHighlightedWordLocation(
    currentTimeInMs,
    currentHighlightedVerseTiming,
  );

  useEffect(() => {
    const highlightedLocation = getHighlightedLocation(
      currentHighlightedVerseTiming,
      currentHighlightedWordLocation,
    );
    // only update redux value if current highlight value does not equal prev value
    if (!shallowEqual(highlightedLocation, lastHighlightedLocation.current)) {
      console.log('scanning verses');
      dispatch(setHighlightedLocation(highlightedLocation));
      lastHighlightedLocation.current = highlightedLocation;
    }
  }, [currentHighlightedVerseTiming, currentHighlightedWordLocation, dispatch]);

  return null;
};

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
    currentTime >= lastHighlightedVerse.current.timestampFrom &&
    currentTime <= lastHighlightedVerse.current.timestampTo
  )
    return lastHighlightedVerse.current;

  console.log('scanning verses');
  const highlightedVerseTiming = audioFileData.verseTimings.find(
    (verse) => currentTime >= verse.timestampFrom && currentTime <= verse.timestampTo,
  );
  lastHighlightedVerse.current = highlightedVerseTiming;
  return highlightedVerseTiming;
};

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

  if (lastHighlightedWordLocation.current) {
    const [, timestampFrom, timestampTo] = lastHighlightedWordLocation.current;
    if (currentTime >= timestampFrom && currentTime <= timestampTo)
      return lastHighlightedWordLocation.current;
  }

  console.log('scanning segments');
  const highlightedWordLocation = currentHighlightedVerseTiming.segments.find((segment) => {
    const [, timestampFrom, timestampTo] = segment; // the structure of the segment is: [wordLocation, timestampFrom, timestampTo]
    return currentTime >= timestampFrom && currentTime <= timestampTo;
  });
  lastHighlightedWordLocation.current = highlightedWordLocation;

  return highlightedWordLocation;
};

/**
 * given a verseTiming and a Segment, combine them together to produce
 * a HighlightedLocationState that can be dispatched into redux
 *
 * @param {VerseTiming} currentHighlightedVerseTiming
 * @param {Segment} currentHighlightedWordLocation
 * @returns {HighlightedLocationState} highlightedLocation
 */
const getHighlightedLocation = (
  currentHighlightedVerseTiming: VerseTiming,
  currentHighlightedWordLocation: Segment,
): HighlightedLocationState => {
  const highlightedVerseKey = currentHighlightedVerseTiming?.verseKey;
  const highlightedLocation = { ...defaultHighlightedLocation };
  if (highlightedVerseKey) {
    const [chapter, verse] = getVerseAndChapterNumbersFromKey(highlightedVerseKey);
    highlightedLocation.chapter = Number(chapter);
    highlightedLocation.verse = Number(verse);
  }
  if (currentHighlightedWordLocation) {
    const word = currentHighlightedWordLocation[0] + 1; // word location starts at 1 instead of 0, while the the data from API starts at 0
    highlightedLocation.word = word;
  }

  return highlightedLocation;
};

export default HighlightedLocationUpdater;
