/* eslint-disable max-lines */
import { useEffect, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { triggerSetCurrentTime } from '../EventTriggers';
import useAudioPlayerCurrentTime from '../hooks/useCurrentTime';
import useMemoizedHighlightedVerseTiming from '../hooks/useMemoizedHighlightedVerseTiming';

import { useDelayMultiplier, useMemoizedVerseTiming, useRepeatRange, useRepeatVerse } from './hook';
import {
  getChapterFirstAndLastVerseKey,
  getNewTime,
  getNextAction,
  stopOrDelayAudio,
} from './utils';

import { getChapterAudioFile } from 'src/api';
import { selectIsInRepeatMode, selectRepeatSettings } from 'src/redux/slices/AudioPlayer/state';
import { makeChapterAudioFilesUrl } from 'src/utils/apiPaths';
import VerseTiming from 'types/VerseTiming';

type AudioRepeatManagerProps = {
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
  reciterId: number;
  chapterId: number;
};
// eslint-disable-next-line react-func/max-lines-per-function
const AudioRepeatManager = ({
  audioPlayerElRef,
  reciterId,
  chapterId,
}: AudioRepeatManagerProps) => {
  const repeatSettings = useSelector(selectRepeatSettings, shallowEqual);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  const repeatVerse = useRepeatVerse(repeatSettings);
  const repeatRange = useRepeatRange(repeatSettings);
  const delayMultiplierBetweenVerse = useDelayMultiplier(repeatSettings);

  const { data: audioFileData, isValidating } = useSWRImmutable(
    makeChapterAudioFilesUrl(reciterId, chapterId, true),
    () => getChapterAudioFile(reciterId, chapterId, true),
  );
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef);
  const currentTimeInMs = Math.floor(currentTime * 1000);

  const lastHighlightedVerseTiming = useRef<VerseTiming>(null);
  const currentHighlightedVerseTiming = useMemoizedHighlightedVerseTiming(
    currentTimeInMs,
    audioFileData,
  );

  const verseRangeTo = useMemoizedVerseTiming({
    verseKey: repeatRange.current.range.to,
    verseTimingsData: audioFileData?.verseTimings,
  });

  const verseRangeFrom = useMemoizedVerseTiming({
    verseKey: repeatRange.current.range.to,
    verseTimingsData: audioFileData?.verseTimings,
  });

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!lastHighlightedVerseTiming.current) return null;
    if (!audioFileData || isValidating) return null;
    if (!isInRepeatMode) return null;

    const {
      shouldDelayAudio,
      shouldRepeatRange,
      shouldRepeatVerse,
      shouldResetVerseProgress,
      shouldStopAudio,
    } = getNextAction({
      currentTimeInMs,
      delayMultiplierBetweenVerse,
      lastHighlightedVerseTiming,
      repeatRange,
      repeatVerse,
      verseRangeTo,
    });

    const newtime = getNewTime({
      lastHighlightedVerseTiming,
      shouldRepeatRange,
      shouldRepeatVerse,
      verseRangeFrom,
    });
    if (typeof newtime === 'number') triggerSetCurrentTime(newtime);

    if (shouldRepeatVerse) repeatVerse.current.progress += 1;
    if (shouldResetVerseProgress) repeatVerse.current.progress = 1;
    if (shouldRepeatRange) repeatRange.current.progress += 1;
    if (shouldStopAudio) {
      const { first, last } = getChapterFirstAndLastVerseKey(chapterId);
      repeatRange.current.range = {
        from: first,
        to: last,
      };
    }

    stopOrDelayAudio({
      delayMultiplierBetweenVerse,
      lastHighlightedVerseTiming,
      shouldDelayAudio,
      shouldStopAudio,
    });

    return null;
  }, [
    audioFileData,
    chapterId,
    currentTimeInMs,
    delayMultiplierBetweenVerse,
    isInRepeatMode,
    isValidating,
    repeatRange,
    repeatVerse,
    verseRangeFrom,
    verseRangeTo,
  ]);

  useEffect(() => {
    lastHighlightedVerseTiming.current = currentHighlightedVerseTiming;
  }, [currentHighlightedVerseTiming]);

  return null;
};

export default AudioRepeatManager;
