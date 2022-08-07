import { useContext } from 'react';

import { useActor } from '@xstate/react';

import PlayPauseButton from './Buttons/PlayPauseButton';
import OverflowAudioPlayerActionsMenu from './OverflowAudioPlayerActionsMenu';
import styles from './PlaybackControls.module.scss';
import RepeatAudioButton from './RepeatButton';
import SeekButton, { SeekButtonType } from './SeekButton';

import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const PlaybackControls = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState] = useActor(audioService);

  const isLoading = currentState.hasTag('loading');

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <RepeatAudioButton />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.PrevAyah} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <PlayPauseButton />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.NextAyah} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <OverflowAudioPlayerActionsMenu />
      </div>
    </div>
  );
};

export default PlaybackControls;
