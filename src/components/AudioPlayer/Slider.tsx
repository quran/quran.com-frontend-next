import React from 'react';

import classNames from 'classnames';
import range from 'lodash/range';

import styles from './Slider.module.scss';
import Split, { NUMBER_OF_SPLITS } from './SliderSplit';

import { secondsFormatter } from 'src/utils/datetime';

type SliderProps = {
  currentTime: number;
  audioDuration: number;
  setTime: (number: number) => void;
  isExpanded: boolean;
  reciterName: string;
  isMobileMinimizedForScrolling: boolean;
};

/**
 * The slider is divided into {NUMBER_OF_SPLITS} splits. These splits represent
 * the audio playback completion and are used for seeking audio at a particular time.
 */
const Slider = ({
  currentTime,
  audioDuration,
  setTime,
  isExpanded,
  reciterName,
  isMobileMinimizedForScrolling,
}: SliderProps) => {
  const splitDuration = audioDuration / NUMBER_OF_SPLITS;
  const remainingTime = audioDuration - currentTime;
  const isAudioLoaded = audioDuration !== 0; // placeholder check until we're able to retrieve the value from redux

  const splits = range(0, NUMBER_OF_SPLITS).map((index) => {
    const splitStartTime = splitDuration * index;
    const isComplete = isAudioLoaded && currentTime >= splitStartTime;
    return (
      <Split
        isComplete={isComplete}
        key={index}
        startTime={splitStartTime}
        onClick={() => setTime(splitStartTime)}
      />
    );
  });

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
          [styles.splitsContainerMinimized]: isMobileMinimizedForScrolling,
        })}
      >
        {splits}
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

export default Slider;
