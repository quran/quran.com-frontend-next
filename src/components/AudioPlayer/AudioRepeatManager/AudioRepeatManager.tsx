import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { triggerSetCurrentTime } from '../EventTriggers';
import useActiveVerseTiming from '../hooks/useActiveVerseTiming';
import useAudioPlayerCurrentTime from '../hooks/useCurrentTime';

import useMemoizedVerseTiming from './useMemoizedVerseTiming';
import { getConditions, getNewTime, stopOrDelayAudio } from './utils';

import { getChapterAudioFile } from 'src/api';
import {
  selectIsInRepeatMode,
  selectRepeatProgress,
  selectRepeatSettings,
  setRepeatProgress,
  setRepeatSettings,
} from 'src/redux/slices/AudioPlayer/state';
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
  const repeatProgress = useSelector(selectRepeatProgress, shallowEqual);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  const dispatch = useDispatch();

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

  const verseRangeFrom = useMemoizedVerseTiming({
    verseKey: repeatSettings.from,
    verseTimingsData: audioFileData?.verseTimings,
  });

  const verseRangeTo = useMemoizedVerseTiming({
    verseKey: repeatSettings.to,
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
    } = getConditions({
      activeVerseTiming: lastActiveVerseTiming.current,
      currentTimeInMs,
      delayMultiplier: repeatSettings.delayMultiplier,
      repeatProgress,
      repeatSettings,
      verseRangeTo,
    });

    const newtime = getNewTime({
      verseTiming: lastActiveVerseTiming.current,
      shouldRepeatRange,
      shouldRepeatVerse,
      verseRangeFrom,
    });
    if (typeof newtime === 'number') triggerSetCurrentTime(newtime);

    let nextRepeatEachVerseProgress = repeatProgress.repeatEachVerse;
    if (shouldRepeatVerse) nextRepeatEachVerseProgress += 1;
    if (shouldResetVerseProgress) nextRepeatEachVerseProgress = 1;

    let nextRepeatRangeProgress = repeatProgress.repeatRange;
    if (shouldRepeatRange) nextRepeatRangeProgress += 1;
    if (shouldStopAudio) nextRepeatRangeProgress = 1;

    // dispatch when the value is different
    if (
      repeatProgress.repeatEachVerse !== nextRepeatEachVerseProgress ||
      repeatProgress.repeatRange !== nextRepeatRangeProgress
    ) {
      dispatch(
        setRepeatProgress({
          repeatEachVerse: nextRepeatEachVerseProgress,
          repeatRange: nextRepeatRangeProgress,
        }),
      );
    }

    let nextRange = { from: repeatSettings.from, to: repeatSettings.to };

    if (shouldStopAudio) {
      const { first, last } = getChapterFirstAndLastVerseKey(chapterId);
      nextRange = {
        from: first,
        to: last,
      };
    }

    if (nextRange.from !== repeatSettings.from || nextRange.to !== repeatSettings.to) {
      dispatch(setRepeatSettings({ from: nextRange.from, to: nextRange.to }));
    }

    stopOrDelayAudio({
      delayMultiplier: repeatSettings.delayMultiplier,
      verseTiming: lastActiveVerseTiming.current,
      shouldDelayAudio,
      shouldStopAudio,
    });

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeInMs]); // only check for currentTime, because it always re render when currentTimeMs change, and we don't need to listen to other changes

  useEffect(() => {
    lastActiveVerseTiming.current = currentActiveVerseTiming;
  }, [currentActiveVerseTiming]);

  return null;
};

export default AudioRepeatManager;
