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
};

/**
 * The slider is divided into {NUMBER_OF_SPLITS} splits. These splits represent
 * the audio playback completion and are used for seeking audio at a particular time.
 */
const Slider = ({ currentTime, audioDuration, setTime }: SliderProps) => {
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
    <div className={styles.container}>
      {/* {secondsFormatter(currentTime)} */}
      <div className={styles.splitsContainer}>{splits}</div>
      <div className={styles.reciterNameContainer}>
        Mishary Al - Affasy <br />
      </div>
      {secondsFormatter(remainingTime)}
    </div>
  );
};

type SplitProps = {
  isComplete: boolean;
  startTime: number;
  onClick: () => void;
};

const Split = ({ isComplete, startTime, onClick }: SplitProps) => {
  return (
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    <span
      className={classNames(styles.split, { [styles.splitCompleted]: isComplete })}
      title={secondsFormatter(startTime)}
      onClick={() => onClick()}
      style={{ width: `${100 / NUMBER_OF_SPLITS}%` }}
    />
  );
};

export default Slider;
