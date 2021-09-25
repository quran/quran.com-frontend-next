import React, { useMemo, useState, useEffect, useCallback } from 'react';

import classNames from 'classnames';

import { triggerSetCurrentTime } from './EventTriggers';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';
import styles from './Slider.module.scss';

import Slider from 'src/components/dls/Slider';
import { secondsFormatter, milliSecondsToSeconds } from 'src/utils/datetime';

const NUMBER_OF_STEPS = 100;

type SliderProps = {
  audioDuration: number;
  reciterName: string;
  isMobileMinimizedForScrolling: boolean;
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
};

const AUDIO_THROTTLE_DURATION = 1000;

/**
 * The slider is divided into {NUMBER_OF_STEPS} steps. These steps represent
 * the audio slider's steps that the user can slide through.
 *
 * @param {SliderProps} props
 * @returns {JSX.Element}
 */
const AudioPlayerSlider = ({
  audioDuration,
  reciterName,
  isMobileMinimizedForScrolling,
  audioPlayerElRef,
}: SliderProps): JSX.Element => {
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef, AUDIO_THROTTLE_DURATION);
  const remainingTime = audioDuration - currentTime;
  const isAudioLoaded = audioDuration !== 0;
  const [currentStep, setCurrentStep] = useState(0);
  const audioDurationMilliSeconds = useMemo(
    () => milliSecondsToSeconds(audioDuration),
    [audioDuration],
  );
  useEffect(() => {
    setCurrentStep(getCurrentStep(currentTime, isAudioLoaded, audioDurationMilliSeconds));
  }, [currentTime, isAudioLoaded, audioDurationMilliSeconds]);
  const currentSteps = useMemo(() => [currentStep], [currentStep]);
  const handleOnValueChange = useCallback(
    (newValue: number[]) => {
      const [newStep] = newValue;
      setCurrentStep(newStep);
      triggerSetCurrentTime(getNewCurrentTime(newStep, audioDurationMilliSeconds));
    },
    [audioDurationMilliSeconds],
  );

  return (
    <div
      className={classNames(styles.container, {
        [styles.containerMinimized]: isMobileMinimizedForScrolling,
      })}
    >
      <span
        className={classNames(styles.currentTime, {
          [styles.defaultAndMinimized]: isMobileMinimizedForScrolling,
        })}
      >
        {secondsFormatter(currentTime)}
      </span>
      <div
        className={classNames(styles.splitsContainer, {
          [styles.splitsContainerMinimized]: isMobileMinimizedForScrolling,
        })}
      >
        <Slider
          label="audio-player"
          value={currentSteps}
          onValueChange={handleOnValueChange}
          max={NUMBER_OF_STEPS}
        />
      </div>
      <div
        className={classNames(styles.reciterNameContainer, {
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
 * Get the current step that the slider needs to be set to.
 *
 * @param {number} currentTime
 * @param {boolean} isAudioLoaded
 * @param {number} audioDurationMilliSeconds
 * @returns {number}
 */
const getCurrentStep = (
  currentTime: number,
  isAudioLoaded: boolean,
  audioDurationMilliSeconds: number,
): number =>
  isAudioLoaded ? Math.floor((currentTime * NUMBER_OF_STEPS) / audioDurationMilliSeconds) : 0;

/**
 * Calculate the new current time the needs the audioPlayer needs to be set to.
 *
 * @param {number} newStep
 * @param {number} audioDurationMilliSeconds
 * @returns {number}
 */
const getNewCurrentTime = (newStep: number, audioDurationMilliSeconds: number): number =>
  (newStep * audioDurationMilliSeconds) / NUMBER_OF_STEPS;

export default AudioPlayerSlider;
