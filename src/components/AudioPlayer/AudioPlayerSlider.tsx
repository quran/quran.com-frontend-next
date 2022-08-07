import React, { useMemo, useState, useCallback, useContext } from 'react';

import { useActor } from '@xstate/react';
import { useRouter } from 'next/router';

import styles from './AudioPlayerSlider.module.scss';
import { triggerSetCurrentTime } from './EventTriggers';

import Slider, { Direction } from 'src/components/dls/Slider';
import useDirection from 'src/hooks/useDirection';
import { secondsFormatter } from 'src/utils/datetime';
import { logEvent } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const NUMBER_OF_STEPS = 100;

/**
 * The slider is divided into {NUMBER_OF_STEPS} steps. These steps represent
 * the audio slider's steps that the user can slide through.
 *
 * @param {SliderProps} props
 * @returns {JSX.Element}
 */
const AudioPlayerSlider = (): JSX.Element => {
  const router = useRouter();
  const { locale } = router;
  const direction = useDirection();
  // const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef, AUDIO_THROTTLE_DURATION);

  // const isAudioLoaded = audioDuration !== 0;

  // const [currentStep, setCurrentStep] = useState(0);

  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState, send] = useActor(audioService);

  // useEffect(() => {
  //   setCurrentStep(getCurrentStep(currentTime, isAudioLoaded, audioDuration));
  // }, [currentTime, isAudioLoaded, audioDuration]);
  // const currentSteps = useMemo(() => [currentStep], [currentStep]);
  // const handleOnValueChange = useCallback(
  //   (newValue: number[]) => {
  //     logEvent('audio_player_slider_value_change');
  //     const [newStep] = newValue;
  //     setCurrentStep(newStep);
  //     triggerSetCurrentTime(getNewCurrentTime(newStep, audioDuration));
  //   },
  //   [audioDuration],
  // );

  return (
    <div className={styles.container}>
      {/* <span className={styles.currentTime}>{secondsFormatter(currentTime, locale)}</span> */}
      <div className={styles.sliderContainer}>
        <input
          style={{ width: '100%' }}
          type="range"
          min={0}
          max={currentState.context.duration}
          value={currentState.context.elapsed}
          onChange={(event) => {
            const newTimestamp = Number(event.target.value);
            send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
        />
        {/* <Slider
          label="audio-player"
          value={currentState.context.elapsed}
          onValueChange={handleOnValueChange}
          max={NUMBER_OF_STEPS}
          direction={direction as Direction}
        /> */}
      </div>
      {/* <span className={styles.remainingTime}>{secondsFormatter(audioDuration, locale)}</span> */}
    </div>
  );
};

// /**
//  * Get the current step that the slider needs to be set to.
//  *
//  * @param {number} currentTime
//  * @param {boolean} isAudioLoaded
//  * @param {number} audioDuration
//  * @returns {number}
//  */
// const getCurrentStep = (
//   currentTime: number,
//   isAudioLoaded: boolean,
//   audioDuration: number,
// ): number => (isAudioLoaded ? Math.floor((currentTime * NUMBER_OF_STEPS) / audioDuration) : 0);

// /**
//  * Calculate the new current time the needs the audioPlayer needs to be set to.
//  *
//  * @param {number} newStep
//  * @param {number} audioDuration
//  * @returns {number}
//  */
// const getNewCurrentTime = (newStep: number, audioDuration: number): number =>
//   (newStep * audioDuration) / NUMBER_OF_STEPS;

export default AudioPlayerSlider;
