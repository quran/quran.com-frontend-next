import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { triggerPauseAudio, triggerPlayAudio, triggerSetCurrentTime } from '../EventTriggers';
import useActiveVerseTiming from '../hooks/useActiveVerseTiming';
import useAudioPlayerCurrentTime from '../hooks/useCurrentTime';

import useMemoizedVerseTiming from './useMemoizedVerseTiming';

import { getChapterAudioFile } from 'src/api';
import {
  exitRepeatMode,
  selectIsInRepeatMode,
  selectRepeatProgress,
  selectRepeatSettings,
  setRepeatProgress,
} from 'src/redux/slices/AudioPlayer/state';
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

  const delayAudioWhenNeeded = () => {
    const delayInMs =
      (lastActiveVerseTiming.current.timestampTo - lastActiveVerseTiming.current.timestampFrom) *
      repeatSettings.delayMultiplier;
    if (delayInMs) {
      triggerPauseAudio();
      setTimeout(triggerPlayAudio, delayInMs);
    }
  };

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!lastActiveVerseTiming.current) return null;
    if (!audioFileData || isValidating) return null;
    if (!isInRepeatMode) return null;

    const isVerseEnded = currentTimeInMs >= lastActiveVerseTiming.current.timestampTo;
    // when verses ended, and current repeatEachVerse progress < expected repeatEachProgress
    // 1) set the current time to the beginning of the verse
    // 2) pause the audio when delayMultiplier is set
    // 3) update repeatEachVerse progress + 1
    if (isVerseEnded && repeatProgress.repeatEachVerse < repeatSettings.repeatEachVerse) {
      triggerSetCurrentTime(lastActiveVerseTiming.current.timestampFrom / 1000);
      dispatch(setRepeatProgress({ repeatEachVerse: repeatProgress.repeatEachVerse + 1 }));
      return null;
    }

    // when verse ended, repeatEachVerse progress === expected repeatEachProgress. reset the value
    if (isVerseEnded && repeatProgress.repeatEachVerse === repeatSettings.repeatEachVerse) {
      dispatch(setRepeatProgress({ repeatEachVerse: 1 }));
    }

    const isRangeEnded = currentTimeInMs >= verseRangeTo.timestampTo;
    // when the range ended, and repeatRange progress < expected repeatRange
    // 1) set the current time to the beginning of the range
    // 2) pause the audio when the delay Multiplier is set
    // 3) update repeatRange progress + 1
    if (isRangeEnded && repeatProgress.repeatRange < repeatSettings.repeatRange) {
      triggerSetCurrentTime(verseRangeFrom.timestampFrom / 1000);
      const delayInMs =
        (lastActiveVerseTiming.current.timestampTo - lastActiveVerseTiming.current.timestampFrom) *
        repeatSettings.delayMultiplier;
      if (delayInMs) {
        triggerPauseAudio();
        setTimeout(triggerPlayAudio, delayInMs);
      }
      dispatch(setRepeatProgress({ repeatRange: repeatProgress.repeatRange + 1 }));
      return null;
    }

    // when the all repeat is done. stop the audio and reset the repeat progress
    if (isRangeEnded && repeatProgress.repeatRange === repeatSettings.repeatRange) {
      triggerPauseAudio();
      dispatch(setRepeatProgress({ repeatRange: 1 }));
      dispatch(exitRepeatMode());
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeInMs]); // only check for currentTime, because it always re render when currentTimeMs change, and we don't need to listen to other changes

  useEffect(() => {
    lastActiveVerseTiming.current = currentActiveVerseTiming;
  }, [currentActiveVerseTiming]);

  return null;
};

export default AudioRepeatManager;
