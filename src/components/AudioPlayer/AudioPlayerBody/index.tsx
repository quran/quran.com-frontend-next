import React, { useContext } from 'react';

import { useActor } from '@xstate/react';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
import { togglePlaying, triggerSeek } from '../EventTriggers';
import PlaybackControls from '../PlaybackControls';
import RadioPlaybackControl from '../RadioPlaybackControl';

import styles from './AudioPlayerBody.module.scss';

import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const AudioPlayerBody = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState] = useActor(audioService);
  const isRadioMode = !!currentState.context.radioActor;

  return (
    <>
      <div className={styles.innerContainer}>
        <AudioKeyBoardListeners
          seek={(seekDuration) => {
            triggerSeek(seekDuration);
          }}
          togglePlaying={() => togglePlaying()}
          isAudioPlayerHidden={false}
        />
        {!isRadioMode && (
          <div className={styles.sliderContainer}>
            <AudioPlayerSlider />
          </div>
        )}
      </div>
      {isRadioMode ? <RadioPlaybackControl /> : <PlaybackControls />}
    </>
  );
};

export default AudioPlayerBody;
