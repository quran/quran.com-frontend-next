import React, { useContext, useEffect } from 'react';

import { useSelector } from '@xstate/react';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
import PlaybackControls from '../PlaybackControls';
import RadioPlaybackControl from '../RadioPlaybackControl';

import styles from './AudioPlayerBody.module.scss';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import OnboardingGroup from '@/types/OnboardingGroup';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const AudioPlayerBody = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isRadioMode = useSelector(audioService, (state) => !!state.context.radioActor);
  const { isActive, activeStepGroup, activeStepIndex, nextStep } = useOnboarding();

  // If the user is in the reading experience onboarding and clicked on the play button, then we should automatically go to the next step when the audio player is mounted.
  useEffect(() => {
    if (
      isActive &&
      activeStepGroup === OnboardingGroup.READING_EXPERIENCE &&
      activeStepIndex === 1
    ) {
      nextStep();
    }
  }, [isActive, activeStepGroup, activeStepIndex, nextStep]);

  return (
    <>
      <div className={styles.innerContainer}>
        <AudioKeyBoardListeners
          togglePlaying={() => audioService.send('TOGGLE')}
          isAudioPlayerHidden={false}
        />
        {!isRadioMode && (
          <div className={styles.sliderContainer}>
            <AudioPlayerSlider />
          </div>
        )}
      </div>
      {isRadioMode ? (
        <RadioPlaybackControl radioActor={audioService.getSnapshot().context.radioActor} />
      ) : (
        <PlaybackControls />
      )}
    </>
  );
};

export default AudioPlayerBody;
