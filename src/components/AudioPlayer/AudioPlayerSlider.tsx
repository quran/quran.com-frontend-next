import React, { useMemo, useState, useEffect, useCallback } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './AudioPlayerSlider.module.scss';
import { triggerSetCurrentTime } from './EventTriggers';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';

import Slider, { Direction } from 'src/components/dls/Slider';
import useDirection from 'src/hooks/useDirection';
import { secondsFormatter } from 'src/utils/datetime';
import { logEvent } from 'src/utils/eventLogger';

const NUMBER_OF_STEPS = 100;

type SliderProps = {
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
const AudioPlayerSlider = ({ audioPlayerElRef }: SliderProps): JSX.Element => {
  const router = useRouter();
  const { locale } = router;
  const direction = useDirection();
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef, AUDIO_THROTTLE_DURATION);
  const audioDuration = audioPlayerElRef?.current?.duration || 0;

  const isAudioLoaded = audioDuration !== 0;

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setCurrentStep(getCurrentStep(currentTime, isAudioLoaded, audioDuration));
  }, [currentTime, isAudioLoaded, audioDuration]);
  const currentSteps = useMemo(() => [currentStep], [currentStep]);
  const handleOnValueChange = useCallback(
    (newValue: number[]) => {
      logEvent('audio_player_slider_value_change');
      const [newStep] = newValue;
      setCurrentStep(newStep);
      triggerSetCurrentTime(getNewCurrentTime(newStep, audioDuration));
    },
    [audioDuration],
  );

  return (
    <div className={styles.container}>
      <span className={styles.currentTime}>{secondsFormatter(currentTime, locale)}</span>
      <div className={styles.sliderContainer}>
        <Slider
          label="audio-player"
          value={currentSteps}
          onValueChange={handleOnValueChange}
          max={NUMBER_OF_STEPS}
          direction={direction as Direction}
        />
      </div>
      <span className={styles.remainingTime}>{secondsFormatter(audioDuration, locale)}</span>
    </div>
  );
};

/**
 * Get the current step that the slider needs to be set to.
 *
 * @param {number} currentTime
 * @param {boolean} isAudioLoaded
 * @param {number} audioDuration
 * @returns {number}
 */
const getCurrentStep = (
  currentTime: number,
  isAudioLoaded: boolean,
  audioDuration: number,
): number => (isAudioLoaded ? Math.floor((currentTime * NUMBER_OF_STEPS) / audioDuration) : 0);

/**
 * Calculate the new current time the needs the audioPlayer needs to be set to.
 *
 * @param {number} newStep
 * @param {number} audioDuration
 * @returns {number}
 */
const getNewCurrentTime = (newStep: number, audioDuration: number): number =>
  (newStep * audioDuration) / NUMBER_OF_STEPS;

export default AudioPlayerSlider;
