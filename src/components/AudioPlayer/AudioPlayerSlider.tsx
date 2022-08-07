import React, { useContext } from 'react';

import { useActor } from '@xstate/react';
import { useRouter } from 'next/router';

import styles from './AudioPlayerSlider.module.scss';

import Slider, { Direction } from 'src/components/dls/Slider';
import useDirection from 'src/hooks/useDirection';
import { secondsFormatter } from 'src/utils/datetime';
import { logEvent } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const AudioPlayerSlider = (): JSX.Element => {
  const router = useRouter();
  const { locale } = router;
  const direction = useDirection();

  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState, send] = useActor(audioService);

  return (
    <div className={styles.container}>
      <span className={styles.currentTime}>
        {secondsFormatter(currentState.context.elapsed, locale)}
      </span>
      <div className={styles.sliderContainer}>
        <Slider
          label="audio-player"
          value={[currentState.context.elapsed]}
          onValueChange={([newTimestamp]) => {
            logEvent('audio_player_slider_value_change');
            send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
          max={currentState.context.duration}
          direction={direction as Direction}
        />
      </div>
      <span className={styles.remainingTime}>
        {secondsFormatter(currentState.context.duration, locale)}
      </span>
    </div>
  );
};

export default AudioPlayerSlider;
