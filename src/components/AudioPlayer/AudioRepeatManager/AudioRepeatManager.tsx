import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { triggerPauseAudio } from '../EventTriggers';
import useActiveVerseTiming from '../hooks/useActiveVerseTiming';
import useAudioPlayerCurrentTime from '../hooks/useCurrentTime';

import useMemoizedVerseTiming from './useMemoizedVerseTiming';
import {
  checkShouldStopAudio,
  delayAudioWhenVerseChanged,
  getDelay,
  getNextProgressState,
  repeatVerseOrRange,
} from './utils';

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

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!lastActiveVerseTiming.current) return null;
    if (!audioFileData || isValidating) return null;
    if (!isInRepeatMode) return null;

    const isRangeEnded = currentTimeInMs >= verseRangeTo.timestampTo;
    const isVerseEnded = currentTimeInMs >= lastActiveVerseTiming.current.timestampTo;

    // get next state and dispatch it to redux
    const nextRepeatProgress = getNextProgressState({
      isRangeEnded,
      isVerseEnded,
      repeatProgress,
      repeatSettings,
    });
    if (!shallowEqual(repeatProgress, nextRepeatProgress))
      dispatch(setRepeatProgress(nextRepeatProgress));

    // when delayMultiplier is > 0, and repeat is not done, pause the audio then play again
    const delayInMs = getDelay({
      delayMultiplier: repeatSettings.delayMultiplier,
      verseTiming: lastActiveVerseTiming.current,
    });
    delayAudioWhenVerseChanged({
      duration: delayInMs,
      delayMultiplier: repeatSettings.delayMultiplier,
      isRangeEnded,
      isVerseEnded,
      repeatProgress,
      repeatSettings,
    });

    // When the verse ended, repeat the verse itself or repeat the range
    // depending on current repeatProgress
    repeatVerseOrRange({
      isRangeEnded,
      isVerseEnded,
      verseTimestampFrom: lastActiveVerseTiming.current.timestampFrom,
      rangeTimestampFrom: verseRangeFrom.timestampFrom,
      repeatProgress,
      repeatSettings,
    });

    // when all repeat is done, stop the audio
    if (checkShouldStopAudio({ isRangeEnded, repeatProgress, repeatSettings })) {
      dispatch(exitRepeatMode());
      triggerPauseAudio();
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
