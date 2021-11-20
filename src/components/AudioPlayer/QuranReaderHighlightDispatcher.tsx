import { useRef, useEffect } from 'react';

import { shallowEqual, useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import useActiveVerseTiming from './hooks/useActiveVerseTiming';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';
import useMemoizedHighlightedWordLocation from './hooks/useMemoizedHighlightedWordLocation';

import { getChapterAudioData } from 'src/api';
import {
  HighlightedLocationState,
  initialState as defaultHighlightedLocation,
  setHighlightedLocation,
} from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import Segment from 'types/Segment';
import VerseTiming from 'types/VerseTiming';

type AudioTimestampsHighlightListenerProps = {
  reciterId: number;
  chapterId: number;
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
};

/**
 * Listen to audio player's currentTime and update highlightedLocation state
 *
 * @returns {void}
 */
const QuranReaderHighlightDispatcher = ({
  reciterId,
  chapterId,
  audioPlayerElRef,
}: AudioTimestampsHighlightListenerProps) => {
  const dispatch = useDispatch();
  const { data: audioData } = useSWRImmutable(
    makeChapterAudioDataUrl(reciterId, chapterId, true),
    () => getChapterAudioData(reciterId, chapterId, true),
  );
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef);
  const currentTimeInMs = currentTime * 1000;

  const lastHighlightedLocation = useRef(defaultHighlightedLocation);

  const currentHighlightedVerseTiming = useActiveVerseTiming(currentTimeInMs, audioData);
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
      dispatch(setHighlightedLocation(highlightedLocation));
      lastHighlightedLocation.current = highlightedLocation;
    }
  }, [currentHighlightedVerseTiming, currentHighlightedWordLocation, dispatch]);

  return null;
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
    highlightedLocation.highlightedChapter = Number(chapter);
    highlightedLocation.highlightedVerse = Number(verse);
  }
  if (currentHighlightedWordLocation) {
    const word = currentHighlightedWordLocation[0] + 1; // word location starts at 1 instead of 0, while the the data from API starts at 0
    highlightedLocation.highlightedWord = word;
  }

  return highlightedLocation;
};

export default QuranReaderHighlightDispatcher;
