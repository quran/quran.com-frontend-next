/* eslint-disable react-func/max-lines-per-function */
import {
  useEffect,
  useRef,
  // useCallback
} from 'react';

import {
  // shallowEqual,
  // useDispatch,
  useSelector,
} from 'react-redux';
import useSWRImmutable from 'swr/immutable';

// import { playAudioRange } from '../EventTriggers';
import isCurrentTimeInRange from '../hooks/isCurrentTimeInRange';
import useActiveVerseTiming from '../hooks/useActiveVerseTiming';
import useAudioPlayerCurrentTime from '../hooks/useCurrentTime';

// import useMemoizedVerseTiming from './useMemoizedVerseTiming';

import { getChapterAudioData } from 'src/api';
import {
  // exitRepeatMode,
  // selectAudioData,
  selectIsInRepeatMode,
  // selectRepeatProgress,
  // selectRepeatSettings,
  // setRepeatProgress,
} from 'src/redux/slices/AudioPlayer/state';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import VerseTiming from 'types/VerseTiming';

/**
 * AudioRepeatManger
 * This component manage the repeat mode of the audio player.
 * it can:
 * - set the audio current time,
 * - delay the audio
 * - and stop the audio
 *
 * If the user is in repeat mode, the behavior of this component is as follow:
 * when the verse ends,
 * - repeat the verse if the repeatProgress.repeatEachVerse < repeatSettings.repeatEachVerse
 * - repeat the range if the repeatProgress.repeatRange < repeatSettings.repeatRange
 * - it will also delay the audio before continuing the next verse.
 *   the duration of the delay is based on duration of previous verse * delayMultiplier
 *
 *
 * This component consumes value from redux (repeatSettings, repeatProgress), which is set by RepeatAudioModal.tsx
 */

type AudioRepeatManagerProps = {
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
  reciterId: number;
  chapterId: number;
};

const AudioRepeatManager = ({
  audioPlayerElRef,
  reciterId,
  chapterId,
}: AudioRepeatManagerProps) => {
  // const repeatSettings = useSelector(selectRepeatSettings, shallowEqual);
  // const repeatProgress = useSelector(selectRepeatProgress, shallowEqual);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  // const dispatch = useDispatch();

  const { data: audioData, isValidating } = useSWRImmutable(
    makeChapterAudioDataUrl(reciterId, chapterId, true),
    () => getChapterAudioData(reciterId, chapterId, true),
  );
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef);
  const currentTimeInMs = Math.floor(currentTime * 1000);

  // We need to save lastActiveVerseTiming, because when the verse ended,
  // the currentActiveVerseTiming, is already updated to the next verse, but we need a reference to the last verse
  const lastActiveVerseTiming = useRef<VerseTiming>(null);
  const currentActiveVerseTiming = useActiveVerseTiming(currentTimeInMs, audioData);

  // const verseRangeFrom = useMemoizedVerseTiming({
  //   verseKey: repeatSettings.from,
  //   verseTimingsData: audioData?.verseTimings,
  // });

  // const verseRangeTo = useMemoizedVerseTiming({
  //   verseKey: repeatSettings.to,
  //   verseTimingsData: audioData?.verseTimings,
  // });

  // when delayMultiplier is set, delay the audio after the verse ended
  // const playAudioWithDelay = useCallback(
  //   (from: number, to: number) => {
  //     const delayInMs =
  //       (lastActiveVerseTiming.current.timestampTo - lastActiveVerseTiming.current.timestampFrom) *
  //       repeatSettings.delayMultiplier;
  //     setTimeout(() => {
  //       playAudioRange(from, to);
  //     }, delayInMs);
  //   },
  //   [repeatSettings.delayMultiplier],
  // );

  /**
   * 1) When the current verse ended,
   *   - if current repeatEachVerse progress < expected repetition, repeat current verse
   *   - otherwise continue to the next verse
   * 2) When the current range ended,
   *   - if the current repeatRange progress < expected repetition, repeat the range
   *   - otherwise stop the audio
   *   example of `range` is "1:3" - "1:5". So when current verse is "1:5" and it is ended. We will play "1:3"
   *
   * the progress is tracked in redux (`repeatProgress`), and the repetition settings is stored in redux too as `repeatSettings`
   */

  useEffect(() => {
    const audioPlayerEl = audioPlayerElRef?.current;
    if (!audioData || isValidating) return null;
    if (!isInRepeatMode) return null;

    const onPaused = () => {
      if (!lastActiveVerseTiming.current) return null;
      const currentTimestampInMs = audioPlayerEl.currentTime * 1000;

      const activeVerseTiming = audioData.verseTimings.find((verse) =>
        isCurrentTimeInRange(currentTimestampInMs, verse.timestampFrom, verse.timestampTo),
      );

      console.log(activeVerseTiming, currentTimestampInMs);

      // console.log('awww', currentTimestampInMs, lastActiveVerseTiming.current?.timestampFrom);
      // // if currentTimestamp is equal to the timestamp of the last playing verse, it means the audio is paused programatically by the media fragment URI
      // const isAudioPausedByMediaFragment = isTimestampEqual(
      //   lastActiveVerseTiming.current.timestampTo,
      //   currentTimestampInMs,
      // );
      // console.log('is is', isAudioPausedByMediaFragment);

      // if (!isAudioPausedByMediaFragment) return null;
      // console.log('www');

      // const isVerseEnded = isAudioPausedByMediaFragment;

      // When verses ended, and current repeatEachVerse progress < expected repetition
      // 1) set the current time to the beginning of the verse
      // 2) pause the audio when delayMultiplier is set
      // 3) increment repeatEachVerse progress by 1
      // if (isVerseEnded && repeatProgress.repeatEachVerse < repeatSettings.repeatEachVerse) {
      //   // triggerSetCurrentTime(lastActiveVerseTiming.current.timestampFrom / 1000);
      //   playAudioWithDelay(
      //     lastActiveVerseTiming.current.timestampFrom / 1000,
      //     lastActiveVerseTiming.current.timestampTo / 1000,
      //   );
      //   dispatch(
      //     setRepeatProgress({
      //       repeatEachVerse: repeatProgress.repeatEachVerse + 1,
      //     }),
      //   );
      //   return null;
      // }

      // const isRangeEnded = isTimestampEqual(currentTimestampInMs, verseRangeTo.timestampTo);
      // const isAudioEnded = audioPlayerElRef.current.ended;

      // When we're done repeating this verse. Reset the progress state so it can be used for the next verse repetition
      // also delay the audio when the verse changed to the next verse
      // if (isVerseEnded && repeatProgress.repeatEachVerse === repeatSettings.repeatEachVerse) {
      //   dispatch(setRepeatProgress({ repeatEachVerse: 1 }));
      //   if (!isRangeEnded) playAudioWithDelay();
      // }

      // When the range ended, and repeatRange progress < expected repetition
      // 1) set the current time to the beginning of the range
      // 2) pause the audio when the delayMultiplier is set
      // 3) increment repeatRange progress by 1
      // if (
      //   (isRangeEnded || isAudioEnded) &&
      //   repeatProgress.repeatRange < repeatSettings.repeatRange
      // ) {
      //   triggerSetCurrentTime(verseRangeFrom.timestampFrom / 1000);
      //   playAudioWithDelay();
      //   dispatch(setRepeatProgress({ repeatRange: repeatProgress.repeatRange + 1 }));
      //   triggerPlayAudio();
      //   return null;
      // }

      // if (isRangeEnded && repeatProgress.repeatRange === repeatSettings.repeatRange) {
      //   triggerPauseAudio();
      //   dispatch(setRepeatProgress({ repeatRange: 1 }));
      //   dispatch(exitRepeatMode());
      //   return null;
      // }

      return null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    audioPlayerEl.addEventListener('pause', onPaused);
    return () => {
      audioPlayerEl.removeEventListener('pause', onPaused);
    };
  }, [audioData, audioPlayerElRef, isInRepeatMode, isValidating]);

  useEffect(() => {
    lastActiveVerseTiming.current = currentActiveVerseTiming;
  }, [currentActiveVerseTiming]);

  return <></>;
};

export default AudioRepeatManager;

// const isTimestampEqual = (timestamp1: number, timestamp2: number) => {
//   console.log(timestamp1, timestamp2, timestamp1 - timestamp2, Math.abs(timestamp1 - timestamp2));
//   return Math.abs(timestamp1 - timestamp2) <= 200;
// };
