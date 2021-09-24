import React, { useMemo, useState, useEffect, useCallback } from 'react';

import classNames from 'classnames';
import range from 'lodash/range';

import { triggerSetCurrentTime } from './EventTriggers';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';
import styles from './Slider.module.scss';

import Slider from 'src/components/dls/Slider';
import { secondsFormatter } from 'src/utils/datetime';

const NUMBER_OF_SPLITS = 100;

type SliderProps = {
  audioDuration: number;
  isExpanded: boolean;
  reciterName: string;
  isMobileMinimizedForScrolling: boolean;
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
};

/**
 * The slider is divided into {NUMBER_OF_SPLITS} splits. These splits represent
 * the audio playback completion and are used for seeking audio at a particular time.
 *
 * @param {SliderProps} props
 * @returns {JSX.Element}
 */
const AudioPlayerSlider = ({
  audioDuration,
  isExpanded,
  reciterName,
  isMobileMinimizedForScrolling,
  audioPlayerElRef,
}: SliderProps): JSX.Element => {
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef);
  const remainingTime = audioDuration - currentTime;
  const isAudioLoaded = audioDuration !== 0; // placeholder check until we're able to retrieve the value from redux
  const [currentSplits, setCurrentSplits] = useState<number[]>([0]);

  const splitsStartTime = useMemo(
    () =>
      range(0, NUMBER_OF_SPLITS).map((index) => (audioDuration / NUMBER_OF_SPLITS / 1000) * index),
    [audioDuration],
  );

  useEffect(() => {
    setCurrentSplits((prevSplits) =>
      getCurrentSplit(splitsStartTime, isAudioLoaded, currentTime, prevSplits),
    );
  }, [splitsStartTime, isAudioLoaded, currentTime]);

  const handleOnValueChange = useCallback(
    (newValue: number[]) => {
      const [newSplit] = newValue;
      if (newSplit !== currentSplits[0]) {
        triggerSetCurrentTime(splitsStartTime[newValue[0]]);
      }
    },
    [currentSplits, splitsStartTime],
  );

  return (
    <div
      className={classNames(styles.container, {
        [styles.containerExpanded]: isExpanded,
        [styles.containerMinimized]: isMobileMinimizedForScrolling,
      })}
    >
      <span
        className={classNames(styles.currentTime, {
          [styles.currentTimeExpanded]: isExpanded,
          [styles.defaultAndMinimized]: isMobileMinimizedForScrolling && !isExpanded,
        })}
      >
        {secondsFormatter(currentTime)}
      </span>
      <div
        className={classNames(styles.splitsContainer, {
          [styles.splitsContainerExpanded]: isExpanded,
          [styles.hideThumb]: !isExpanded,
          [styles.splitsContainerMinimized]: isMobileMinimizedForScrolling,
        })}
      >
        <Slider
          label="audio-player"
          value={currentSplits}
          onValueChange={handleOnValueChange}
          max={NUMBER_OF_SPLITS}
        />
      </div>
      <div
        className={classNames(styles.reciterNameContainer, {
          [styles.reciterNameContainerExpanded]: isExpanded,
          [styles.reciterNameContainerMinimized]: isMobileMinimizedForScrolling,
        })}
      >
        {reciterName} <br />
      </div>
      <span className={styles.remainingTime}>{secondsFormatter(remainingTime)}</span>
    </div>
  );
};

/**
 * Detect which split we should pick by looping through each split and
 * checking which 2 consecutive splits the currentTime lies between (inclusive)
 * and picking the first of the two. e.g. :
 *
 * - currentTime = 5.3 seconds
 * - splitsStartTime = [1, 3.5, 5.6, 7.2]
 *
 * since 5.3 lies between 3.5 and 5.6 then the current split should be the one that is
 * represented by 3.5 which in this case 2 (index+1).
 *
 * This is needed when the currentTime changes not in the order of the startTime of the splits
 * for example when:
 *
 * - Seeking forward or backwards.
 * - Re-playing the current Surah.
 * - Changing the Surah entirely.
 *
 * @param {number[]} splitsStartTime the startTime of the splits
 * @param {boolean} isAudioLoaded whether the audio has been loaded or not.
 * @param {number} currentTime the current playing time.
 * @param {number[]} prevSplits the previous value of the `currentSplits` state
 * @returns {number[]}
 */
const getCurrentSplit = (
  splitsStartTime: number[],
  isAudioLoaded: boolean,
  currentTime: number,
  prevSplits: number[],
): number[] => {
  const [currentSplit] = prevSplits;
  // if the audio didn't load yet
  if (!isAudioLoaded) {
    // bail out of a state update by passing the previous array so that the Slider only re-renders on split change and not on currentTime change
    return currentSplit === 0 ? prevSplits : [0];
  }
  let newSplit = 0;
  for (let index = 0; index < splitsStartTime.length - 1; index += 1) {
    // if the current time lies between the current iteration's split and the next one, then pick the current iteration's split
    if (currentTime >= splitsStartTime[index] && currentTime <= splitsStartTime[index + 1]) {
      newSplit = index + 1;
      break;
    }
  }
  // bail out of a state update by passing the previous array so that the Slider only re-renders on split change and not on currentTime change
  return currentSplit === newSplit ? prevSplits : [newSplit];
};

export default AudioPlayerSlider;
