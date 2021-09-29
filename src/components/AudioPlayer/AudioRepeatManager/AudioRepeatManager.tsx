import { useEffect, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { triggerSetCurrentTime } from '../EventTriggers';
import useActiveVerseTiming from '../hooks/useActiveVerseTiming';
import useAudioPlayerCurrentTime from '../hooks/useCurrentTime';

import {
  useDelayMultiplier,
  useMemoizedVerseTiming,
  useRepeatRange,
  useRepeatVerse,
} from './hooks';
import { getNewTime, getNextActions, stopOrDelayAudio } from './utils';

import { getChapterAudioFile } from 'src/api';
import { selectIsInRepeatMode, selectRepeatSettings } from 'src/redux/slices/AudioPlayer/state';
import { makeChapterAudioFilesUrl } from 'src/utils/apiPaths';
import { getChapterFirstAndLastVerseKey } from 'src/utils/verse';
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

  // we need to save lastActiveVerseTiming, because when the verse ended,
  // the currentActiveVerseTiming, is already updated to the next verse, so we need a reference to the last verse
  const lastActiveVerseTiming = useRef<VerseTiming>(null);
  const currentActiveVerseTiming = useActiveVerseTiming(currentTimeInMs, audioFileData);

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
    if (!lastActiveVerseTiming.current) return null;
    if (!audioFileData || isValidating) return null;
    if (!isInRepeatMode) return null;

    const {
      shouldDelayAudio,
      shouldRepeatRange,
      shouldRepeatVerse,
      shouldResetVerseProgress,
      shouldStopAudio,
    } = getNextActions({
      currentTimeInMs,
      delayMultiplierBetweenVerse,
      activeVerseTiming: lastActiveVerseTiming.current,
      repeatRange,
      repeatVerse,
      verseRangeTo,
    });

    const newtime = getNewTime({
      lastActiveVerseTiming,
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
      verseTiming: lastActiveVerseTiming.current,
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
    lastActiveVerseTiming.current = currentActiveVerseTiming;
  }, [currentActiveVerseTiming]);

  return null;
};

export default AudioRepeatManager;
