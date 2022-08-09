import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';
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
  const elapsed = useSelector(audioService, (state) => state.context.elapsed);
  const duration = useSelector(audioService, (state) => state.context.duration);

  return (
    <div className={styles.container}>
      <span className={styles.currentTime}>{secondsFormatter(elapsed, locale)}</span>
      <div className={styles.sliderContainer}>
        <Slider
          label="audio-player"
          value={[elapsed]}
          onValueChange={([newTimestamp]) => {
            logEvent('audio_player_slider_value_change');
            audioService.send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
          max={duration}
          direction={direction as Direction}
        />
      </div>
      <span className={styles.remainingTime}>{secondsFormatter(duration, locale)}</span>
    </div>
  );
};

export default AudioPlayerSlider;
