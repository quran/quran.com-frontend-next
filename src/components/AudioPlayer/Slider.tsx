import React from 'react';
import { secondsFormatter } from 'src/utils/datetime';
import _ from 'lodash';
import classNames from 'classnames';
import styles from './Slider.module.scss';

const NUMBER_OF_SPLITS = 100;

type ScreenSize = {
  desktop: boolean;
  mobile: boolean;
};

type SliderProps = {
  currentTime: number;
  audioDuration: number;
  setTime: (number) => void;
  visible: {
    currentTime: ScreenSize;
    remainingTime: ScreenSize;
    slider: ScreenSize;
  };
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
const Slider = ({ currentTime, audioDuration, setTime, visible }: SliderProps) => {
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

  const visibilityClassName = (item: ScreenSize) =>
    classNames({
      [styles.hidden]: !item.mobile,
      [styles.visible]: item.mobile,
      [styles.lgHidden]: !item.desktop,
      [styles.lgVisible]: item.desktop,
    });

  return (
    <div className={styles.container}>
      <span className={visibilityClassName(visible.currentTime)}>
        {secondsFormatter(currentTime)}
      </span>
      <div className={classNames(styles.splitsContainer, visibilityClassName(visible.slider))}>
        {splits}
      </div>
      <div className={styles.reciterNameContainer}>
        Mishary Al - Affasy <br />
      </div>
      <span className={visibilityClassName(visible.remainingTime)}>
        {secondsFormatter(remainingTime)}
      </span>
    </div>
  );
};

type SplitProps = {
  isComplete: boolean;
  startTime: number;
  onClick: () => void;
};

export default Slider;
