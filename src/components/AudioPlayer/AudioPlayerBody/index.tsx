import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
import PlaybackControls from '../PlaybackControls';
import RadioPlaybackControl from '../RadioPlaybackControl';

import styles from './AudioPlayerBody.module.scss';

import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const AudioPlayerBody = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isRadioMode = useSelector(audioService, (state) => !!state.context.radioActor);

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
