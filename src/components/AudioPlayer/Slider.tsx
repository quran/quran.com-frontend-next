import React from 'react';
import { secondsFormatter } from 'src/utils/datetime';
import _ from 'lodash';
import classNames from 'classnames';
import styles from './Slider.module.scss';

const NUMBER_OF_SPLITS = 100;

type SliderProps = {
  currentTime: number;
  audioDuration: number;
  setTime: (number) => void;
  isExpanded: boolean;
  reciterName: string;
  isMobileMinimizedForScrolling: boolean;
};

const Split = ({ isComplete, startTime, onClick }: SplitProps) => (
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  <span
    className={classNames(styles.split, { [styles.splitCompleted]: isComplete })}
    title={secondsFormatter(startTime)}
    onClick={() => onClick()}
    style={{ width: `${100 / NUMBER_OF_SPLITS}%` }}
  />
);

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

  const splits = _.range(0, NUMBER_OF_SPLITS).map((index) => {
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

type SplitProps = {
  isComplete: boolean;
  startTime: number;
  onClick: () => void;
};

export default Slider;
