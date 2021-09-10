import React from 'react';
import { secondsFormatter } from 'src/utils/datetime';
import _ from 'lodash';
import classNames from 'classnames';
import { Visibility } from 'src/redux/slices/AudioPlayer/state';
import styles from './Slider.module.scss';

const NUMBER_OF_SPLITS = 100;

type SliderProps = {
  currentTime: number;
  audioDuration: number;
  setTime: (number) => void;
  visibility: Visibility;
  reciterName: string;
  isMinimized: boolean;
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
  visibility,
  reciterName,
  isMinimized,
}: SliderProps) => {
  const splitDuration = audioDuration / NUMBER_OF_SPLITS;
  const remainingTime = audioDuration - currentTime;
  const isAudioLoaded = audioDuration !== 0; // placeholder check until we're able to retrieve the value from redux
  const isExpanded = visibility === Visibility.Expanded || isMinimized;
  const isDefaultAndMinimized = isMinimized && visibility === Visibility.Default;

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
      })}
    >
      <span
        className={classNames(styles.currentTime, {
          [styles.currentTimeExpanded]: visibility === Visibility.Expanded,
          [styles.defaultAndMinimized]: isDefaultAndMinimized,
        })}
      >
        {secondsFormatter(currentTime)}
      </span>
      <div
        className={classNames(styles.splitsContainer, {
          [styles.splitsContainerExpanded]: isExpanded,
        })}
      >
        {splits}
      </div>
      <div
        className={classNames(styles.reciterNameContainer, {
          [styles.reciterNameContainerExpanded]: isExpanded,
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
